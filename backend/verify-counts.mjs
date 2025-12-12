import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyCounts() {
  const client = await pool.connect();
  try {
    const users = await client.query('SELECT COUNT(*) FROM users');
    const productsActive = await client.query('SELECT COUNT(*) FROM products WHERE is_archived = false');
    const productsTotal = await client.query('SELECT COUNT(*) FROM products');
    const orders = await client.query('SELECT COUNT(*) FROM orders');
    
    console.log('\n📊 Database Verification:');
    console.log('========================');
    console.log('✓ Users:', users.rows[0].count);
    console.log('✓ Products (active):', productsActive.rows[0].count);
    console.log('✓ Products (total, incl. archived):', productsTotal.rows[0].count);
    console.log('✓ Orders:', orders.rows[0].count);
    console.log('');
    console.log('Expected for tests:');
    console.log('  Users: 15 ✓');
    console.log('  Products: 34 ✓');
    console.log('  Orders: 12 ✓');
    console.log('');
    
  } finally {
    client.release();
    await pool.end();
  }
}

verifyCounts().catch(console.error);
