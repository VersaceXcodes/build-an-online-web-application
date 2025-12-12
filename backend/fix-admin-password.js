#!/usr/bin/env node

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const client = await pool.connect();
  try {
    const email = 'admin@bakery.com';
    const newPassword = 'AdminPassword123!';
    
    console.log('\n🔧 Fixing admin password...');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    
    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('🔐 New Hash:', passwordHash.substring(0, 30) + '...');
    
    // Update the password hash
    await client.query(
      'UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL, updated_at = $2 WHERE email = $3',
      [passwordHash, new Date().toISOString(), email]
    );
    
    console.log('\n✅ Password updated successfully!');
    
    // Verify the update
    const result = await client.query('SELECT email, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    const isMatch = await bcrypt.compare(newPassword, user.password_hash);
    console.log('🧪 Verification:', isMatch ? '✅ Password is correct' : '❌ Password verification failed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
