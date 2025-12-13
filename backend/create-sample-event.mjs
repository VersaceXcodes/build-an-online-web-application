import pg from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createSampleEvent() {
  const client = await pool.connect();
  try {
    const event_id = `event_${uuidv4().replace(/-/g, '')}`;
    const now = new Date().toISOString();
    
    // Create a sample event
    const event = {
      event_id,
      event_name: 'Christmas Market Pop-Up',
      venue_location: 'Dublin City Centre, Grafton Street',
      event_date: '2025-12-20',
      event_time: '10:00 AM - 6:00 PM',
      description: 'Join us at our special Christmas pop-up stall! Featuring exclusive holiday treats and festive favorites.',
      event_image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80',
      cta_button_text: 'View Event Details',
      cta_button_action: 'internal_link',
      cta_button_url: '/about',
      is_visible: true,
      created_at: now,
      updated_at: now
    };

    await client.query(
      `INSERT INTO stall_events 
       (event_id, event_name, venue_location, event_date, event_time, description, 
        event_image_url, cta_button_text, cta_button_action, cta_button_url, 
        is_visible, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        event.event_id,
        event.event_name,
        event.venue_location,
        event.event_date,
        event.event_time,
        event.description,
        event.event_image_url,
        event.cta_button_text,
        event.cta_button_action,
        event.cta_button_url,
        event.is_visible,
        event.created_at,
        event.updated_at
      ]
    );

    console.log('✅ Sample event created successfully:');
    console.log(JSON.stringify(event, null, 2));
    
    // Verify it was created
    const result = await client.query('SELECT * FROM stall_events WHERE event_id = $1', [event_id]);
    console.log('\n✅ Verified event in database:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error creating sample event:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createSampleEvent();
