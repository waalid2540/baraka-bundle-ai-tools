const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function setDefaultPasswords() {
  try {
    console.log('🔧 Setting default passwords for users without passwords...\n');

    // Get all users without passwords
    const usersWithoutPasswords = await pool.query(`
      SELECT id, email, name
      FROM users
      WHERE password_hash IS NULL
      ORDER BY created_at
    `);

    if (usersWithoutPasswords.rows.length === 0) {
      console.log('✅ All users already have passwords set!');
      return;
    }

    console.log(`Found ${usersWithoutPasswords.rows.length} users without passwords.\n`);

    // Default password for all users
    const defaultPassword = 'password123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    console.log('Setting password for each user:\n');

    for (const user of usersWithoutPasswords.rows) {
      // Update user with password
      await pool.query(`
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2
      `, [passwordHash, user.id]);

      console.log(`✅ ${user.email} - Password set to: ${defaultPassword}`);
    }

    console.log('\n🎉 All passwords have been set!');
    console.log('\n📧 Users can now login with their email and password: password123');
    console.log('\n⚠️  IMPORTANT: Users should change their password after first login!');

    // Show summary of users with purchased features
    console.log('\n📊 Users with purchased features who can now login:');
    const purchasedUsers = await pool.query(`
      SELECT
        u.email,
        u.name,
        COUNT(DISTINCT ua.product_type) as products
      FROM users u
      INNER JOIN user_access ua ON u.id = ua.user_id AND ua.has_access = true
      GROUP BY u.email, u.name
      ORDER BY products DESC
    `);

    purchasedUsers.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.products} features purchased)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

setDefaultPasswords();