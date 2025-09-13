// Check payment status in database
const { Pool } = require('pg')

const connectionString = 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require'

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkPayment() {
  console.log('🔍 Checking payment records...')
  
  try {
    // Check all users
    const users = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10')
    console.log('\n👥 Recent Users:')
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}) - ${user.created_at}`)
    })

    // Check all purchases  
    const purchases = await pool.query('SELECT * FROM user_purchases ORDER BY purchased_at DESC LIMIT 10')
    console.log('\n💳 Recent Purchases:')
    purchases.rows.forEach(purchase => {
      console.log(`  - User ${purchase.user_id}, Product ${purchase.product_id}, Status: ${purchase.payment_status}, Amount: $${purchase.amount_paid_cents/100}`)
    })

    // Check all access records
    const access = await pool.query('SELECT * FROM user_access ORDER BY purchased_at DESC LIMIT 10')
    console.log('\n🔑 Access Records:')
    access.rows.forEach(acc => {
      console.log(`  - ${acc.email}: ${acc.product_type} - Access: ${acc.has_access}`)
    })

    // Check if specific email has access (replace with the email you used for payment)
    console.log('\n🎯 Test Access Check:')
    console.log('Enter the email you used for payment to check access...')
    
  } catch (error) {
    console.error('❌ Error checking payment:', error)
  } finally {
    await pool.end()
    console.log('\n🔒 Database connection closed')
  }
}

checkPayment()