// Initialize Database Script
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Your Render PostgreSQL connection
const connectionString = 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require'

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function initDatabase() {
  console.log('🗄️ Connecting to Render PostgreSQL database...')
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📝 Creating tables and schema...')
    
    // Execute the schema
    await pool.query(schema)
    
    console.log('✅ Database initialized successfully!')
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('\n📊 Tables created:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
    // Check products
    const products = await pool.query('SELECT * FROM products')
    console.log('\n💰 Products configured:')
    products.rows.forEach(product => {
      console.log(`  - ${product.name}: $${product.price_cents/100} (${product.product_type})`)
    })
    
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  } finally {
    await pool.end()
    console.log('\n🔒 Database connection closed')
  }
}

// Run the initialization
initDatabase()