const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db',
  ssl: { rejectUnauthorized: false }
});

async function grantAccess(email, productType, paymentIntentId = null) {
  try {
    console.log(`🔓 Granting access to ${email} for ${productType}...`);
    
    // Get user
    const userResult = await pool.query(`
      SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)
    `, [email]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`👤 Found user: ${user.email} (ID: ${user.id})`);
    
    // Get product
    const productResult = await pool.query(`
      SELECT id, name, price_cents FROM products WHERE product_type = $1
    `, [productType]);
    
    if (productResult.rows.length === 0) {
      console.log('❌ Product not found');
      return;
    }
    
    const product = productResult.rows[0];
    console.log(`📦 Product: ${product.name} - $${(product.price_cents / 100).toFixed(2)}`);
    
    // Check if they already have access
    const existingPurchase = await pool.query(`
      SELECT id FROM user_purchases 
      WHERE user_id = $1 AND product_id = $2 AND payment_status = 'completed'
    `, [user.id, product.id]);
    
    if (existingPurchase.rows.length > 0) {
      console.log('ℹ️  User already has access to this product');
      return;
    }
    
    // Create purchase record
    const purchaseResult = await pool.query(`
      INSERT INTO user_purchases (
        user_id, 
        product_id, 
        stripe_payment_intent_id, 
        payment_status, 
        amount_paid_cents, 
        purchased_at
      ) VALUES ($1, $2, $3, 'completed', $4, NOW())
      RETURNING id
    `, [user.id, product.id, paymentIntentId, product.price_cents]);
    
    const purchaseId = purchaseResult.rows[0].id;
    
    console.log('✅ Successfully granted access!');
    console.log(`📝 Purchase ID: ${purchaseId}`);
    console.log(`💰 Amount: $${(product.price_cents / 100).toFixed(2)}`);
    console.log(`🕒 Time: ${new Date().toLocaleString()}`);
    
    // Log usage
    await pool.query(`
      INSERT INTO usage_logs (user_id, product_type, action, metadata, created_at)
      VALUES ($1, $2, 'manual_access_granted', $3, NOW())
    `, [user.id, productType, JSON.stringify({ 
      granted_by: 'admin', 
      payment_intent: paymentIntentId,
      purchase_id: purchaseId 
    })]);
    
    // Verify access
    const verifyResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM user_purchases up
      JOIN products p ON up.product_id = p.id
      WHERE up.user_id = $1 AND p.product_type = $2 AND up.payment_status = 'completed'
    `, [user.id, productType]);
    
    const hasAccess = verifyResult.rows[0].count > 0;
    console.log(`🔍 Verification: ${hasAccess ? '✅ Access confirmed' : '❌ Access not found'}`);
    
  } catch (error) {
    console.error('❌ Error granting access:', error);
  } finally {
    await pool.end();
  }
}

// Get parameters from command line
const email = process.argv[2] || 'pellaqueen@gmail.com';
const productType = process.argv[3] || 'dua_generator';
const paymentIntent = process.argv[4] || 'pi_manual_' + Date.now();

console.log('🚀 Manual Access Grant Tool');
console.log(`Email: ${email}`);
console.log(`Product: ${productType}`);
console.log(`Payment Intent: ${paymentIntent}`);
console.log('---');

grantAccess(email, productType, paymentIntent);