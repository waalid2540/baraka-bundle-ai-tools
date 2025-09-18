// BarakahBundle Payment API Server
// Handles Stripe payments and PostgreSQL user management

const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const stripe = require('stripe')
const path = require('path')
// Import fetch for Node.js compatibility
const fetch = require('node-fetch')
// Load environment variables
// In production, these come from Render's environment variables
// In development, load from .env files
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  // Also load parent .env if it exists (for OPENAI_API_KEY in dev)
  require('dotenv').config({ path: '../.env' })
} else {
  // In production, just use dotenv to load any local .env if present
  require('dotenv').config()
}

// Debug: Log OpenAI API key status
console.log('🔍 Environment Check at Startup:')
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
if (process.env.OPENAI_API_KEY) {
  const key = process.env.OPENAI_API_KEY
  console.log('OPENAI_API_KEY format:', key.substring(0, 15) + '...' + key.substring(key.length - 4))
} else {
  console.log('⚠️ WARNING: OPENAI_API_KEY not found in environment!')
  console.log('Available OPENAI vars:', Object.keys(process.env).filter(k => k.includes('OPENAI')))
}

// OpenAI import for backend-only API calls
const { OpenAI } = require('openai')

// Coqui TTS import for professional audio generation
const coquiTTSService = require('./src/services/coquiTTSService')

const app = express()
const PORT = process.env.PORT || 3001

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY)

// Initialize OpenAI (backend only - secure)
const openaiApiKey = process.env.OPENAI_API_KEY
let openai = null

if (openaiApiKey) {
  openai = new OpenAI({
    apiKey: openaiApiKey
  })
  console.log('✅ OpenAI API initialized')
} else {
  console.warn('⚠️ OpenAI API key not found. AI features will be disabled.')
}

// Coqui TTS is open source and doesn't require cloud credentials
console.log('🔊 Using Coqui TTS for professional audio generation');

// Initialize PostgreSQL connection
const connectionString = process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require'

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://baraka-bundle-ai-tools.onrender.com', process.env.FRONTEND_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Email']
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.static(path.join(__dirname, 'dist')))

// Database connection test
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err)
})

// API Routes

// Health check endpoint with debugging info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    openai_configured: !!process.env.OPENAI_API_KEY,
    openai_key_format: process.env.OPENAI_API_KEY
      ? `${process.env.OPENAI_API_KEY.substring(0, 7)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}`
      : 'not set',
    total_env_vars: Object.keys(process.env).length
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  })
})

// Create or get user
app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body
    
    const result = await pool.query(
      'INSERT INTO users (email, name) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = $2 RETURNING *',
      [email, name]
    )
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Get user by email
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_active = true ORDER BY id')
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Get product by type
app.get('/api/products/type/:type', async (req, res) => {
  try {
    const { type } = req.params
    
    const result = await pool.query('SELECT * FROM products WHERE product_type = $1 AND is_active = true', [type])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Create Stripe checkout session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { product_type, user_email, user_name } = req.body
    
    console.log('🔄 Creating checkout session for:', product_type, user_email)
    
    // Get or create user
    const userResult = await pool.query(
      'INSERT INTO users (email, name) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = $2 RETURNING *',
      [user_email, user_name || '']
    )
    const user = userResult.rows[0]
    
    // Get product details from database
    const productResult = await pool.query('SELECT * FROM products WHERE product_type = $1', [product_type])
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    const product = productResult.rows[0]
    
    // Get Stripe Price ID from database
    const stripePriceId = product.stripe_price_id
    
    if (!stripePriceId) {
      console.error(`❌ Missing Stripe Price ID in database for ${product_type}`)
      console.error('Product data:', product)
      return res.status(500).json({ error: 'Product pricing not configured' })
    }
    
    console.log('💳 Using Stripe Price ID:', stripePriceId)
    
    // Create Stripe checkout session using Price ID
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user_email,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        product_type,
        user_id: user.id.toString(),
        user_email,
        user_name: user_name || ''
      },
      success_url: `${process.env.FRONTEND_URL || 'https://baraka-bundle-ai-tools.onrender.com'}/payment-success?session_id={CHECKOUT_SESSION_ID}&product=${product_type}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://baraka-bundle-ai-tools.onrender.com'}/payment-cancel?product=${product_type}`,
    })
    
    console.log('✅ Checkout session created:', session.id)
    res.json({ session_id: session.id, url: session.url })
  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

