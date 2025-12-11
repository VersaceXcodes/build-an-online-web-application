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
  try {
    // Check locations first
    const locations = await pool.query('SELECT location_name FROM locations ORDER BY location_name');
    console.log('=== LOCATIONS ===');
    locations.rows.forEach(row => console.log(row.location_name));
    
    // Check product_locations for Glasnevin
    const assignments = await pool.query("SELECT * FROM product_locations WHERE location_name ILIKE '%glasnevin%'");
    console.log('\n=== GLASNEVIN PRODUCT ASSIGNMENTS ===');
    console.log('Count:', assignments.rows.length);
    console.log(assignments.rows);
    
    // Check all product_locations
    const allAssignments = await pool.query('SELECT location_name, COUNT(*) FROM product_locations GROUP BY location_name ORDER BY location_name');
    console.log('\n=== ALL PRODUCT ASSIGNMENTS BY LOCATION ===');
    console.log(allAssignments.rows);
    
    // Check if products exist
    const products = await pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN is_archived = false THEN 1 END) as active FROM products');
    console.log('\n=== PRODUCTS COUNT ===');
    console.log(products.rows[0]);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

main();
