const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function setupAdminPassword() {
  try {
    console.log('🔧 Setting up admin password...\n');

    const adminEmail = 'admin@barakahtool.com';
    const adminPassword = 'admin123'; // Change this to a secure password

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Update admin user with password
    const result = await pool.query(`
      UPDATE users
      SET password_hash = $1, email_verified = true, updated_at = NOW()
      WHERE email = $2
      RETURNING id, email, name, role
    `, [passwordHash, adminEmail]);

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('✅ Admin password set successfully!');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log(`👤 Role: ${admin.role}`);
      console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    } else {
      console.log('❌ Admin user not found. Creating admin user...');

      // Create admin user
      const createResult = await pool.query(`
        INSERT INTO users (email, name, password_hash, role, email_verified, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, email, name, role
      `, [adminEmail, 'Admin User', passwordHash, 'admin', true]);

      const admin = createResult.rows[0];
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log(`👤 Role: ${admin.role}`);
      console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    }

    console.log('\n🎉 Admin setup completed!');
    console.log('You can now login at: http://localhost:3002/login');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    await pool.end();
  }
}

setupAdminPassword();