const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📊 Database Tables:');
    tables.rows.forEach(row => {
      console.log('  -', row.table_name);
    });

    // Check users with access
    const usersWithAccess = await pool.query(`
      SELECT
        u.id,
        u.email,
        u.name,
        u.password_hash IS NOT NULL as has_password,
        COUNT(DISTINCT ua.product_type) as products_count
      FROM users u
      LEFT JOIN user_access ua ON u.id = ua.user_id AND ua.has_access = true
      GROUP BY u.id, u.email, u.name, u.password_hash
      ORDER BY products_count DESC, u.created_at DESC
      LIMIT 20
    `);

    console.log('\n👥 Users in System:');
    usersWithAccess.rows.forEach(row => {
      console.log(`\n📧 ${row.email}`);
      console.log(`   Name: ${row.name}`);
      console.log(`   Has Password: ${row.has_password ? 'Yes ✅' : 'No ❌'}`);
      console.log(`   Products Access: ${row.products_count}`);
    });

    // Count users without passwords
    const noPasswordUsers = await pool.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE password_hash IS NULL
    `);

    console.log(`\n⚠️  Users without passwords: ${noPasswordUsers.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();