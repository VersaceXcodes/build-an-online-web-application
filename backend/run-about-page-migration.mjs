import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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
    console.log('Running About Page Content migration...');
    
    const sqlFile = fs.readFileSync(path.join(__dirname, 'create-about-page-content.sql'), 'utf8');
    
    await client.query(sqlFile);
    
    console.log('✅ About Page Content migration completed successfully!');
    
    // Verify the data
    const countResult = await client.query('SELECT COUNT(*) FROM about_page_content');
    console.log(`📊 About page content records: ${countResult.rows[0].count}`);
    
    const milestonesResult = await client.query('SELECT COUNT(*) FROM about_page_milestones');
    console.log(`📊 Milestones: ${milestonesResult.rows[0].count}`);
    
    const valuesResult = await client.query('SELECT COUNT(*) FROM about_page_values');
    console.log(`📊 Values: ${valuesResult.rows[0].count}`);
    
    const teamResult = await client.query('SELECT COUNT(*) FROM about_page_team_members');
    console.log(`📊 Team members: ${teamResult.rows[0].count}`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    client.release();
    await pool.end();
    process.exit(1);
  }
}

runMigration();
