#!/usr/bin/env node

/**
 * Migration Script: Add country field and update location details
 * 
 * This script runs migrations to:
 * 1. Add country field to locations table
 * 2. Update all location details with proper Irish addresses
 * 3. Set up comprehensive opening hours for all locations
 */

import pg from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const { Pool } = pg;

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

/**
 * Run a SQL migration file
 */
async function runMigration(filePath, migrationName) {
  const client = await pool.connect();
  try {
    console.log(`\n🔄 Running migration: ${migrationName}...`);
    const sql = readFileSync(filePath, 'utf-8');
    await client.query(sql);
    console.log(`✅ Migration completed: ${migrationName}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationName}`);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main migration runner
 */
async function main() {
  console.log('🚀 Starting location details migrations...\n');

  try {
    // Migration 1: Add country field
    await runMigration(
      join(__dirname, 'migrations', '003_add_country_field_to_locations.sql'),
      'Add country field to locations'
    );

    // Migration 2: Update location details and opening hours
    await runMigration(
      join(__dirname, 'migrations', '004_update_location_details.sql'),
      'Update location details and opening hours'
    );

    console.log('\n✨ All migrations completed successfully!');
    console.log('\n📝 Summary of changes:');
    console.log('   - Added country field to locations table');
    console.log('   - Updated Blanchardstown with full Irish address');
    console.log('   - Updated Tallaght with full Irish address');
    console.log('   - Updated Glasnevin with full Irish address');
    console.log('   - Set comprehensive opening hours for all locations');
    console.log('\n🎉 Location details are now fully editable from Admin panel!');
  } catch (error) {
    console.error('\n❌ Migration process failed');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
