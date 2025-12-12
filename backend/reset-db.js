import dotenv from "dotenv";
import fs from "fs";
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432 } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST || "ep-ancient-dream-abbsot9k-pooler.eu-west-2.aws.neon.tech",
        database: PGDATABASE || "neondb",
        user: PGUSER || "neondb_owner",
        password: PGPASSWORD || "npg_jAS3aITLC5DX",
        port: Number(PGPORT),
        ssl: { require: true },
      }
);


async function resetDb() {
  const client = await pool.connect();
  try {
    console.log('🔄 Starting database reset...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Read and split SQL commands
    const dbInitCommands = fs
      .readFileSync(`./db.sql`, "utf-8")
      .toString()
      .split(/(?=CREATE TABLE |INSERT INTO)/);

    console.log(`📝 Executing ${dbInitCommands.length} database commands...`);
    
    // Execute each command
    for (let i = 0; i < dbInitCommands.length; i++) {
      const cmd = dbInitCommands[i];
      if (cmd.trim()) {
        try {
          await client.query(cmd);
          if (i % 50 === 0) {
            console.log(`   Progress: ${i}/${dbInitCommands.length} commands...`);
          }
        } catch (e) {
          // Only log error if it's not a "does not exist" error (which is fine for DROP commands)
          if (!e.message.includes('does not exist')) {
            console.warn(`⚠️  Warning on command ${i}:`, e.message.substring(0, 100));
          }
        }
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    
    // Verify counts
    console.log('\n✅ Database reset completed successfully!');
    console.log('\n📊 Verification:');
    
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`   Users: ${userCount.rows[0].count}`);
    
    const orderCount = await client.query('SELECT COUNT(*) FROM orders');
    console.log(`   Orders: ${orderCount.rows[0].count}`);
    
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    console.log(`   Products: ${productCount.rows[0].count}`);
    
    console.log('\n✨ Database is now in clean seed state.\n');
    
  } catch (e) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Database reset failed:', e);
    throw e;
  } finally {
    // Release client back to pool
    client.release();
    await pool.end();
  }
}

// Execute reset
resetDb().catch(err => {
  console.error(err);
  process.exit(1);
});
