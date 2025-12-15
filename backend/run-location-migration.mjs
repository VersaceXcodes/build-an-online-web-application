import pg from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;
const actualPgPort = PGPORT || '5432';

const pool = new Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: PGHOST, database: PGDATABASE, user: PGUSER, password: PGPASSWORD, port: Number(actualPgPort), ssl: { rejectUnauthorized: false } }
);

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running location management migrations...');
    
    // Read migration files
    const migration1 = fs.readFileSync(path.join(__dirname, 'migrations', '001_add_location_slug_and_opening_hours.sql'), 'utf8');
    const migration2 = fs.readFileSync(path.join(__dirname, 'migrations', '002_seed_locations_with_slug_and_hours.sql'), 'utf8');
    
    console.log('Applying migration 001: Add location slug and opening_hours table...');
    await client.query(migration1);
    console.log('✓ Migration 001 complete');
    
    console.log('Applying migration 002: Seed locations with slug and hours...');
    await client.query(migration2);
    console.log('✓ Migration 002 complete');
    
    console.log('\n✓ All migrations completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Failed to run migrations:', err);
  process.exit(1);
});
