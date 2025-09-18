// BarakahBundle Payment API Server
// Handles Stripe payments and PostgreSQL user management

const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const stripe = require('stripe')
const path = require('path')
// Import fetch for Node.js compatibility
const fetch = require('node-fetch')
// Authentication dependencies
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'baraka_jwt_secret_2024_change_in_production'

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
})

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://baraka-bundle-ai-tools.onrender.com', process.env.FRONTEND_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Email']
}))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'dist')))

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [decoded.userId])

    if (user.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid token' })
    }

    req.user = user.rows[0]
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Database connection test
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err)
})

// API Routes

// ===== AUTHENTICATION ENDPOINTS =====

// Register endpoint
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await pool.query(`
      INSERT INTO users (email, name, password_hash, email_verified, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email, name, role, created_at
    `, [email.toLowerCase(), name, passwordHash, false])

    const user = result.rows[0]

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log(`✅ New user registered: ${email}`)

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login endpoint
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, name, password_hash, role, email_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = result.rows[0]

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log(`✅ User logged in: ${email}`)

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        email_verified: user.email_verified
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    // Get user with access information
    const userResult = await pool.query(`
      SELECT u.id, u.email, u.name, u.role, u.email_verified, u.created_at, u.last_login
      FROM users u
      WHERE u.id = $1
    `, [req.user.id])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = userResult.rows[0]

    // Get user's purchased features
    const accessResult = await pool.query(`
      SELECT product_type, has_access, purchased_at, expires_at, payment_status
      FROM user_access
      WHERE user_id = $1 AND has_access = true
    `, [user.id])

    const purchasedFeatures = accessResult.rows

    res.json({
      success: true,
      user: {
        ...user,
        purchased_features: purchasedFeatures
      }
    })

  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Failed to get user profile' })
  }
})

// Logout endpoint (invalidate token on client side)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // In a more complex setup, you'd add the token to a blacklist
    // For now, we'll just return success and let client remove the token

    console.log(`✅ User logged out: ${req.user.email}`)

    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// ===== ADMIN ENDPOINTS =====

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id, u.email, u.name, u.role, u.email_verified, u.created_at, u.last_login,
        COUNT(ua.user_id) as purchased_features_count,
        MAX(ua.purchased_at) as last_purchase
      FROM users u
      LEFT JOIN user_access ua ON u.id = ua.user_id AND ua.has_access = true
      GROUP BY u.id, u.email, u.name, u.role, u.email_verified, u.created_at, u.last_login
      ORDER BY u.created_at DESC
    `)

    res.json({
      success: true,
      users: result.rows
    })

  } catch (error) {
    console.error('Admin users error:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
})

// Get user details with purchases (admin only)
app.get('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params

    // Get user info
    const userResult = await pool.query(`
      SELECT id, email, name, role, email_verified, created_at, last_login
      FROM users WHERE id = $1
    `, [userId])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's purchases
    const accessResult = await pool.query(`
      SELECT product_type, has_access, purchased_at, expires_at, payment_status, amount_paid, currency
      FROM user_access
      WHERE user_id = $1
      ORDER BY purchased_at DESC
    `, [userId])

    res.json({
      success: true,
      user: userResult.rows[0],
      purchases: accessResult.rows
    })

  } catch (error) {
    console.error('Admin user details error:', error)
    res.status(500).json({ error: 'Failed to get user details' })
  }
})

// Grant access to user (admin only)
app.post('/api/admin/grant-access', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, product_type, expires_days = 365 } = req.body

    if (!email || !product_type) {
      return res.status(400).json({ error: 'Email and product_type are required' })
    }

    // Find user
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userId = userResult.rows[0].id

    // Calculate expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expires_days)

    // Grant access
    await pool.query(`
      INSERT INTO user_access (user_id, email, product_type, payment_status, purchased_at, expires_at, has_access)
      VALUES ($1, $2, $3, $4, NOW(), $5, $6)
      ON CONFLICT (user_id, product_type)
      DO UPDATE SET has_access = $6, expires_at = $5, purchased_at = NOW()
    `, [userId, email.toLowerCase(), product_type, 'admin_granted', expiresAt, true])

    // Log admin action
    await pool.query(`
      INSERT INTO admin_logs (admin_user_id, action, target_user_id, details)
      VALUES ($1, $2, $3, $4)
    `, [req.user.id, 'grant_access', userId, { product_type, expires_days }])

    console.log(`✅ Admin ${req.user.email} granted ${product_type} access to ${email}`)

    res.json({
      success: true,
      message: `Access granted to ${email} for ${product_type}`
    })

  } catch (error) {
    console.error('Grant access error:', error)
    res.status(500).json({ error: 'Failed to grant access' })
  }
})

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
      // DALL-E 2 has 1000 character limit - keep prompt concise
      prompt = `Beautiful children's book cover for Islamic story "${title}". Show happy Muslim children (ages ${ageGroup}) in traditional modest clothing - boys in thobe with kufi caps, girls in hijab and colorful dresses. Islamic setting with mosque or garden background. Theme: ${theme}. Bright engaging colors, professional children's book illustration style, warm atmosphere showing Islamic values and diversity.`
    } else if (type === 'story-scene') {
      const scenePosition = pageNumber === 1 ? 'beginning' :
                          pageNumber === totalPages ? 'ending' : 'middle'

      // DALL-E 2 has 1000 character limit - create focused scene prompt
      const sceneContext = pageContent ? pageContent.substring(0, 150) : ''

      prompt = `Children's book illustration page ${pageNumber} of Islamic story "${title}". ${scenePosition === 'beginning' ? 'Opening scene' : scenePosition === 'ending' ? 'Happy ending' : 'Story scene'} showing Muslim children in traditional clothing (boys in thobe/kufi, girls in hijab). Context: ${sceneContext}. Theme: ${theme}. Bright colorful style for ages ${ageGroup}, Islamic setting with ${scenePosition === 'beginning' ? 'mosque/home' : 'garden/market'}, warm atmosphere showing Islamic values.`
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid image type'
      })
    }

    console.log('🎯 Generating image with prompt length:', prompt.length)

    // Ensure prompt is under 1000 characters for DALL-E 2
    if (prompt.length > 1000) {
      console.warn(`⚠️ Prompt too long (${prompt.length} chars), truncating to 997...`)
      prompt = prompt.substring(0, 997) + '...'
    }

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

// 📸 Image Proxy Endpoint for PDF Generation (Handles CORS)
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    console.log('📸 Proxying image for PDF:', url.substring(0, 50) + '...')

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const buffer = await response.buffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    // Convert to base64 data URL
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${contentType};base64,${base64}`

    console.log('✅ Image converted to base64 for PDF')

    res.json({
      success: true,
      dataUrl: dataUrl,
      contentType: contentType
    })
  } catch (error) {
    console.error('❌ Image proxy error:', error)
    res.status(500).json({
      success: false,
      error: error.message
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