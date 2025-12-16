import pg from 'pg';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Running admin training management migration...');
    const sql = readFileSync('./migrations/008_create_admin_training_management.sql', 'utf8');
    await client.query(sql);
    console.log('Migration completed successfully!');
    
    // Auto-assign global required courses to existing staff
    console.log('Auto-assigning global required courses to existing staff...');
    
    // Get all active staff users
    const staffResult = await client.query(
      `SELECT user_id FROM users WHERE user_type IN ('staff', 'manager') AND account_status = 'active'`
    );
    
    // Get all global required courses
    const coursesResult = await client.query(
      `SELECT id FROM admin_training_courses WHERE is_required_global = true AND is_active = true`
    );
    
    const now = new Date().toISOString();
    let assignmentCount = 0;
    
    for (const staff of staffResult.rows) {
      for (const course of coursesResult.rows) {
        // Check if assignment already exists
        const existing = await client.query(
          'SELECT id FROM staff_training_assignments WHERE staff_user_id = $1 AND course_id = $2',
          [staff.user_id, course.id]
        );
        
        if (existing.rows.length === 0) {
          const assignmentId = `sta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await client.query(
            `INSERT INTO staff_training_assignments 
             (id, staff_user_id, course_id, is_required, status, progress_percent, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [assignmentId, staff.user_id, course.id, true, 'not_started', 0, now, now]
          );
          assignmentCount++;
        }
      }
    }
    
    console.log(`Created ${assignmentCount} auto-assignments for existing staff.`);
    console.log('All done!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
