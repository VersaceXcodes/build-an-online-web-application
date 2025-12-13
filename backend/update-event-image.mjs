import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateEventImage() {
  const client = await pool.connect();
  try {
    // Update the event with the uploaded image URL
    const imageUrl = 'https://tgvswctfhlubctiodmvo.supabase.co/storage/v1/object/public/project_uploads/3695b609-8a61-4c0d-bfcd-35ca7fdbfcec/build-an-online-web-application/1765645736064_0_Screenshot_2025-12-13_at_17.07.07.png';
    
    const result = await client.query(
      `UPDATE stall_events 
       SET event_image_url = $1, 
           updated_at = $2
       WHERE is_visible = true
       RETURNING *`,
      [imageUrl, new Date().toISOString()]
    );

    if (result.rows.length > 0) {
      console.log('✅ Event image updated successfully:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('⚠️  No visible events found to update');
    }
    
  } catch (error) {
    console.error('❌ Error updating event image:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateEventImage();