// Verify payment
app.post('/api/stripe/verify-payment', async (req, res) => {
  try {
    const { session_id } = req.body
    
    // Retrieve the session from Stripe
    const session = await stripeClient.checkout.sessions.retrieve(session_id)
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }
    
    const { product_type, user_id, user_email } = session.metadata
    
    // Get product details
    const productResult = await pool.query('SELECT * FROM products WHERE product_type = $1', [product_type])
    const product = productResult.rows[0]
    
    // Create purchase record
    await pool.query(`
      INSERT INTO user_purchases (user_id, product_id, stripe_payment_intent_id, stripe_session_id, amount_paid_cents, payment_status)
      VALUES ($1, $2, $3, $4, $5, 'completed')
      ON CONFLICT (stripe_payment_intent_id) 
      DO UPDATE SET payment_status = 'completed'
    `, [user_id, product.id, session.payment_intent, session_id, session.amount_total])
    
    // Grant access in user_access table
    await pool.query(`
      INSERT INTO user_access (user_id, email, product_type, has_access, payment_status, purchased_at)
      VALUES ($1, $2, $3, true, 'completed', NOW())
      ON CONFLICT (user_id, product_type) 
      DO UPDATE SET has_access = true, payment_status = 'completed', purchased_at = NOW()
    `, [user_id, user_email, product_type])
    
    res.json({ 
      success: true, 
      product_type,
      payment_intent_id: session.payment_intent,
      user_email 
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
})

// Check user access to product
app.get('/api/access/:user_id/:product_type', async (req, res) => {
  try {
    const { user_id, product_type } = req.params
    
    const result = await pool.query(`
      SELECT has_access FROM user_access 
      WHERE user_id = $1 AND product_type = $2
    `, [user_id, product_type])
    
    if (result.rows.length === 0) {
      return res.json({ has_access: false })
    }
    
    res.json({ has_access: result.rows[0].has_access })
  } catch (error) {
    console.error('Error checking access:', error)
    res.status(500).json({ error: 'Failed to check access' })
  }
})

// Check access by email
app.post('/api/access/check', async (req, res) => {
  try {
    const { email, product_type } = req.body
    
    const result = await pool.query(`
      SELECT ua.has_access, u.id as user_id 
      FROM user_access ua
      JOIN users u ON ua.user_id = u.id
      WHERE u.email = $1 AND ua.product_type = $2
    `, [email, product_type])
    
    if (result.rows.length === 0) {
      return res.json({ has_access: false, user_id: null })
    }
    
    res.json({ 
      has_access: result.rows[0].has_access,
      user_id: result.rows[0].user_id 
    })
  } catch (error) {
    console.error('Error checking access:', error)
    res.status(500).json({ error: 'Failed to check access' })
  }
})

// Stripe Webhook (handles payments automatically)
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature']
  
  try {
    const event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('🎉 Payment completed via webhook:', session.id)
      
      const { product_type, user_id, user_email } = session.metadata
      
      // Get product details
      const productResult = await pool.query('SELECT * FROM products WHERE product_type = $1', [product_type])
      const product = productResult.rows[0]
      
      // Create purchase record
      await pool.query(`
        INSERT INTO user_purchases (user_id, product_id, stripe_payment_intent_id, stripe_session_id, amount_paid_cents, payment_status)
        VALUES ($1, $2, $3, $4, $5, 'completed')
        ON CONFLICT (stripe_payment_intent_id) 
        DO UPDATE SET payment_status = 'completed'
      `, [user_id, product.id, session.payment_intent, session.id, session.amount_total])
      
      // Grant access
      await pool.query(`
        INSERT INTO user_access (user_id, email, product_type, has_access, payment_status, purchased_at)
        VALUES ($1, $2, $3, true, 'completed', NOW())
        ON CONFLICT (user_id, product_type) 
        DO UPDATE SET has_access = true, payment_status = 'completed', purchased_at = NOW()
      `, [user_id, user_email, product_type])
      
      console.log('✅ Access granted via webhook for:', user_email, product_type)
    }
    
    res.json({received: true})
  } catch (err) {
    console.error('Webhook error:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
})

// Log usage
app.post('/api/usage', async (req, res) => {
  try {
    const { user_id, product_type, action, metadata } = req.body
    
    await pool.query(`
      INSERT INTO usage_logs (user_id, product_type, action, metadata)
      VALUES ($1, $2, $3, $4)
    `, [user_id, product_type, action, JSON.stringify(metadata)])
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error logging usage:', error)
    res.status(500).json({ error: 'Failed to log usage' })
  }
})

// Kids Story Generation API (Backend-only, secure)
app.post('/api/generate/kids-story', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI service temporarily unavailable. OpenAI API key not configured.' 
      })
    }
    
    const { age, name, theme, language, mode, customPrompt } = req.body
    
    // Check user access first
    const email = req.body.email || req.headers['x-user-email']
    if (!email) {
      return res.status(401).json({ error: 'User email required' })
    }
    
    // Verify access
    const accessResult = await pool.query(`
      SELECT ua.has_access 
      FROM user_access ua
      JOIN users u ON ua.user_id = u.id
      WHERE u.email = $1 AND ua.product_type = 'story_generator'
    `, [email])
    
    if (accessResult.rows.length === 0 || !accessResult.rows[0].has_access) {
      return res.status(403).json({ error: 'Access denied. Please purchase the story generator.' })
    }
    
    // Build the prompt based on mode
    let prompt
    if (mode === 'preset') {
      prompt = `Create an Islamic children's story with these specifications:
- Main character name: ${name}
- Age group: ${age} years old
- Theme/Moral: ${theme}
- Language: ${language}

Make the story engaging, educational, and appropriate for the age group. Include specific Islamic teachings and make ${name} a relatable, positive role model for children.`
    } else {
      prompt = `Create a custom Islamic children's story based on this request: "${customPrompt}"

Requirements:
- Age group: ${age} years old
- Language: ${language}
- Make it educational and engaging for children
- Include Islamic teachings and moral lessons
- Ensure cultural sensitivity and authenticity`
    }
    
    const systemMessage = `You are an expert Islamic children's story writer. Create educational, engaging stories that teach Islamic values and morals appropriate for ${age} year olds.

CRITICAL REQUIREMENTS:
- Write story in ${language} language
- Age-appropriate content for ${age} year olds
- Include authentic Islamic teachings and values
- Reference relevant Qur'anic verses when appropriate
- Provide practical guidance for parents
- Make stories engaging and culturally appropriate

OUTPUT FORMAT: Return ONLY a valid JSON object:
{
  "title": "[Creative story title]",
  "story": "[Complete age-appropriate story]",
  "moralLesson": "[Key Islamic lesson learned]",
  "quranReference": "[Relevant Qur'an reference if applicable]",
  "arabicVerse": "[Arabic verse if included]",
  "verseTranslation": "[Translation if Arabic verse included]",
  "parentNotes": "[Discussion guidance for parents]",
  "ageGroup": "${age}",
  "theme": "[Main theme/moral of the story]"
}`

    // Call OpenAI API from backend (secure)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1200
    })
    
    const content = completion.choices[0].message.content.trim()
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const storyData = JSON.parse(jsonMatch[0])
      res.json({ success: true, data: storyData })
    } else {
      throw new Error('Invalid response format from AI')
    }
  } catch (error) {
    console.error('Story generation error:', error)
    res.status(500).json({ error: 'Failed to generate story. Please try again.' })
  }
})

