const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db',
  ssl: { rejectUnauthorized: false }
});

async function debugAccess() {
  try {
    console.log('🔍 Debugging access issues...\n');
    
    // Check all paid users and their access
    const paidUsersResult = await pool.query(`
      SELECT DISTINCT u.id, u.email, u.name
      FROM users u
      JOIN user_purchases up ON u.id = up.user_id
      WHERE up.payment_status = 'completed'
      ORDER BY u.email
    `);
    
    console.log(`👥 Paid Users (${paidUsersResult.rows.length}):`);
    
    for (const user of paidUsersResult.rows) {
      console.log(`\n📧 ${user.email} (${user.name || 'No name'}):`);
      
      // Check their purchases
      const purchasesResult = await pool.query(`
        SELECT p.product_type, p.name, up.payment_status, up.purchased_at
        FROM user_purchases up
        JOIN products p ON up.product_id = p.id
        WHERE up.user_id = $1
        ORDER BY up.purchased_at DESC
      `, [user.id]);
      
      purchasesResult.rows.forEach(purchase => {
        const date = new Date(purchase.purchased_at).toLocaleDateString();
        console.log(`  💰 ${purchase.product_type}: ${purchase.payment_status} (${date})`);
      });
      
      // Test access check for each product
      for (const productType of ['dua_generator', 'story_generator', 'poster_generator']) {
        const accessResult = await pool.query(`
          SELECT COUNT(*) as count
          FROM user_purchases up
          JOIN products p ON up.product_id = p.id
          WHERE up.user_id = $1 AND p.product_type = $2 AND up.payment_status = 'completed'
        `, [user.id, productType]);
        
        const hasAccess = accessResult.rows[0].count > 0;
        console.log(`  🔐 ${productType}: ${hasAccess ? '✅' : '❌'} (count: ${accessResult.rows[0].count})`);
      }
    }
    
    // Check if there are any issues with database structure
    console.log('\n🗄️  Database Structure Check:');
    
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`Users table: ${usersCount.rows[0].count} records`);
    
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`Products table: ${productsCount.rows[0].count} records`);
    
    const purchasesCount = await pool.query('SELECT COUNT(*) FROM user_purchases');
    console.log(`Purchases table: ${purchasesCount.rows[0].count} records`);
    
    const completedPurchases = await pool.query(`SELECT COUNT(*) FROM user_purchases WHERE payment_status = 'completed'`);
    console.log(`Completed purchases: ${completedPurchases.rows[0].count} records`);
    
    // Check products table
    console.log('\n📦 Products in database:');
    const productsResult = await pool.query('SELECT id, product_type, name, price_cents FROM products ORDER BY id');
    productsResult.rows.forEach(product => {
      console.log(`  ${product.id}: ${product.product_type} - ${product.name} - $${(product.price_cents/100).toFixed(2)}`);
    });
    
    // Test a specific user's access (one of the complainers)
    console.log('\n🧪 Testing specific access checks:');
    
    // Test each paid user
    for (const user of paidUsersResult.rows) {
      console.log(`\n Testing ${user.email}:`);
      
      // Simulate the exact query the app uses
      const testAccess = await pool.query(`
        SELECT u.email, p.product_type, up.payment_status, up.purchased_at
        FROM users u
        LEFT JOIN user_purchases up ON u.id = up.user_id
        LEFT JOIN products p ON up.product_id = p.id
        WHERE u.email = $1 AND p.product_type = 'dua_generator'
      `, [user.email]);
      
      console.log(`  Query results:`, testAccess.rows);
      
      // Test getUserByEmail
      const getUserTest = await pool.query(`SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)`, [user.email]);
      console.log(`  getUserByEmail:`, getUserTest.rows.length > 0 ? '✅ Found' : '❌ Not found');
      
      if (getUserTest.rows.length > 0) {
        const userId = getUserTest.rows[0].id;
        const accessTest = await pool.query(`
          SELECT COUNT(*) as count
          FROM user_purchases up
          JOIN products p ON up.product_id = p.id
          WHERE up.user_id = $1 AND p.product_type = 'dua_generator' AND up.payment_status = 'completed'
        `, [userId]);
        
        console.log(`  checkUserAccess result: ${accessTest.rows[0].count > 0 ? '✅ Has access' : '❌ No access'} (count: ${accessTest.rows[0].count})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging access:', error);
  } finally {
    await pool.end();
  }
}

debugAccess();