import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const { DATABASE_URL } = process.env;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyMenu() {
  const client = await pool.connect();
  
  try {
    console.log('📊 Verifying Kake Menu Update\n');
    
    // Count products by category
    const categoryCount = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM products 
      WHERE is_archived = false 
      GROUP BY category 
      ORDER BY category
    `);
    
    console.log('Products by Category:');
    categoryCount.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} products`);
    });
    
    const totalCount = await client.query('SELECT COUNT(*) FROM products WHERE is_archived = false');
    console.log(`\nTotal Active Products: ${totalCount.rows[0].count}\n`);
    
    // Show sample of products
    const sampleProducts = await client.query(`
      SELECT product_name, category, price 
      FROM products 
      WHERE is_archived = false 
      ORDER BY category, price 
      LIMIT 10
    `);
    
    console.log('Sample Products:');
    sampleProducts.rows.forEach(row => {
      console.log(`  ${row.product_name} (${row.category}) - €${parseFloat(row.price).toFixed(2)}`);
    });
    
    // Check product locations
    const locationAssignments = await client.query(`
      SELECT location_name, COUNT(*) as product_count
      FROM product_locations
      GROUP BY location_name
      ORDER BY location_name
    `);
    
    console.log('\n📍 Product Location Assignments:');
    locationAssignments.rows.forEach(row => {
      console.log(`  ${row.location_name}: ${row.product_count} products`);
    });
    
  } finally {
    client.release();
    await pool.end();
  }
}

verifyMenu().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