// Generate Dua API (Backend-only, secure)
app.post('/api/generate/dua', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI service temporarily unavailable. OpenAI API key not configured.' 
      })
    }
    
    const { name, situation, languages } = req.body
    const email = req.body.email || req.headers['x-user-email']
    
    if (!email) {
      return res.status(401).json({ error: 'User email required' })
    }
    
    // Verify access
    const accessResult = await pool.query(`
      SELECT ua.has_access 
      FROM user_access ua
      JOIN users u ON ua.user_id = u.id
      WHERE u.email = $1 AND ua.product_type = 'dua_generator'
    `, [email])
    
    if (accessResult.rows.length === 0 || !accessResult.rows[0].has_access) {
      return res.status(403).json({ error: 'Access denied. Please purchase the dua generator.' })
    }
    
    const languageList = languages.join(', ')
    const prompt = `Generate a powerful Islamic duʿā for ${name} regarding: ${situation}.

ONLY provide translations for these languages: ${languageList}

Do NOT include any other languages - ONLY the requested ones.`

    // Build language instructions
    let languageInstructions = ''
    for (const lang of languages) {
      languageInstructions += `**Translation in ${lang}:**\n[Duʿā meaning in ${lang}]\n\n`
    }

    const systemMessage = `You are an Islamic duʿā generator designed to produce authentic, powerful, and respectful supplications inspired by the Qur'an and authentic Sunnah.

CRITICAL REQUIREMENTS:
- Write Arabic text with FULL tashkeel (diacritical marks)
- Keep duʿā short (2–5 lines), but meaningful
- Use respectful invocations
- Only authentic content from Qur'an and Sunnah
- Natural, heartfelt translations

Format output as:

**Arabic:**
[Duʿā in Arabic script WITH COMPLETE TASHKEEL]

**Transliteration:**
[Clear pronunciation guide using Latin letters]

${languageInstructions}

Tone: Uplifting, sincere, spiritually moving.`

    // Call OpenAI API from backend
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
    
    res.json({
      success: true,
      data: {
        content: completion.choices[0].message.content,
        type: 'dua',
        name: name,
        situation: situation,
        languages: languages,
        premium: true
      }
    })
  } catch (error) {
    console.error('Dua generation error:', error)
    res.status(500).json({ error: 'Failed to generate dua. Please try again.' })
  }
})

