// Update Stripe Price IDs in database
const { Pool } = require('pg')

const connectionString = 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require'

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function updatePriceIds() {
  console.log('🔄 Updating Stripe Price IDs...')
  
  try {
    // Update Du'a Generator with your provided Price ID
    await pool.query(`
      UPDATE products 
      SET stripe_price_id = 'price_1S6pOZF5UL32ywGmg9RM5AqQ' 
      WHERE product_type = 'dua_generator'
    `)
    console.log('✅ Du\'a Generator Price ID updated: price_1S6pOZF5UL32ywGmg9RM5AqQ')
    
    // Check current products and their Price IDs
    const result = await pool.query('SELECT * FROM products ORDER BY id')
    
    console.log('\n📊 Current Products:')
    result.rows.forEach(product => {
      console.log(`  - ${product.name}: $${product.price_cents/100} (${product.product_type})`)
      console.log(`    Stripe Price ID: ${product.stripe_price_id || 'NOT SET'}`)
      console.log('')
    })
    
    console.log('\n🚨 NEXT STEPS:')
    console.log('1. Create Stripe products for Story Generator and Poster Generator')
    console.log('2. Get their Price IDs from Stripe Dashboard')
    console.log('3. Run this script again to update them')
    
  } catch (error) {
    console.error('❌ Error updating Price IDs:', error)
  } finally {
    await pool.end()
    console.log('\n🔒 Database connection closed')
  }
}

updatePriceIds()