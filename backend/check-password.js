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
    const email = process.argv[2] || 'admin@bakery.com';
    const testPassword = process.argv[3] || 'AdminPassword123!';
    
    const result = await client.query('SELECT email, password_hash FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }
    
    const user = result.rows[0];
    console.log('\n📧 Email:', user.email);
    console.log('🔑 Password Hash:', user.password_hash.substring(0, 30) + '...');
    
    // Test password
    const isMatch = await bcrypt.compare(testPassword, user.password_hash);
    console.log(`\n🧪 Testing password "${testPassword}":`, isMatch ? '✅ CORRECT' : '❌ WRONG');
    
    if (!isMatch) {
      console.log('\n💡 Tip: The password in test_users.json is:', testPassword);
      console.log('   If this is incorrect, you may need to fix the seed data.');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
})();
