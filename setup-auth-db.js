const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function setupAuthTables() {
  try {
    console.log('🔧 Setting up authentication database schema...\n');

    // Add password field to users table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
        ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
        ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
        ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP
      `);
      console.log('✅ Enhanced users table with authentication fields');
    } catch (err) {
      console.log('⚠️ Users table enhancement:', err.message);
    }

    // Create admin users (you can change these)
    try {
      // Check if admin exists
      const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@barakahtool.com']);

      if (adminCheck.rows.length === 0) {
        // Create admin user (password will be hashed when login system is implemented)
        await pool.query(`
          INSERT INTO users (email, name, role, email_verified, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, ['admin@barakahtool.com', 'Admin User', 'admin', true]);
        console.log('✅ Created admin user: admin@barakahtool.com');
      } else {
        console.log('ℹ️ Admin user already exists');
      }
    } catch (err) {
      console.log('⚠️ Admin user creation:', err.message);
    }

    // Create user_sessions table for session management
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Created user_sessions table');
    } catch (err) {
      console.log('⚠️ Sessions table:', err.message);
    }

    // Create admin_logs table for admin actions
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_logs (
          id SERIAL PRIMARY KEY,
          admin_user_id INTEGER REFERENCES users(id),
          action VARCHAR(255) NOT NULL,
          target_user_id INTEGER REFERENCES users(id),
          details JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Created admin_logs table');
    } catch (err) {
      console.log('⚠️ Admin logs table:', err.message);
    }

    // Update user_access table to include more tracking
    try {
      await pool.query(`
        ALTER TABLE user_access
        ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY,
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD'
      `);
      console.log('✅ Enhanced user_access table');
    } catch (err) {
      console.log('⚠️ User access enhancement:', err.message);
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Summary:');
    console.log('  • Enhanced users table with authentication fields');
    console.log('  • Created admin user: admin@barakahtool.com');
    console.log('  • Created user_sessions table for session management');
    console.log('  • Created admin_logs table for audit trails');
    console.log('  • Enhanced user_access table with payment tracking');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    await pool.end();
  }
}

setupAuthTables();