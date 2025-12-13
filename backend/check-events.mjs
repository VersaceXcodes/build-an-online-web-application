import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkEvents() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM stall_events ORDER BY event_date DESC');
    console.log(`Found ${result.rows.length} events in database:\n`);
    result.rows.forEach((event, index) => {
      console.log(`${index + 1}. ${event.event_name}`);
      console.log(`   ID: ${event.event_id}`);
      console.log(`   Date: ${event.event_date}`);
      console.log(`   Visible: ${event.is_visible}`);
      console.log(`   Image: ${event.event_image_url?.substring(0, 50)}...`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkEvents();
