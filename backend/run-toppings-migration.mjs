import pg from 'pg';
import fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting toppings schema migration...');
    
    const sqlFile = fs.readFileSync(path.join(__dirname, 'create-toppings-schema.sql'), 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✓ Executed statement');
      } catch (err) {
        // Ignore table already exists errors
        if (err.message.includes('already exists')) {
          console.log('⚠ Table/index already exists, skipping...');
        } else {
          throw err;
        }
      }
    }
    
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
