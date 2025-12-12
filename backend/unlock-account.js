#!/usr/bin/env node

/**
 * Script to unlock a locked user account
 * Usage: node unlock-account.js <email>
 * Example: node unlock-account.js john.smith@example.com
 */

import { Pool } from 'pg';
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

async function unlockAccount(email) {
  const client = await pool.connect();
  try {
    // Check current status
    const userResult = await client.query(
      'SELECT user_id, email, failed_login_attempts, locked_until, account_status FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`❌ User not found: ${email}`);
      return false;
    }

    const user = userResult.rows[0];
    console.log('\n📊 Current Account Status:');
    console.log(`   Email: ${user.email}`);
    console.log(`   User ID: ${user.user_id}`);
    console.log(`   Account Status: ${user.account_status}`);
    console.log(`   Failed Login Attempts: ${user.failed_login_attempts}`);
    console.log(`   Locked Until: ${user.locked_until || 'Not locked'}`);

    if (!user.locked_until && user.failed_login_attempts === 0) {
      console.log('\n✅ Account is already unlocked!');
      return true;
    }

    // Unlock the account
    await client.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, updated_at = $1 WHERE user_id = $2',
      [new Date().toISOString(), user.user_id]
    );

    console.log('\n✅ Account unlocked successfully!');
    
    // Verify the update
    const verifyResult = await client.query(
      'SELECT email, failed_login_attempts, locked_until FROM users WHERE user_id = $1',
      [user.user_id]
    );

    console.log('\n📊 Updated Account Status:');
    console.log(`   Failed Login Attempts: ${verifyResult.rows[0].failed_login_attempts}`);
    console.log(`   Locked Until: ${verifyResult.rows[0].locked_until || 'Not locked'}`);
    
    return true;
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return false;
  } finally {
    client.release();
  }
}

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: node unlock-account.js <email>');
    console.error('   Example: node unlock-account.js john.smith@example.com');
    process.exit(1);
  }

  console.log(`\n🔓 Attempting to unlock account for: ${email}`);

  const success = await unlockAccount(email);
  await pool.end();

  process.exit(success ? 0 : 1);
}

main();
