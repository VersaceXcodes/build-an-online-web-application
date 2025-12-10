#!/usr/bin/env node

/**
 * Script to unlock and fix London staff accounts
 * This script will:
 * 1. Unlock both staff.london@bakery.com and manager.london@bakery.com
 * 2. Reset failed login attempts
 * 3. Ensure passwords are properly hashed
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;
const actualPgPort = PGPORT || '5432';

const pool = new Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { 
        host: PGHOST, 
        database: PGDATABASE, 
        user: PGUSER, 
        password: PGPASSWORD, 
        port: Number(actualPgPort), 
        ssl: { rejectUnauthorized: false } 
      }
);

async function fixAccount(email, password) {
  const client = await pool.connect();
  try {
    // Check current status
    const userResult = await client.query(
      'SELECT user_id, email, user_type, failed_login_attempts, locked_until, account_status FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`❌ User not found: ${email}`);
      return false;
    }

    const user = userResult.rows[0];
    console.log(`\n📊 Current Status for ${email}:`);
    console.log(`   User ID: ${user.user_id}`);
    console.log(`   User Type: ${user.user_type}`);
    console.log(`   Account Status: ${user.account_status}`);
    console.log(`   Failed Login Attempts: ${user.failed_login_attempts}`);
    console.log(`   Locked Until: ${user.locked_until || 'Not locked'}`);

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Update the account: unlock it and reset password
    await client.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, password_hash = $1, updated_at = $2 WHERE user_id = $3',
      [password_hash, new Date().toISOString(), user.user_id]
    );

    console.log(`✅ Account fixed successfully!`);
    console.log(`   Password reset to: ${password}`);
    console.log(`   Failed login attempts: 0`);
    console.log(`   Locked until: NULL`);
    
    return true;
  } catch (error) {
    console.error(`\n❌ Error fixing ${email}:`, error.message);
    return false;
  } finally {
    client.release();
  }
}

async function main() {
  console.log(`\n🔧 Fixing London Staff Accounts\n`);
  console.log(`=`.repeat(50));

  const accounts = [
    { email: 'staff.london@bakery.com', password: 'StaffPassword123!' },
    { email: 'manager.london@bakery.com', password: 'ManagerPassword123!' }
  ];

  let allSuccess = true;

  for (const account of accounts) {
    const success = await fixAccount(account.email, account.password);
    allSuccess = allSuccess && success;
  }

  await pool.end();

  console.log(`\n${'='.repeat(50)}`);
  if (allSuccess) {
    console.log(`\n✅ All accounts fixed successfully!`);
    console.log(`\nYou can now login with:`);
    console.log(`  - staff.london@bakery.com / StaffPassword123!`);
    console.log(`  - manager.london@bakery.com / ManagerPassword123!`);
  } else {
    console.log(`\n❌ Some accounts could not be fixed. Check the errors above.`);
  }

  process.exit(allSuccess ? 0 : 1);
}

main();
