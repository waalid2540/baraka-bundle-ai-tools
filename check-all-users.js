const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db',
  ssl: { rejectUnauthorized: false }
});

async function getAllUserDetails() {
  try {
    console.log('🔍 Checking all user details...\n');
    
    // Get all users with their registration info
    const allUsersResult = await pool.query(`
      SELECT id, email, name, stripe_customer_id, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    console.log(`👥 All Registered Users (${allUsersResult.rows.length}):`);
    for (const user of allUsersResult.rows) {
      const date = new Date(user.created_at).toLocaleDateString();
      console.log(`  ${user.id}: ${user.email} ${user.name ? '(' + user.name + ')' : ''} - ${date}`);
      
      // Check if they have any purchases
      const purchasesResult = await pool.query(`
        SELECT p.product_type, up.payment_status, up.amount_paid_cents, up.purchased_at
        FROM user_purchases up
        JOIN products p ON up.product_id = p.id
        WHERE up.user_id = $1
        ORDER BY up.purchased_at DESC
      `, [user.id]);
      
      if (purchasesResult.rows.length > 0) {
        purchasesResult.rows.forEach(purchase => {
          const amount = (purchase.amount_paid_cents / 100).toFixed(2);
          const purchaseDate = new Date(purchase.purchased_at).toLocaleDateString();
          console.log(`    💰 ${purchase.product_type}: $${amount} - ${purchase.payment_status} - ${purchaseDate}`);
        });
      } else {
        console.log(`    📝 No purchases yet`);
      }
      
      // Check usage logs
      const usageResult = await pool.query(`
        SELECT product_type, action, COUNT(*) as count, MAX(created_at) as last_used
        FROM usage_logs
        WHERE user_id = $1
        GROUP BY product_type, action
        ORDER BY last_used DESC
      `, [user.id]);
      
      if (usageResult.rows.length > 0) {
        console.log(`    📊 Usage:`);
        usageResult.rows.forEach(usage => {
          const lastUsed = new Date(usage.last_used).toLocaleDateString();
          console.log(`      ${usage.product_type} - ${usage.action}: ${usage.count} times (last: ${lastUsed})`);
        });
      }
      console.log(''); // Empty line between users
    }
    
    // Get all user sessions
    const sessionsResult = await pool.query(`
      SELECT u.email, s.session_token, s.created_at, s.expires_at
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);
    
    console.log('\n🔐 Recent Sessions:');
    if (sessionsResult.rows.length === 0) {
      console.log('  No sessions found');
    } else {
      sessionsResult.rows.forEach(session => {
        const created = new Date(session.created_at).toLocaleString();
        const expires = new Date(session.expires_at).toLocaleString();
        console.log(`  ${session.email} - Created: ${created} - Expires: ${expires}`);
      });
    }
    
    // Get failed/pending purchases
    const failedPurchasesResult = await pool.query(`
      SELECT u.email, p.product_type, up.payment_status, up.amount_paid_cents, up.purchased_at
      FROM user_purchases up
      JOIN users u ON up.user_id = u.id
      JOIN products p ON up.product_id = p.id
      WHERE up.payment_status != 'completed'
      ORDER BY up.purchased_at DESC
    `);
    
    console.log('\n❌ Failed/Pending Purchases:');
    if (failedPurchasesResult.rows.length === 0) {
      console.log('  No failed or pending purchases');
    } else {
      failedPurchasesResult.rows.forEach(purchase => {
        const amount = (purchase.amount_paid_cents / 100).toFixed(2);
        const date = new Date(purchase.purchased_at).toLocaleDateString();
        console.log(`  ${purchase.email} - ${purchase.product_type} - $${amount} - ${purchase.payment_status} - ${date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking user details:', error);
  } finally {
    await pool.end();
  }
}

getAllUserDetails();