import pg from 'pg';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('🚀 Running location details migrations...\n');
    
    // Migration 1: Add country field
    console.log('📝 Adding country field to locations table...');
    const sql1 = readFileSync('./migrations/003_add_country_field_to_locations.sql', 'utf8');
    await client.query(sql1);
    console.log('✅ Country field added successfully\n');
    
    // Migration 2: Update location details
    console.log('📝 Updating location details and opening hours...');
    const sql2 = readFileSync('./migrations/004_update_location_details.sql', 'utf8');
    await client.query(sql2);
    console.log('✅ Location details updated successfully\n');
    
    console.log('✨ All migrations completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✓ Added country field to locations');
    console.log('   ✓ Updated Blanchardstown address and hours');
    console.log('   ✓ Updated Tallaght address and hours');
    console.log('   ✓ Updated Glasnevin address and hours');
    console.log('\n🎉 All location details are now editable from Admin!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
