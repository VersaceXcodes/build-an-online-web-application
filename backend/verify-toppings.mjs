import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { 
        host: PGHOST, 
        database: PGDATABASE, 
        user: PGUSER, 
        password: PGPASSWORD, 
        port: parseInt(PGPORT || '5432'),
        ssl: { rejectUnauthorized: false } 
      }
);

async function verifyToppings() {
  const client = await pool.connect();
  
  try {
    console.log('Verifying toppings tables...');
    
    const result = await client.query('SELECT * FROM toppings ORDER BY display_order LIMIT 5');
    console.log('\nSample toppings from database:');
    result.rows.forEach(t => console.log(`  - ${t.topping_name} (${t.topping_type}, $${t.price})`));
    
    console.log(`\n✓ Toppings table exists with ${result.rows.length} sample records`);
  } catch (error) {
    console.error('✗ Verification failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

verifyToppings().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
