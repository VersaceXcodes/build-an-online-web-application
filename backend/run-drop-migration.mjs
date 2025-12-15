import pg from 'pg';
import dotenv from 'dotenv';

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
        port: Number(PGPORT || '5432'), 
        ssl: { rejectUnauthorized: false } 
      }
);

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running Drop of the Month migration...');
    
    await client.query(`
      ALTER TABLE stall_events 
      ADD COLUMN IF NOT EXISTS is_drop_of_the_month BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS special_price NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS available_until TEXT,
      ADD COLUMN IF NOT EXISTS preorder_button_label TEXT,
      ADD COLUMN IF NOT EXISTS preorder_button_url TEXT;
    `);
    
    console.log('Migration completed successfully!');
    console.log('Added fields to stall_events table:');
    console.log('  - is_drop_of_the_month (BOOLEAN)');
    console.log('  - special_price (NUMERIC)');
    console.log('  - available_until (TEXT)');
    console.log('  - preorder_button_label (TEXT)');
    console.log('  - preorder_button_url (TEXT)');
    
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
