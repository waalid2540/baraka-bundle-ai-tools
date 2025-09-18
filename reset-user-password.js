const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetUserPassword() {
  try {
    // Get user email
    const email = await new Promise((resolve) => {
      rl.question('Enter user email to reset password: ', resolve);
    });

    // Check if user exists
    const userCheck = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [email]);

    if (userCheck.rows.length === 0) {
      console.log('❌ User not found with email:', email);

      // Check if they have purchases
      const purchaseCheck = await pool.query('SELECT DISTINCT user_email FROM purchases WHERE user_email = $1', [email]);

      if (purchaseCheck.rows.length > 0) {
        console.log('✅ Found purchases for this email. Creating user account...');

        // Get user name from input
        const name = await new Promise((resolve) => {
          rl.question('Enter user name: ', resolve);
        });

        // Get new password
        const password = await new Promise((resolve) => {
          rl.question('Enter new password (or press Enter for default "password123"): ', (input) => {
            resolve(input || 'password123');
          });
        });

        // Hash the password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create the user
        const createResult = await pool.query(`
          INSERT INTO users (email, name, password_hash, role, email_verified, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING id, email, name, role
        `, [email, name, passwordHash, 'user', false]);

        const newUser = createResult.rows[0];
        console.log('✅ User account created successfully!');
        console.log(`📧 Email: ${newUser.email}`);
        console.log(`👤 Name: ${newUser.name}`);
        console.log(`🔑 Password: ${password}`);
        console.log('✨ User can now login with these credentials!');
      } else {
        console.log('❌ No purchases found for this email either.');
      }
    } else {
      const user = userCheck.rows[0];
      console.log(`✅ Found user: ${user.name} (${user.email})`);

      // Get new password
      const password = await new Promise((resolve) => {
        rl.question('Enter new password (or press Enter for default "password123"): ', (input) => {
          resolve(input || 'password123');
        });
      });

      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Update password
      await pool.query(`
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE email = $2
      `, [passwordHash, email]);

      console.log('✅ Password reset successfully!');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 New Password: ${password}`);
      console.log('✨ User can now login with these credentials!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

// Also create a function to list all users who have made purchases
async function listPurchasedUsers() {
  try {
    console.log('\n📊 Checking all users with purchases...\n');

    const result = await pool.query(`
      SELECT DISTINCT
        p.user_email,
        p.user_name,
        u.id as user_id,
        u.password_hash IS NOT NULL as has_password,
        COUNT(DISTINCT p.product_type) as products_purchased,
        MAX(p.created_at) as last_purchase
      FROM purchases p
      LEFT JOIN users u ON p.user_email = u.email
      GROUP BY p.user_email, p.user_name, u.id, u.password_hash
      ORDER BY last_purchase DESC
    `);

    console.log('Found', result.rows.length, 'unique purchasers:\n');

    result.rows.forEach(row => {
      console.log(`📧 ${row.user_email} (${row.user_name || 'No name'})`);
      console.log(`   User Account: ${row.user_id ? 'Yes' : 'No'}`);
      console.log(`   Password Set: ${row.has_password ? 'Yes' : 'No'}`);
      console.log(`   Products Purchased: ${row.products_purchased}`);
      console.log(`   Last Purchase: ${new Date(row.last_purchase).toLocaleDateString()}`);
      console.log('');
    });

    const noAccount = result.rows.filter(r => !r.user_id);
    const noPassword = result.rows.filter(r => r.user_id && !r.has_password);

    if (noAccount.length > 0) {
      console.log(`⚠️  ${noAccount.length} purchasers need user accounts created`);
      console.log('Run this script with their email to create accounts for them.\n');
    }

    if (noPassword.length > 0) {
      console.log(`⚠️  ${noPassword.length} users need passwords set`);
      console.log('Run this script with their email to set passwords.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🔧 User Password Reset Tool\n');
  console.log('1. Reset/Create user password');
  console.log('2. List all purchasers and their account status');
  console.log('');

  const choice = await new Promise((resolve) => {
    rl.question('Choose an option (1 or 2): ', resolve);
  });

  if (choice === '2') {
    await listPurchasedUsers();
    rl.close();
    await pool.end();
  } else {
    await resetUserPassword();
  }
}

main();