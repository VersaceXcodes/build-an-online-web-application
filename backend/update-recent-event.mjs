import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateRecentEvent() {
  const client = await pool.connect();
  try {
    // Update the most recent event (Christmas Market Pop-Up)
    const imageUrl = 'https://tgvswctfhlubctiodmvo.supabase.co/storage/v1/object/public/project_uploads/3695b609-8a61-4c0d-bfcd-35ca7fdbfcec/build-an-online-web-application/1765645736064_0_Screenshot_2025-12-13_at_17.07.07.png';
    
    const result = await client.query(
      `UPDATE stall_events 
       SET event_name = $1,
           venue_location = $2,
           event_date = $3,
           event_time = $4,
           description = $5,
           event_image_url = $6,
           cta_button_text = $7,
           cta_button_action = $8,
           cta_button_url = $9,
           is_visible = true,
           updated_at = $10
       WHERE event_id = $11
       RETURNING *`,
      [
        'Special Holiday Market',
        'Dublin City Centre - Grafton Street',
        '2025-12-20',
        '10:00 AM - 8:00 PM',
        'Join us for our exclusive Holiday Market event! Experience our finest artisan desserts and festive specials. Perfect for last-minute holiday treats and gifts!',
        imageUrl,
        'Get Event Details',
        'internal_link',
        '/about',
        new Date().toISOString(),
        'event_355c43bb21764e8db5c2807282e26004'
      ]
    );

    console.log('✅ Event updated successfully:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error updating event:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateRecentEvent();
