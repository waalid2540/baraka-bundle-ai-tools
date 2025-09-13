// BarakahTool Backend API
// Node.js + Express + PostgreSQL + Stripe

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { Pool } = require('pg')
const stripe = require('stripe')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY)

// Initialize PostgreSQL connection to your existing database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Database connection test
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database:', process.env.DB_NAME)
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err)
  process.exit(-1)
})

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  })
})

// USER MANAGEMENT ROUTES

// Create user
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

// Update user Stripe customer ID
app.put('/api/users/:id/stripe-customer', async (req, res) => {
  try {
    const { id } = req.params
    const { stripe_customer_id } = req.body
    
    const result = await pool.query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2 RETURNING *',
      [stripe_customer_id, id]
    )
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating Stripe customer ID:', error)
    res.status(500).json({ error: 'Failed to update Stripe customer ID' })
  }
})

// PRODUCT MANAGEMENT ROUTES

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

// STRIPE PAYMENT ROUTES

// Create Stripe checkout session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { product_type, user_id, user_email, user_name, success_url, cancel_url } = req.body
    
    // Get product details
    const productResult = await pool.query('SELECT * FROM products WHERE product_type = $1', [product_type])
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    const product = productResult.rows[0]
    
    // Create Stripe checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user_email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        product_type,
        user_id: user_id.toString(),
        user_email,
        user_name: user_name || ''
      },
      success_url,
      cancel_url,
    })
    
    res.json({ session_id: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
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
    
    // Create or update purchase record
    await pool.query(`
      INSERT INTO user_purchases (user_id, product_id, stripe_payment_intent_id, stripe_session_id, amount_paid_cents, payment_status)
      VALUES ($1, $2, $3, $4, $5, 'completed')
      ON CONFLICT (stripe_payment_intent_id) 
      DO UPDATE SET payment_status = 'completed'
    `, [user_id, product.id, session.payment_intent, session_id, session.amount_total])
    
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

// ACCESS CONTROL ROUTES

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

// Get user access for all products
app.get('/api/access/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params
    
    const result = await pool.query(`
      SELECT * FROM user_access WHERE user_id = $1
    `, [user_id])
    
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching user access:', error)
    res.status(500).json({ error: 'Failed to fetch user access' })
  }
})

// USAGE TRACKING

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

// SESSION MANAGEMENT

// Create session
app.post('/api/sessions', async (req, res) => {
  try {
    const { user_id } = req.body
    const { v4: uuidv4 } = require('uuid')
    const session_token = uuidv4()
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    await pool.query(`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES ($1, $2, $3)
    `, [user_id, session_token, expires_at])
    
    res.json({ session_token })
  } catch (error) {
    console.error('Error creating session:', error)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// Validate session
app.post('/api/sessions/validate', async (req, res) => {
  try {
    const { session_token } = req.body
    
    const result = await pool.query(`
      SELECT u.* FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_token = $1 AND s.expires_at > NOW()
    `, [session_token])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error validating session:', error)
    res.status(500).json({ error: 'Failed to validate session' })
  }
})

// Delete session (logout)
app.delete('/api/sessions/:token', async (req, res) => {
  try {
    const { token } = req.params
    
    await pool.query('DELETE FROM user_sessions WHERE session_token = $1', [token])
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    res.status(500).json({ error: 'Failed to delete session' })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BarakahTool Backend running on port ${PORT}`)
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}/api`)
  console.log(`🗄️ Database: ${process.env.DB_NAME}`)
})