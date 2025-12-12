import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;
const actualPgPort = PGPORT || '5432';

const pool = new Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: PGHOST, database: PGDATABASE, user: PGUSER, password: PGPASSWORD, port: Number(actualPgPort), ssl: { rejectUnauthorized: false } }
);

(async () => {
  const client = await pool.connect();
  try {
    console.log('🔄 Running social media links migration...');
    const sql = fs.readFileSync('create-social-links-table.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Social media links table created successfully');
    console.log('✅ Default social links inserted');
    
    // Verify the data
    const result = await client.query('SELECT * FROM social_media_links ORDER BY display_order');
    console.log(`✅ Total social links: ${result.rows.length}`);
    result.rows.forEach(link => {
      console.log(`  - ${link.platform_name}: ${link.platform_url}`);
    });
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
