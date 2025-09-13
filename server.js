// BarakahBundle Payment API Server
// Handles Stripe payments and PostgreSQL user management

const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const stripe = require('stripe')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY)

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
    
    // Get Stripe Price ID from environment variables
    let stripePriceId
    switch (product_type) {
      case 'dua_generator':
        stripePriceId = process.env.STRIPE_DUA_PRICE_ID
        break
      case 'story_generator':
        stripePriceId = process.env.STRIPE_STORY_PRICE_ID
        break
      case 'poster_generator':
        stripePriceId = process.env.STRIPE_POSTER_PRICE_ID
        break
      default:
        return res.status(400).json({ error: 'Invalid product type' })
    }
    
    if (!stripePriceId) {
      console.error(`❌ Missing Stripe Price ID for ${product_type}`)
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
      payment_intent_id: session.payment_intent 
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