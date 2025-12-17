// Migration runner for ticket system
// Run with: node run-ticket-system-migration.mjs

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting ticket system migration...');
    
    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, 'migrations', '011_add_ticket_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    console.log('Migration completed successfully!');
    
    // Verify the columns exist
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name IN ('ticket_number', 'ticket_token', 'confirmation_viewed_at')
    `);
    
    console.log('Verified new columns:', result.rows);
    
    // Check sample of updated orders
    const sampleOrders = await client.query(`
      SELECT order_id, order_number, ticket_number, ticket_token 
      FROM orders 
      WHERE ticket_number IS NOT NULL 
      LIMIT 3
    `);
    
    console.log('Sample orders with ticket data:', sampleOrders.rows);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
