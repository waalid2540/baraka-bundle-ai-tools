const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db',
  ssl: { rejectUnauthorized: false }
});

async function getPaymentStats() {
  try {
    console.log('📊 Checking payment statistics...\n');
    
    // Get total users
    const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total Users: ${totalUsersResult.rows[0].count}`);
    
    // Get completed purchases
    const completedPurchasesResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM user_purchases 
      WHERE payment_status = 'completed'
    `);
    console.log(`💰 Completed Purchases: ${completedPurchasesResult.rows[0].count}`);
    
    // Get purchases by product
    const purchasesByProductResult = await pool.query(`
      SELECT p.product_type, p.name, COUNT(up.id) as purchases
      FROM products p
      LEFT JOIN user_purchases up ON p.id = up.product_id AND up.payment_status = 'completed'
      GROUP BY p.id, p.product_type, p.name
      ORDER BY purchases DESC
    `);
    
    console.log('\n📈 Purchases by Product:');
    purchasesByProductResult.rows.forEach(row => {
      console.log(`  ${row.product_type}: ${row.purchases} purchases`);
    });
    
    // Get users with access
    const usersWithAccessResult = await pool.query(`
      SELECT DISTINCT u.email, array_agg(p.product_type) as products
      FROM users u
      JOIN user_purchases up ON u.id = up.user_id
      JOIN products p ON up.product_id = p.id
      WHERE up.payment_status = 'completed'
      GROUP BY u.id, u.email
      ORDER BY u.email
    `);
    
    console.log('\n👤 Users with Paid Access:');
    if (usersWithAccessResult.rows.length === 0) {
      console.log('  No paid users found');
    } else {
      usersWithAccessResult.rows.forEach(row => {
        console.log(`  ${row.email}: ${row.products.join(', ')}`);
      });
    }
    
    // Get recent purchases
    const recentPurchasesResult = await pool.query(`
      SELECT u.email, p.product_type, up.amount_paid_cents, up.purchased_at
      FROM user_purchases up
      JOIN users u ON up.user_id = u.id
      JOIN products p ON up.product_id = p.id
      WHERE up.payment_status = 'completed'
      ORDER BY up.purchased_at DESC
      LIMIT 10
    `);
    
    console.log('\n🕒 Recent Purchases:');
    if (recentPurchasesResult.rows.length === 0) {
      console.log('  No recent purchases found');
    } else {
      recentPurchasesResult.rows.forEach(row => {
        const amount = (row.amount_paid_cents / 100).toFixed(2);
        const date = new Date(row.purchased_at).toLocaleDateString();
        console.log(`  ${row.email} - ${row.product_type} - $${amount} - ${date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking payment stats:', error);
  } finally {
    await pool.end();
  }
}

getPaymentStats();