// Generate Story Audio API (Backend-only) - Using Real TTS Service
app.post('/api/generate/story-audio', async (req, res) => {
  try {
    const { storyText, language } = req.body

    if (!storyText) {
      return res.status(400).json({
        success: false,
        error: 'No story text provided for audio generation'
      })
    }

    console.log(`🔊 Generating professional audio using OpenAI TTS for ${language || 'english'} language...`)

    // Use OpenAI TTS API for high-quality audio generation
    try {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY

      console.log('🔍 Checking OpenAI API key for audio generation...')
      console.log('API Key exists:', !!OPENAI_API_KEY)
      if (OPENAI_API_KEY) {
        console.log('API Key format:', OPENAI_API_KEY.substring(0, 10) + '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4))
      }

      if (!OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY not found in environment variables')
        console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('OPENAI')))
        console.log('NODE_ENV:', process.env.NODE_ENV)
        console.log('All env var keys:', Object.keys(process.env).length, 'variables')

        // Return a specific error that the frontend can handle
        return res.status(500).json({
          success: false,
          error: 'Audio generation service not configured. Please check backend configuration.',
          details: 'OPENAI_API_KEY not found'
        })
      }

      // Language voice mapping for OpenAI TTS
      const voiceMapping = {
        'english': 'nova',    // Clear female voice
        'arabic': 'alloy',    // Best for Arabic pronunciation
        'somali': 'echo',     // Clear multilingual voice
        'urdu': 'fable',      // Good for South Asian languages
        'default': 'nova'
      }

      const voice = voiceMapping[language] || voiceMapping.default

      // Call OpenAI TTS API
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: storyText.substring(0, 4000), // OpenAI has a 4096 character limit
          voice: voice,
          speed: 0.9 // Slightly slower for kids
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ OpenAI TTS API error:')
        console.error('Status:', response.status)
        console.error('Error:', errorText)

        // Parse OpenAI error for better debugging
        let errorMessage = `OpenAI TTS API error: ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error) {
            errorMessage = errorJson.error.message || errorJson.error
            console.error('OpenAI Error Details:', errorJson.error)
          }
        } catch (e) {
          // If not JSON, use the text error
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      // Convert response to base64 for sending to frontend
      const audioBuffer = await response.arrayBuffer()
      const base64Audio = Buffer.from(audioBuffer).toString('base64')
      const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`

      console.log('✅ OpenAI TTS audio generated successfully!')

      res.json({
        success: true,
        audioData: audioDataUrl,
        type: 'openai-tts',
        quality: 'premium'
      })
    } catch (audioError) {
      console.error('❌ OpenAI TTS error:', audioError.message)
      console.error('Full error:', audioError)

      // Check if it's an API key issue
      if (audioError.message.includes('401') || audioError.message.includes('Incorrect API key')) {
        return res.status(500).json({
          success: false,
          error: 'Invalid OpenAI API key. Please check your API key configuration.',
          details: audioError.message
        })
      }

      // Check if it's a quota/billing issue
      if (audioError.message.includes('429') || audioError.message.includes('quota') || audioError.message.includes('billing')) {
        return res.status(500).json({
          success: false,
          error: 'OpenAI API quota exceeded or billing issue. Please check your OpenAI account.',
          details: audioError.message
        })
      }

      // Fallback to Google TTS (still better than browser TTS)
      console.log('📻 Falling back to Google TTS...')
      const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(storyText.substring(0, 200))}`

      res.json({
        success: true,
        audioUrl: googleUrl,
        type: 'google-tts',
        quality: 'fallback'
      })
    }
  } catch (error) {
    console.error('❌ Coqui TTS generation error:', error)
    console.error('Error details:', error.message)
    
    // More specific error messages
    let errorMessage = 'Failed to generate professional audio'
    
    if (error.message?.includes('dependencies')) {
      errorMessage = 'Professional audio service dependencies not installed. Please install Python TTS library.'
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Audio generation is taking longer than expected. Please try with shorter text.'
    } else if (error.message?.includes('process')) {
      errorMessage = 'Professional audio service process error. Please try again.'
    } else if (error.message?.includes('Python')) {
      errorMessage = 'Python TTS service not available. Please check server configuration.'
    } else {
      errorMessage = `Professional TTS failed: ${error.message}`
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage 
    })
  }
})

// Manual Access Grant Endpoint (for admin use)
app.post('/api/admin/grant-access', async (req, res) => {
  try {
    const { email, product_type, admin_key } = req.body
    
    // Simple admin key check (you should use a proper admin system)
    if (admin_key !== 'baraka_admin_2024') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    console.log(`🎁 Manual access grant requested for ${email} - ${product_type}`)
    
    // Find or create user
    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    
    if (user.rows.length === 0) {
      // Create user if doesn't exist
      const insertUser = await pool.query(
        'INSERT INTO users (email, created_at) VALUES ($1, NOW()) RETURNING *',
        [email]
      )
      user = insertUser
    }
    
    const userId = user.rows[0].id
    
    // Find product
    const product = await pool.query('SELECT * FROM products WHERE product_type = $1', [product_type])
    
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    const productId = product.rows[0].id
    
    // Grant access by creating a purchase record
    const purchaseResult = await pool.query(
      `INSERT INTO user_purchases (user_id, product_id, amount_paid_cents, currency, payment_status, purchased_at, stripe_payment_intent_id, stripe_session_id) 
       VALUES ($1, $2, 299, 'usd', 'succeeded', NOW(), 'manual_admin_grant', 'manual_admin_grant') 
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, productId]
    )
    
    console.log(`✅ Access granted to ${email} for ${product_type}`)
    
    res.json({ 
      success: true, 
      message: `Access granted to ${email} for ${product_type}`,
      purchase_id: purchaseResult.rows[0]?.id
    })
    
  } catch (error) {
    console.error('❌ Manual grant error:', error)
    res.status(500).json({ error: 'Failed to grant access' })
  }
})

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 🎨 DALL-E Image Generation Endpoint (Backend Secure)
app.post('/api/generate/dalle-image', async (req, res) => {
  console.log('🎨 DALL-E image generation request received')

  try {
    if (!openai) {
      console.error('❌ OpenAI not initialized - API key missing')
      return res.status(500).json({
        success: false,
        error: 'Image generation service not configured'
      })
    }

    const { type, title, theme, ageGroup, pageContent, pageNumber, totalPages, characterName } = req.body

    let prompt = ''

    if (type === 'book-cover') {
      prompt = `Create a beautiful children's book cover for an Islamic story titled "${title}".
      VISUAL ELEMENTS:
      - Professional children's book cover design
      - Vibrant, engaging colors perfect for ages ${ageGroup}
      - Islamic children characters in traditional modest clothing
      - Boys wearing thobe/traditional Islamic dress with kufi caps
      - Girls wearing hijab and modest colorful dresses
      - Beautiful Islamic setting (mosque, Islamic garden, or traditional home)
      COVER DESIGN:
      - Central focus on happy Islamic children
      - Islamic architectural elements in background
      - Decorative Islamic geometric patterns as borders
      - Warm, inviting atmosphere that appeals to children
      - Theme: ${theme}
      - Colors should be bright and child-friendly
      STYLE REQUIREMENTS:
      - Professional children's book cover quality
      - Characters showing Islamic values and happiness
      - Suitable for printing and publishing
      - Diverse representation of Muslim children`
    } else if (type === 'story-scene') {
      const scenePosition = pageNumber === 1 ? 'beginning' :
                          pageNumber === totalPages ? 'ending' : 'middle'

      prompt = `Create a beautiful, engaging children's book illustration for page ${pageNumber} of "${title}".
      PAGE CONTENT CONTEXT: ${pageContent?.substring(0, 300)}...
      SCENE POSITION: ${scenePosition} of the story
      VISUAL REQUIREMENTS:
      - Professional children's book illustration style
      - Colorful, warm, and engaging for ages ${ageGroup}
      - Include Islamic children characters appropriate to the story
      - Beautiful Islamic setting (mosque, Islamic home, garden, market)
      - Characters wearing modest Islamic clothing (hijab, thobe, traditional dress)
      CHARACTER GUIDELINES:
      - Show Islamic children (boys and girls) in modest traditional clothing
      - Boys: wearing thobe, kufi/cap, or traditional Islamic attire
      - Girls: wearing hijab, modest dresses, or traditional Islamic clothing
      - Diverse representation of Muslim children from different backgrounds
      - Happy, friendly expressions showing Islamic values
      STORY-SPECIFIC ELEMENTS:
      ${scenePosition === 'beginning' ? '- Opening scene introducing the main character and Islamic setting' : ''}
      ${scenePosition === 'middle' ? '- Key story moment with character interactions and Islamic values' : ''}
      ${scenePosition === 'ending' ? '- Happy resolution showing lesson learned and character growth' : ''}
      - Theme focus: ${theme}
      - Islamic decorative elements and patterns in background
      STYLE REQUIREMENTS:
      - Bright, colorful children's book art style
      - Professional quality suitable for publishing
      - Characters should match the story narrative`
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid image type'
      })
    }

    console.log('🎯 Generating image with prompt length:', prompt.length)

    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    })

    const imageUrl = response.data[0].url

    console.log('✅ DALL-E image generated successfully')

    res.json({
      success: true,
      imageUrl: imageUrl
    })
  } catch (error) {
    console.error('❌ DALL-E generation error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate image'
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BarakahBundle running on port ${PORT}`)
  console.log(`📱 Frontend: http://localhost:${PORT}`)
  console.log(`🔗 API: http://localhost:${PORT}/api`)
  console.log(`🗄️ Database: Connected to PostgreSQL`)
})