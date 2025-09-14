const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db',
  ssl: { rejectUnauthorized: false }
});

async function updateStripePriceId(productType, stripePriceId) {
  try {
    console.log(`📝 Updating Stripe price ID for ${productType}...`);
    
    const result = await pool.query(`
      UPDATE products 
      SET stripe_price_id = $1 
      WHERE product_type = $2 
      RETURNING *
    `, [stripePriceId, productType]);
    
    if (result.rows.length > 0) {
      const product = result.rows[0];
      console.log(`✅ Successfully updated ${product.name}!`);
      console.log(`   Product: ${product.product_type}`);
      console.log(`   Price: $${(product.price_cents / 100).toFixed(2)}`);
      console.log(`   Stripe Price ID: ${product.stripe_price_id}`);
    } else {
      console.log(`❌ Product type "${productType}" not found`);
    }
    
  } catch (error) {
    console.error('❌ Error updating price ID:', error);
  } finally {
    await pool.end();
  }
}

// Get parameters from command line
const productType = process.argv[2];
const stripePriceId = process.argv[3];

if (!productType || !stripePriceId) {
  console.log(`
🛠️  Update Stripe Price ID Tool

Usage: node update-stripe-price.js <product_type> <stripe_price_id>

Example: 
  node update-stripe-price.js story_generator price_xxxxxxxxxxxxx
  node update-stripe-price.js poster_generator price_xxxxxxxxxxxxx

Available product types:
  - dua_generator (already has: price_1S6pOZF5UL32ywGmg9RM5AqQ)
  - story_generator (needs price ID)
  - poster_generator (needs price ID)

Steps to get Stripe Price ID:
1. Go to https://dashboard.stripe.com/products
2. Create a new product or select existing one
3. Set price to $2.99 for story_generator or $3.99 for poster_generator
4. Copy the price ID (starts with "price_")
5. Run this script with the price ID
  `);
  process.exit(1);
}

updateStripePriceId(productType, stripePriceId);