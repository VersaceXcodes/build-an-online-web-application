import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync('./add-product-visibility.sql', 'utf8');
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');
    
    // Verify the column was added
    const result = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='is_visible'");
    if (result.rows.length > 0) {
      console.log('✓ Column is_visible successfully added to products table');
    }
  } catch (error) {
    console.error('Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('Column already exists, migration skipped');
    } else {
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
