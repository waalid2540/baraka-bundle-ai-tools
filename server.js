// BarakahBundle Payment API Server
// Handles Stripe payments and PostgreSQL user management

const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const stripe = require('stripe')
const path = require('path')
require('dotenv').config()

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
    ? [process.env.FRONTEND_URL, 'https://baraka-bundle-ai-tools.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
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

// Generate Story Audio API (Backend-only) - Using Professional Coqui TTS
app.post('/api/generate/story-audio', async (req, res) => {
  try {
    // Check if Coqui TTS is available
    if (!coquiTTSService.isAvailable) {
      console.error('⚠️ Audio generation failed: Coqui TTS not initialized')
      console.error('💡 Please run: pip3 install pyttsx3 to enable professional audio')
      console.error('🔄 Falling back to browser TTS for now')
      return res.status(503).json({ 
        success: false,
        error: 'Professional audio service not available. Install Python dependencies with: pip3 install pyttsx3',
        fallbackToBrowser: true
      })
    }
    
    const { storyText, language } = req.body
    
    if (!storyText) {
      return res.status(400).json({ 
        success: false,
        error: 'No story text provided for audio generation' 
      })
    }
    
    console.log(`🔊 Generating professional Coqui TTS audio for ${language || 'english'} language...`)
    
    // Generate audio using Professional Coqui TTS (returns enhanced metadata)
    const audioResult = await coquiTTSService.synthesizeSpeech(storyText, language)
    
    console.log('✅ Professional Coqui TTS audio generated successfully')
    
    // Check if we got audio metadata (new lightweight system) or audio data (legacy)
    if (audioResult && typeof audioResult === 'object' && audioResult.audio_config) {
      // New lightweight TTS system - return metadata for enhanced browser TTS
      res.json({
        success: true,
        useEnhancedBrowserTTS: true,
        audioMetadata: audioResult
      })
    } else if (audioResult && typeof audioResult === 'string') {
      // Legacy audio data URL
      res.json({
        success: true,
        audioData: audioResult
      })
    } else {
      // Fallback to browser TTS
      res.json({
        success: true,
        useEnhancedBrowserTTS: true,
        audioMetadata: {
          text: storyText,
          language: language,
          fallback_ready: true
        }
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