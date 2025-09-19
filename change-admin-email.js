#!/usr/bin/env node

// Script to change admin email for BarakahTool
// Usage: node change-admin-email.js newadmin@example.com

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require'

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function changeAdminEmail() {
  try {
    const newEmail = process.argv[2]

    if (!newEmail) {
      console.log('❌ Please provide the new admin email')
      console.log('Usage: node change-admin-email.js newadmin@example.com')
      process.exit(1)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      console.log('❌ Invalid email format')
      process.exit(1)
    }

    console.log('🔧 Changing admin email...\n')

    // Check if new email already exists
    const existingUser = await pool.query('SELECT id, role FROM users WHERE email = $1', [newEmail.toLowerCase()])
    if (existingUser.rows.length > 0) {
      if (existingUser.rows[0].role === 'admin') {
        console.log('✅ Email already belongs to an admin user')
        process.exit(0)
      } else {
        console.log('❌ Email already belongs to a regular user')
        process.exit(1)
      }
    }

    // Get current admin user
    const currentAdmin = await pool.query('SELECT id, email FROM users WHERE email = $1', ['admin@barakahtool.com'])

    if (currentAdmin.rows.length === 0) {
      console.log('❌ Current admin user not found')
      process.exit(1)
    }

    const adminId = currentAdmin.rows[0].id
    const oldEmail = currentAdmin.rows[0].email

    // Update admin email
    await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail.toLowerCase(), adminId])

    console.log(`✅ Admin email changed successfully!`)
    console.log(`   Old email: ${oldEmail}`)
    console.log(`   New email: ${newEmail.toLowerCase()}`)
    console.log(`   Password remains: admin123`)
    console.log('')
    console.log('🔑 New Admin Login Credentials:')
    console.log(`   Email: ${newEmail.toLowerCase()}`)
    console.log(`   Password: admin123`)
    console.log('')
    console.log('⚠️  IMPORTANT: Change the password after first login!')

  } catch (error) {
    console.error('❌ Error changing admin email:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Show current admin info if no arguments provided
async function showCurrentAdmin() {
  try {
    const admin = await pool.query('SELECT email, name, created_at FROM users WHERE role = $1', ['admin'])

    if (admin.rows.length === 0) {
      console.log('❌ No admin user found')
    } else {
      console.log('📋 Current Admin Users:')
      admin.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email}`)
        console.log(`      Name: ${user.name}`)
        console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('❌ Error fetching admin info:', error.message)
  } finally {
    await pool.end()
  }
}

// Main execution
if (process.argv.length < 3) {
  showCurrentAdmin()
} else {
  changeAdminEmail()
}