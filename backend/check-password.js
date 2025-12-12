import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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

async function main() {
  const client = await pool.connect();
  const result = await client.query(
    'SELECT email, password_hash FROM users WHERE email IN ($1, $2)',
    ['staff.london@bakery.com', 'manager.london@bakery.com']
  );
  
  console.log('\nCurrent password hashes in database:\n');
  result.rows.forEach(row => {
    console.log(`${row.email}:`);
    console.log(`  ${row.password_hash}\n`);
  });
  
  client.release();
  await pool.end();
}

main();
