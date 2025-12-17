// Migration script to add external_providers column and migrate existing data
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;
const actualPgPort = PGPORT || '5432';

const pool = new pg.Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: PGHOST, database: PGDATABASE, user: PGUSER, password: PGPASSWORD, port: Number(actualPgPort), ssl: { rejectUnauthorized: false } }
);

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting external_providers migration...');
    
    // Step 1: Add the column if it doesn't exist
    console.log('Step 1: Adding external_providers column...');
    await client.query(`
      ALTER TABLE locations ADD COLUMN IF NOT EXISTS external_providers TEXT
    `);
    console.log('  Column added (or already exists).');
    
    // Step 2: Get all locations with just_eat_url or deliveroo_url
    console.log('Step 2: Finding locations with legacy external URLs...');
    const result = await client.query(`
      SELECT location_id, location_name, just_eat_url, deliveroo_url, external_providers 
      FROM locations 
      WHERE (just_eat_url IS NOT NULL AND just_eat_url != '') 
         OR (deliveroo_url IS NOT NULL AND deliveroo_url != '')
    `);
    
    console.log(`  Found ${result.rows.length} locations with external URLs.`);
    
    // Step 3: Migrate each location
    for (const loc of result.rows) {
      // Skip if already has external_providers
      if (loc.external_providers) {
        console.log(`  Skipping ${loc.location_name} - already has external_providers configured.`);
        continue;
      }
      
      const providers = [];
      
      if (loc.just_eat_url) {
        providers.push({
          name: 'Just Eat',
          url: loc.just_eat_url,
          display_order: 1,
          is_active: true
        });
      }
      
      if (loc.deliveroo_url) {
        providers.push({
          name: 'Deliveroo',
          url: loc.deliveroo_url,
          display_order: 2,
          is_active: true
        });
      }
      
      if (providers.length > 0) {
        await client.query(
          'UPDATE locations SET external_providers = $1 WHERE location_id = $2',
          [JSON.stringify(providers), loc.location_id]
        );
        console.log(`  Migrated ${loc.location_name}: ${providers.map(p => p.name).join(', ')}`);
      }
    }
    
    console.log('\nMigration completed successfully!');
    
    // Show current state
    console.log('\nCurrent external_providers state:');
    const allLocs = await client.query('SELECT location_name, external_providers FROM locations ORDER BY location_name');
    for (const loc of allLocs.rows) {
      const providers = loc.external_providers ? JSON.parse(loc.external_providers) : [];
      const providerNames = providers.filter(p => p.is_active).map(p => p.name).join(', ') || 'None';
      console.log(`  ${loc.location_name}: ${providerNames}`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
