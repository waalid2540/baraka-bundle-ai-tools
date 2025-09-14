const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db',
  ssl: { rejectUnauthorized: false }
});

async function checkSpecificUser(email) {
  try {
    console.log(`🔍 Checking user: ${email}\n`);
    
    // Get user details
    const userResult = await pool.query(`
      SELECT id, email, name, stripe_customer_id, created_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
    `, [email]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`👤 User Details:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name || 'Not provided'}`);
    console.log(`  Stripe Customer ID: ${user.stripe_customer_id || 'Not set'}`);
    console.log(`  Registered: ${new Date(user.created_at).toLocaleString()}`);
    
    // Check purchases
    const purchasesResult = await pool.query(`
      SELECT p.product_type, p.name, up.payment_status, up.amount_paid_cents, 
             up.stripe_payment_intent_id, up.purchased_at, up.expires_at
      FROM user_purchases up
      JOIN products p ON up.product_id = p.id
      WHERE up.user_id = $1
      ORDER BY up.purchased_at DESC
    `, [user.id]);
    
    console.log(`\n💰 Purchase History (${purchasesResult.rows.length}):`);
    if (purchasesResult.rows.length === 0) {
      console.log('  No purchases found');
    } else {
      purchasesResult.rows.forEach(purchase => {
        const amount = (purchase.amount_paid_cents / 100).toFixed(2);
        const purchaseDate = new Date(purchase.purchased_at).toLocaleString();
        const expiresDate = purchase.expires_at ? new Date(purchase.expires_at).toLocaleString() : 'Never';
        console.log(`  ${purchase.product_type} (${purchase.name}):`);
        console.log(`    Amount: $${amount}`);
        console.log(`    Status: ${purchase.payment_status}`);
        console.log(`    Payment Intent: ${purchase.stripe_payment_intent_id || 'None'}`);
        console.log(`    Purchased: ${purchaseDate}`);
        console.log(`    Expires: ${expiresDate}`);
        console.log('');
      });
    }
    
    // Check current access
    console.log(`🔐 Current Access:`);
    for (const productType of ['dua_generator', 'story_generator', 'poster_generator']) {
      const accessResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM user_purchases up
        JOIN products p ON up.product_id = p.id
        WHERE up.user_id = $1 AND p.product_type = $2 AND up.payment_status = 'completed'
      `, [user.id, productType]);
      
      const hasAccess = accessResult.rows[0].count > 0;
      console.log(`  ${productType}: ${hasAccess ? '✅ Has Access' : '❌ No Access'}`);
    }
    
    // Check usage logs
    const usageResult = await pool.query(`
      SELECT product_type, action, metadata, created_at
      FROM usage_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [user.id]);
    
    console.log(`\n📊 Usage History (${usageResult.rows.length}):`);
    if (usageResult.rows.length === 0) {
      console.log('  No usage recorded');
    } else {
      usageResult.rows.forEach(usage => {
        const date = new Date(usage.created_at).toLocaleString();
        console.log(`  ${date}: ${usage.product_type} - ${usage.action}`);
        if (usage.metadata) {
          console.log(`    Metadata: ${JSON.stringify(usage.metadata)}`);
        }
      });
    }
    
    // Check sessions
    const sessionsResult = await pool.query(`
      SELECT session_token, created_at, expires_at, is_active
      FROM user_sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user.id]);
    
    console.log(`\n🔑 Sessions (${sessionsResult.rows.length}):`);
    if (sessionsResult.rows.length === 0) {
      console.log('  No sessions found');
    } else {
      sessionsResult.rows.forEach(session => {
        const created = new Date(session.created_at).toLocaleString();
        const expires = new Date(session.expires_at).toLocaleString();
        const status = session.is_active ? 'Active' : 'Inactive';
        console.log(`  Token: ${session.session_token.substring(0, 20)}...`);
        console.log(`  Created: ${created}`);
        console.log(`  Expires: ${expires}`);
        console.log(`  Status: ${status}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await pool.end();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'pellaqueen@gmail.com';
checkSpecificUser(email);