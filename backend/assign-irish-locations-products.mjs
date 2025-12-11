import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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

function generateId(prefix) {
  return `${prefix}_${uuidv4().replace(/-/g, '')}`;
}

async function main() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get all active products
    const productsResult = await client.query(
      'SELECT product_id, product_name FROM products WHERE is_archived = false ORDER BY product_name'
    );
    
    console.log(`Found ${productsResult.rows.length} active products`);
    
    // Assign to all Irish locations
    const locations = ['Blanchardstown', 'Tallaght'];
    const now = new Date().toISOString();
    
    for (const location of locations) {
      console.log(`\n=== Assigning products to ${location} ===`);
      let assignedCount = 0;
      
      for (const product of productsResult.rows) {
        // Check if already assigned
        const existing = await client.query(
          'SELECT * FROM product_locations WHERE product_id = $1 AND location_name = $2',
          [product.product_id, location]
        );
        
        if (existing.rows.length === 0) {
          await client.query(
            'INSERT INTO product_locations (assignment_id, product_id, location_name, assigned_at) VALUES ($1, $2, $3, $4)',
            [generateId('pl'), product.product_id, location, now]
          );
          assignedCount++;
          console.log(`✓ Assigned: ${product.product_name}`);
        } else {
          console.log(`- Skipped: ${product.product_name} (already assigned)`);
        }
      }
      
      console.log(`✅ Successfully assigned ${assignedCount} products to ${location}`);
    }
    
    await client.query('COMMIT');
    
    // Verify all locations
    console.log('\n=== VERIFICATION ===');
    const verifyResult = await client.query(
      'SELECT location_name, COUNT(*) FROM product_locations GROUP BY location_name ORDER BY location_name'
    );
    console.log(verifyResult.rows);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
