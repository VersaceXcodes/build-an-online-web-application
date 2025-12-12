import { describe, expect, test, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app, pool } from './server.ts';
import { Server } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';

// ============================================
// TEST SETUP & UTILITIES
// ============================================

let server: any;
let io: Server;
let clientSocket: ClientSocket;
const TEST_PORT = 3001;

// Helper function to create test user
async function createTestUser(overrides = {}) {
  const defaultUser = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    first_name: 'Test',
    last_name: 'User',
    phone_number: '+447700900999',
    marketing_opt_in: false
  };
  
  const response = await request(app)
    .post('/api/auth/register')
    .send({ ...defaultUser, ...overrides });
  
  return response.body;
}

// Helper function to login and get token
async function loginUser(email: string, password: string) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  
  return response.body.token;
}

// Helper function to create admin user in database
async function createAdminUser() {
  const client = await pool.connect();
  try {
    const user_id = `usr_admin_${Date.now()}`;
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO users (
        user_id, email, password_hash, first_name, last_name,
        phone_number, user_type, account_status, marketing_opt_in,
        loyalty_points_balance, failed_login_attempts, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      user_id, 
      `admin${Date.now()}@bakery.com`,
      'admin123', // Plain text password for testing
      'Admin',
      'Test',
      '+447700900888',
      'admin',
      'active',
      false,
      0,
      0,
      now,
      now
    ]);
    
    const token = await loginUser(`admin${Date.now()}@bakery.com`, 'admin123');
    return { user_id, token, email: `admin${Date.now()}@bakery.com` };
  } finally {
    client.release();
  }
}

// Helper function to create staff user in database
async function createStaffUser(location_name: string) {
  const client = await pool.connect();
  try {
    const user_id = `usr_staff_${Date.now()}`;
    const now = new Date().toISOString();
    const email = `staff${Date.now()}@bakery.com`;
    
    await client.query(`
      INSERT INTO users (
        user_id, email, password_hash, first_name, last_name,
        phone_number, user_type, account_status, marketing_opt_in,
        loyalty_points_balance, failed_login_attempts, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      user_id, email, 'staff123', 'Staff', 'Test',
      '+447700900777', 'staff', 'active', false, 0, 0, now, now
    ]);
    
    // Assign to location
    const assignment_id = `assign_${Date.now()}`;
    await client.query(`
      INSERT INTO staff_assignments (assignment_id, user_id, location_name, assigned_at)
      VALUES ($1, $2, $3, $4)
    `, [assignment_id, user_id, location_name, now]);
    
    const token = await loginUser(email, 'staff123');
    return { user_id, token, email, location_name };
  } finally {
    client.release();
  }
}

// Helper function to clean database
async function cleanDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Order matters - delete child tables first
    await client.query('DELETE FROM analytics_snapshots');
    await client.query('DELETE FROM refunds');
    await client.query('DELETE FROM email_logs');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM sessions');
    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM password_reset_tokens');
    await client.query('DELETE FROM favorites');
    await client.query('DELETE FROM stall_events');
    await client.query('DELETE FROM drop_of_the_month');
    await client.query('DELETE FROM promo_code_usage');
    await client.query('DELETE FROM promo_codes');
    await client.query('DELETE FROM staff_lesson_notes');
    await client.query('DELETE FROM staff_lesson_completion');
    await client.query('DELETE FROM staff_course_progress');
    await client.query('DELETE FROM training_lessons');
    await client.query('DELETE FROM training_courses');
    await client.query('DELETE FROM inventory_alerts');
    await client.query('DELETE FROM staff_feedback_responses');
    await client.query('DELETE FROM staff_feedback');
    await client.query('DELETE FROM feedback_internal_notes');
    await client.query('DELETE FROM customer_feedback');
    await client.query('DELETE FROM loyalty_points_transactions');
    await client.query('DELETE FROM addresses');
    await client.query('DELETE FROM order_status_history');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM product_locations');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM locations');
    await client.query('DELETE FROM staff_assignments');
    await client.query('DELETE FROM users');
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Setup test locations
async function setupTestLocations() {
  const client = await pool.connect();
  try {
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO locations (
        location_id, location_name, address_line1, city, postal_code,
        phone_number, email, is_collection_enabled, is_delivery_enabled,
        delivery_radius_km, delivery_fee, free_delivery_threshold,
        estimated_delivery_time_minutes, estimated_preparation_time_minutes,
        allow_scheduled_pickups, opening_hours, created_at, updated_at
      ) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18),
        ($19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
    `, [
      'loc_test1', 'Test Location 1', '123 Test St', 'Test City', 'T1 1TT',
      '+447700900001', 'test1@kake.ie', true, true, 5, 3.99, 25,
      30, 20, true, '{"monday":"9:00-18:00"}', now, now,
      'loc_test2', 'Test Location 2', '456 Test Ave', 'Test Town', 'T2 2TT',
      '+447700900002', 'test2@kake.ie', true, false, null, null, null,
      null, 15, true, '{"monday":"9:00-17:00"}', now, now
    ]);
  } finally {
    client.release();
  }
}

// Setup test products
async function setupTestProducts() {
  const client = await pool.connect();
  try {
    const now = new Date().toISOString();
    
    await client.query(`
      INSERT INTO products (
        product_id, product_name, short_description, category, price,
        primary_image_url, availability_status, is_featured,
        available_for_corporate, is_archived, created_at, updated_at
      ) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12),
        ($13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
    `, [
      'prod_test1', 'Test Croissant', 'Delicious test croissant', 'pastries', 3.50,
      'http://example.com/image1.jpg', 'in_stock', true, true, false, now, now,
      'prod_test2', 'Test Brownie', 'Chocolate test brownie', 'cakes', 4.00,
      'http://example.com/image2.jpg', 'in_stock', false, true, false, now, now
    ]);
    
    // Assign products to location
    await client.query(`
      INSERT INTO product_locations (assignment_id, product_id, location_name, assigned_at)
      VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)
    `, [
      'pl_test1', 'prod_test1', 'Test Location 1', now,
      'pl_test2', 'prod_test2', 'Test Location 1', now
    ]);
  } finally {
    client.release();
  }
}

// ============================================
// TEST LIFECYCLE HOOKS
// ============================================

beforeAll(async () => {
  // Start server
  server = app.listen(TEST_PORT);
  
  // Wait for database connection
  await pool.query('SELECT 1');
  
  console.log('Test server started on port', TEST_PORT);
});

afterAll(async () => {
  // Clean up
  if (clientSocket) {
    clientSocket.disconnect();
  }
  
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  
  await pool.end();
  console.log('Test cleanup completed');
});

beforeEach(async () => {
  // Clean database before each test
  await cleanDatabase();
  
  // Setup basic test data
  await setupTestLocations();
  await setupTestProducts();
});

// ============================================
// AUTHENTICATION TESTS
// ============================================

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('should register new customer with plain text password', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123', // Plain text for testing
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+447700900123',
        marketing_opt_in: true
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.first_name).toBe(userData.first_name);
      expect(response.body.user.user_type).toBe('customer');
      expect(response.body.user.loyalty_points_balance).toBe(0);
      expect(response.body.user).not.toHaveProperty('password_hash');
      
      // Verify user in database with plain text password
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT password_hash FROM users WHERE email = $1',
          [userData.email]
        );
        expect(result.rows[0].password_hash).toBe('password123');
      } finally {
        client.release();
      }
    });
    
    test('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        first_name: 'First',
        last_name: 'User',
        phone_number: '+447700900111'
      };
      
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.error).toBe('registration_failed');
      expect(response.body.message).toContain('already exists');
    });
    
    test('should reject registration with short password', async () => {
      const userData = {
        email: 'short@example.com',
        password: 'pass', // Too short
        first_name: 'Short',
        last_name: 'Pass',
        phone_number: '+447700900222'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.error).toBe('registration_failed');
      expect(response.body.message).toContain('Password too short');
    });
    
    test('should initialize loyalty points to 0', async () => {
      const { user } = await createTestUser();
      
      expect(user.loyalty_points_balance).toBe(0);
    });
    
    test('should create session on registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'session@example.com',
          password: 'password123',
          first_name: 'Session',
          last_name: 'Test',
          phone_number: '+447700900333'
        })
        .expect(201);
      
      expect(response.body.token).toBeDefined();
      
      // Verify session in database
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM sessions WHERE token = $1',
          [response.body.token]
        );
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].user_id).toBe(response.body.user.user_id);
      } finally {
        client.release();
      }
    });
  });
  
  describe('POST /api/auth/login', () => {
    test('should login with plain text password comparison', async () => {
      // Create user first
      const email = 'login@example.com';
      const password = 'password123';
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password,
          first_name: 'Login',
          last_name: 'Test',
          phone_number: '+447700900444'
        });
      
      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(email);
      expect(response.body.user.last_login_at).toBeDefined();
    });
    
    test('should fail login with incorrect password', async () => {
      const email = 'wrong@example.com';
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'correctpassword',
          first_name: 'Wrong',
          last_name: 'Pass',
          phone_number: '+447700900555'
        });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' })
        .expect(401);
      
      expect(response.body.error).toBe('authentication_failed');
      expect(response.body.message).toContain('Invalid email or password');
    });
    
    test('should lock account after 5 failed login attempts', async () => {
      const email = 'locktest@example.com';
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'correctpassword',
          first_name: 'Lock',
          last_name: 'Test',
          phone_number: '+447700900666'
        });
      
      // Fail 5 times
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email, password: 'wrongpassword' })
          .expect(401);
      }
      
      // 6th attempt should show account locked
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'correctpassword' })
        .expect(401);
      
      expect(response.body.error).toBe('account_locked');
      expect(response.body.message).toContain('locked');
    });
    
    test('should reset failed login attempts on successful login', async () => {
      const email = 'resetfail@example.com';
      const password = 'password123';
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password,
          first_name: 'Reset',
          last_name: 'Fail',
          phone_number: '+447700900777'
        });
      
      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email, password: 'wrongpassword' })
          .expect(401);
      }
      
      // Verify failed attempts
      const client = await pool.connect();
      try {
        let result = await client.query(
          'SELECT failed_login_attempts FROM users WHERE email = $1',
          [email]
        );
        expect(result.rows[0].failed_login_attempts).toBe(3);
        
        // Successful login
        await request(app)
          .post('/api/auth/login')
          .send({ email, password })
          .expect(200);
        
        // Verify reset
        result = await client.query(
          'SELECT failed_login_attempts FROM users WHERE email = $1',
          [email]
        );
        expect(result.rows[0].failed_login_attempts).toBe(0);
      } finally {
        client.release();
      }
    });
    
    test('should support remember_me for extended session', async () => {
      const { user } = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123',
          remember_me: true
        })
        .expect(200);
      
      // Verify session has extended expiry
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT remember_me, expires_at FROM sessions WHERE token = $1',
          [response.body.token]
        );
        expect(result.rows[0].remember_me).toBe(true);
        
        // Check expiry is ~30 days (with some tolerance)
        const expiresAt = new Date(result.rows[0].expires_at);
        const now = new Date();
        const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        expect(daysDiff).toBeGreaterThan(25); // At least 25 days
      } finally {
        client.release();
      }
    });
    
    test('should fail login for inactive account', async () => {
      const { user } = await createTestUser();
      
      // Deactivate account
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE users SET account_status = $1 WHERE user_id = $2',
          ['inactive', user.user_id]
        );
      } finally {
        client.release();
      }
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        })
        .expect(401);
      
      expect(response.body.error).toBe('account_inactive');
    });
  });
  
  describe('POST /api/auth/logout', () => {
    test('should logout and delete session', async () => {
      const { user, token } = await createTestUser();
      
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify session deleted
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM sessions WHERE token = $1',
          [token]
        );
        expect(result.rows.length).toBe(0);
      } finally {
        client.release();
      }
      
      // Verify token no longer works
      await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
    
    test('should return 401 if no token provided', async () => {
      await request(app)
        .post('/api/auth/logout')
        .expect(401);
    });
    
    test('should be idempotent (return success even if token already deleted)', async () => {
      const { token } = await createTestUser();
      
      // First logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Second logout with same token
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
  
  describe('POST /api/auth/forgot-password', () => {
    test('should create password reset token', async () => {
      const { user } = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: user.email })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      
      // Verify token created in database
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM password_reset_tokens WHERE user_id = $1 AND is_used = false',
          [user.user_id]
        );
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].expires_at).toBeDefined();
      } finally {
        client.release();
      }
    });
    
    test('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('If an account exists');
    });
    
    test('should log email sending attempt', async () => {
      const { user } = await createTestUser();
      
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: user.email })
        .expect(200);
      
      // Verify email log
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM email_logs WHERE recipient_email = $1 AND email_type = $2',
          [user.email, 'password_reset']
        );
        expect(result.rows.length).toBeGreaterThan(0);
      } finally {
        client.release();
      }
    });
  });
  
  describe('POST /api/auth/reset-password', () => {
    test('should reset password with valid token', async () => {
      const { user } = await createTestUser();
      
      // Create reset token
      const client = await pool.connect();
      try {
        const token = `reset_test_${Date.now()}`;
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        
        await client.query(`
          INSERT INTO password_reset_tokens 
          (token_id, user_id, token, expires_at, is_used, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [`token_${Date.now()}`, user.user_id, token, expiresAt, false, new Date().toISOString()]);
        
        // Reset password
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token,
            password: 'newpassword123'
          })
          .expect(200);
        
        expect(response.body.success).toBe(true);
        
        // Verify password changed (plain text)
        const result = await client.query(
          'SELECT password_hash FROM users WHERE user_id = $1',
          [user.user_id]
        );
        expect(result.rows[0].password_hash).toBe('newpassword123');
        
        // Verify token marked as used
        const tokenResult = await client.query(
          'SELECT is_used FROM password_reset_tokens WHERE token = $1',
          [token]
        );
        expect(tokenResult.rows[0].is_used).toBe(true);
      } finally {
        client.release();
      }
    });
    
    test('should reject expired token', async () => {
      const { user } = await createTestUser();
      
      const client = await pool.connect();
      try {
        const token = `reset_expired_${Date.now()}`;
        const expiresAt = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
        
        await client.query(`
          INSERT INTO password_reset_tokens 
          (token_id, user_id, token, expires_at, is_used, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [`token_exp_${Date.now()}`, user.user_id, token, expiresAt, false, new Date().toISOString()]);
        
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token,
            password: 'newpassword123'
          })
          .expect(400);
        
        expect(response.body.error).toBe('invalid_token');
      } finally {
        client.release();
      }
    });
    
    test('should reject already used token', async () => {
      const { user } = await createTestUser();
      
      const client = await pool.connect();
      try {
        const token = `reset_used_${Date.now()}`;
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        
        await client.query(`
          INSERT INTO password_reset_tokens 
          (token_id, user_id, token, expires_at, is_used, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [`token_used_${Date.now()}`, user.user_id, token, expiresAt, true, new Date().toISOString()]);
        
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token,
            password: 'newpassword123'
          })
          .expect(400);
        
        expect(response.body.error).toBe('token_used');
      } finally {
        client.release();
      }
    });
  });
});

// ============================================
// USER MANAGEMENT TESTS
// ============================================

describe('User Management Endpoints', () => {
  describe('GET /api/users/me', () => {
    test('should return current user profile', async () => {
      const { user, token } = await createTestUser();
      
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.user_id).toBe(user.user_id);
      expect(response.body.email).toBe(user.email);
      expect(response.body).not.toHaveProperty('password_hash');
    });
    
    test('should return 401 without valid token', async () => {
      await request(app)
        .get('/api/users/me')
        .expect(401);
    });
    
    test('should update last_activity_at on request', async () => {
      const { user, token } = await createTestUser();
      
      await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify session updated
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT last_activity_at FROM sessions WHERE token = $1',
          [token]
        );
        
        const lastActivity = new Date(result.rows[0].last_activity_at);
        const now = new Date();
        const diffMs = now.getTime() - lastActivity.getTime();
        expect(diffMs).toBeLessThan(5000); // Within 5 seconds
      } finally {
        client.release();
      }
    });
  });
  
  describe('PUT /api/users/me', () => {
    test('should update user profile', async () => {
      const { user, token } = await createTestUser();
      
      const updates = {
        first_name: 'Updated',
        last_name: 'Name',
        phone_number: '+447700900999'
      };
      
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);
      
      expect(response.body.first_name).toBe(updates.first_name);
      expect(response.body.last_name).toBe(updates.last_name);
      expect(response.body.phone_number).toBe(updates.phone_number);
    });
    
    test('should reject email change without current password', async () => {
      const { token } = await createTestUser();
      
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newemail@example.com'
        })
        .expect(400);
      
      expect(response.body.error).toBe('password_required');
    });
    
    test('should allow email change with correct password', async () => {
      const { user, token } = await createTestUser();
      
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newemail@example.com',
          current_password: 'password123'
        })
        .expect(200);
      
      expect(response.body.email).toBe('newemail@example.com');
    });
    
    test('should reject email change if email already exists', async () => {
      const { token } = await createTestUser();
      const { user: user2 } = await createTestUser();
      
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: user2.email,
          current_password: 'password123'
        })
        .expect(400);
      
      expect(response.body.error).toBe('email_exists');
    });
  });
  
  describe('POST /api/users/me/change-password', () => {
    test('should change password with correct current password', async () => {
      const { user, token } = await createTestUser();
      
      const response = await request(app)
        .post('/api/users/me/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'password123',
          new_password: 'newpassword456'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      
      // Verify new password works (plain text)
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT password_hash FROM users WHERE user_id = $1',
          [user.user_id]
        );
        expect(result.rows[0].password_hash).toBe('newpassword456');
      } finally {
        client.release();
      }
      
      // Verify can login with new password
      await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'newpassword456'
        })
        .expect(200);
    });
    
    test('should reject incorrect current password', async () => {
      const { token } = await createTestUser();
      
      const response = await request(app)
        .post('/api/users/me/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          current_password: 'wrongpassword',
          new_password: 'newpassword456'
        })
        .expect(400);
      
      expect(response.body.error).toBe('invalid_current_password');
    });
    
    test('should invalidate all other sessions on password change', async () => {
      const { user } = await createTestUser();
      
      // Create two sessions
      const token1 = await loginUser(user.email, 'password123');
      const token2 = await loginUser(user.email, 'password123');
      
      // Change password using token1
      await request(app)
        .post('/api/users/me/change-password')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          current_password: 'password123',
          new_password: 'newpassword456'
        })
        .expect(200);
      
      // Verify token1 still works (current session)
      await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      
      // Verify token2 is invalidated
      await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token2}`)
        .expect(401);
    });
  });
});

// ============================================
// LOCATION TESTS
// ============================================

describe('Location Endpoints', () => {
  describe('GET /api/locations', () => {
    test('should return all locations', async () => {
      const response = await request(app)
        .get('/api/locations')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('location_id');
      expect(response.body[0]).toHaveProperty('location_name');
      expect(response.body[0]).toHaveProperty('is_collection_enabled');
    });
    
    test('should filter by collection enabled', async () => {
      const response = await request(app)
        .get('/api/locations')
        .query({ is_collection_enabled: true })
        .expect(200);
      
      expect(response.body.every((loc: any) => loc.is_collection_enabled === true)).toBe(true);
    });
    
    test('should filter by delivery enabled', async () => {
      const response = await request(app)
        .get('/api/locations')
        .query({ is_delivery_enabled: true })
        .expect(200);
      
      expect(response.body.every((loc: any) => loc.is_delivery_enabled === true)).toBe(true);
    });
  });
  
  describe('GET /api/locations/:location_id', () => {
    test('should return specific location by ID', async () => {
      const response = await request(app)
        .get('/api/locations/loc_test1')
        .expect(200);
      
      expect(response.body.location_id).toBe('loc_test1');
      expect(response.body.location_name).toBe('Test Location 1');
      expect(response.body.opening_hours).toBeDefined();
    });
    
    test('should return 404 for non-existent location', async () => {
      await request(app)
        .get('/api/locations/nonexistent')
        .expect(404);
    });
  });
});

// ============================================
// PRODUCT TESTS
// ============================================

describe('Product Endpoints', () => {
  describe('GET /api/products', () => {
    test('should return products with pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ limit: 10, offset: 0 })
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
      expect(response.body).toHaveProperty('has_more');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('should filter products by location', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ location_name: 'Test Location 1' })
        .expect(200);
      
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Verify products are assigned to this location
      const productIds = response.body.data.map((p: any) => p.product_id);
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT product_id FROM product_locations WHERE location_name = $1 AND product_id = ANY($2)',
          ['Test Location 1', productIds]
        );
        expect(result.rows.length).toBe(productIds.length);
      } finally {
        client.release();
      }
    });
    
    test('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ category: 'pastries' })
        .expect(200);
      
      expect(response.body.data.every((p: any) => p.category === 'pastries')).toBe(true);
    });
    
    test('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ min_price: 3, max_price: 4 })
        .expect(200);
      
      expect(response.body.data.every((p: any) => p.price >= 3 && p.price <= 4)).toBe(true);
    });
    
    test('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ query: 'Croissant' })
        .expect(200);
      
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.some((p: any) => 
        p.product_name.toLowerCase().includes('croissant')
      )).toBe(true);
    });
    
    test('should hide out of stock products when requested', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ hide_out_of_stock: true })
        .expect(200);
      
      expect(response.body.data.every((p: any) => 
        p.availability_status !== 'out_of_stock'
      )).toBe(true);
    });
    
    test('should sort by price', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ sort_by: 'price', sort_order: 'asc' })
        .expect(200);
      
      const prices = response.body.data.map((p: any) => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });
  });
  
  describe('GET /api/products/:product_id', () => {
    test('should return product details', async () => {
      const response = await request(app)
        .get('/api/products/prod_test1')
        .expect(200);
      
      expect(response.body.product_id).toBe('prod_test1');
      expect(response.body.product_name).toBe('Test Croissant');
      expect(response.body.price).toBe(3.50);
    });
    
    test('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/products/nonexistent')
        .expect(404);
    });
  });
  
  describe('POST /api/products (Admin Only)', () => {
    test('should create new product with admin token', async () => {
      const { token } = await createAdminUser();
      
      const productData = {
        product_name: 'New Test Product',
        short_description: 'A new test product',
        category: 'pastries',
        price: 5.99,
        primary_image_url: 'http://example.com/newproduct.jpg',
        location_assignments: ['Test Location 1']
      };
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(productData)
        .expect(201);
      
      expect(response.body.product_name).toBe(productData.product_name);
      expect(response.body.price).toBe(productData.price);
      expect(response.body.product_id).toBeDefined();
      
      // Verify location assignment
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM product_locations WHERE product_id = $1',
          [response.body.product_id]
        );
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].location_name).toBe('Test Location 1');
      } finally {
        client.release();
      }
    });
    
    test('should reject product creation from customer', async () => {
      const { token } = await createTestUser();
      
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_name: 'Unauthorized Product',
          short_description: 'Should fail',
          category: 'cakes',
          price: 4.99,
          primary_image_url: 'http://example.com/test.jpg'
        })
        .expect(403);
    });
  });
});

// ============================================
// ORDER MANAGEMENT TESTS
// ============================================

describe('Order Endpoints', () => {
  describe('POST /api/orders', () => {
    test('should create guest order without user_id', async () => {
      const orderData = {
        user_id: null,
        customer_email: 'guest@example.com',
        customer_name: 'Guest User',
        customer_phone: '+447700900123',
        location_name: 'Test Location 1',
        order_type: 'standard',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 2,
            product_specific_notes: null
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(response.body.order_id).toBeDefined();
      expect(response.body.order_number).toMatch(/^KK-\d+$/);
      expect(response.body.user_id).toBeNull();
      expect(response.body.customer_email).toBe(orderData.customer_email);
      expect(response.body.order_status).toBe('paid_awaiting_confirmation');
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].quantity).toBe(2);
    });
    
    test('should create registered user order with loyalty points', async () => {
      const { user, token } = await createTestUser();
      
      // Give user some loyalty points first
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE users SET loyalty_points_balance = $1 WHERE user_id = $2',
          [500, user.user_id]
        );
      } finally {
        client.release();
      }
      
      const orderData = {
        user_id: user.user_id,
        customer_email: user.email,
        customer_name: `${user.first_name} ${user.last_name}`,
        customer_phone: user.phone_number,
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        loyalty_points_used: 100,
        items: [
          {
            product_id: 'prod_test1',
            quantity: 1
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(response.body.loyalty_points_used).toBe(100);
      expect(response.body.discount_amount).toBeGreaterThan(0);
      
      // Verify points deducted
      const updatedUser = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(updatedUser.body.loyalty_points_balance).toBe(400); // 500 - 100
    });
    
    test('should calculate delivery fee correctly', async () => {
      const orderData = {
        customer_email: 'delivery@example.com',
        customer_name: 'Delivery User',
        customer_phone: '+447700900456',
        location_name: 'Test Location 1',
        fulfillment_method: 'delivery',
        delivery_address_line1: '123 Test St',
        delivery_city: 'Test City',
        delivery_postal_code: 'T1 1TT',
        payment_method: 'card',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 1 // Subtotal: 3.50
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      // Should have delivery fee (subtotal < free_delivery_threshold of 25)
      expect(response.body.delivery_fee).toBe(3.99);
      expect(response.body.subtotal).toBe(3.50);
      expect(response.body.total_amount).toBeGreaterThan(response.body.subtotal);
    });
    
    test('should apply free delivery threshold', async () => {
      const orderData = {
        customer_email: 'freedel@example.com',
        customer_name: 'Free Delivery',
        customer_phone: '+447700900789',
        location_name: 'Test Location 1',
        fulfillment_method: 'delivery',
        delivery_address_line1: '456 Test Ave',
        delivery_city: 'Test City',
        delivery_postal_code: 'T1 2TT',
        payment_method: 'card',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 8 // 8 * 3.50 = 28.00 (over 25 threshold)
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(response.body.delivery_fee).toBe(0);
      expect(response.body.subtotal).toBe(28.00);
    });
    
    test('should validate promo code and apply discount', async () => {
      // Create active promo code
      const client = await pool.connect();
      try {
        const now = new Date().toISOString();
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        await client.query(`
          INSERT INTO promo_codes (
            code_id, code, discount_type, discount_value, minimum_order_value,
            valid_from, valid_until, is_active, times_used, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          'promo_test1', 'TESTCODE10', 'percentage', 10, 10,
          now, futureDate, true, 0, now, now
        ]);
      } finally {
        client.release();
      }
      
      const orderData = {
        customer_email: 'promo@example.com',
        customer_name: 'Promo User',
        customer_phone: '+447700900321',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        promo_code: 'TESTCODE10',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 4 // 14.00 subtotal
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(response.body.promo_code).toBe('TESTCODE10');
      expect(response.body.discount_amount).toBeCloseTo(1.40, 2); // 10% of 14.00
    });
    
    test('should reject invalid promo code', async () => {
      const orderData = {
        customer_email: 'invalid@example.com',
        customer_name: 'Invalid Promo',
        customer_phone: '+447700900654',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        promo_code: 'INVALIDCODE',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 1
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(response.body.error).toBe('invalid_promo_code');
    });
    
    test('should generate collection code for collection orders', async () => {
      const orderData = {
        customer_email: 'collection@example.com',
        customer_name: 'Collection User',
        customer_phone: '+447700900987',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 1
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(response.body.collection_code).toMatch(/^COL-\d{4}$/);
    });
    
    test('should not generate collection code for delivery orders', async () => {
      const orderData = {
        customer_email: 'nocode@example.com',
        customer_name: 'No Code',
        customer_phone: '+447700900147',
        location_name: 'Test Location 1',
        fulfillment_method: 'delivery',
        delivery_address_line1: '789 Test Rd',
        delivery_city: 'Test City',
        delivery_postal_code: 'T1 3TT',
        payment_method: 'card',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 1
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(response.body.collection_code).toBeNull();
    });
    
    test('should reject order with out of stock product', async () => {
      // Mark product as out of stock
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE products SET availability_status = $1 WHERE product_id = $2',
          ['out_of_stock', 'prod_test1']
        );
      } finally {
        client.release();
      }
      
      const orderData = {
        customer_email: 'outofstock@example.com',
        customer_name: 'Out Stock',
        customer_phone: '+447700900258',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 1
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);
      
      expect(response.body.error).toBe('product_unavailable');
    });
    
    test('should calculate loyalty points to be earned', async () => {
      const { user } = await createTestUser();
      
      const orderData = {
        user_id: user.user_id,
        customer_email: user.email,
        customer_name: `${user.first_name} ${user.last_name}`,
        customer_phone: user.phone_number,
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 3 // 10.50 subtotal
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      // Points earned = subtotal * points_per_pound (from system_settings, assume 1)
      expect(response.body.loyalty_points_earned).toBeGreaterThan(0);
    });
    
    test('should create corporate order with event details', async () => {
      const orderData = {
        customer_email: 'corporate@company.com',
        customer_name: 'Corporate Client',
        customer_phone: '+447700900369',
        location_name: 'Test Location 1',
        order_type: 'corporate',
        fulfillment_method: 'delivery',
        delivery_address_line1: '100 Corporate Plaza',
        delivery_city: 'Business District',
        delivery_postal_code: 'BD1 1BD',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        guest_count: 50,
        event_type: 'board_meeting',
        company_name: 'Test Corp Ltd',
        payment_method: 'card',
        items: [
          {
            product_id: 'prod_test1',
            quantity: 10
          }
        ]
      };
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(response.body.order_type).toBe('corporate');
      expect(response.body.order_number).toMatch(/^CE-\d+$/); // Corporate event prefix
      expect(response.body.event_date).toBeDefined();
      expect(response.body.guest_count).toBe(50);
    });
  });
  
  describe('GET /api/orders/:order_id', () => {
    test('should return order details for owner', async () => {
      const { user, token } = await createTestUser();
      
      // Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: user.user_id,
          customer_email: user.email,
          customer_name: `${user.first_name} ${user.last_name}`,
          customer_phone: user.phone_number,
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      const orderId = orderResponse.body.order_id;
      
      // Retrieve order
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.order_id).toBe(orderId);
      expect(response.body.items).toBeDefined();
      expect(response.body.status_history).toBeDefined();
    });
    
    test('should reject access to other user orders', async () => {
      const { user: user1 } = await createTestUser();
      const { token: token2 } = await createTestUser();
      
      // Create order for user1
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: user1.user_id,
          customer_email: user1.email,
          customer_name: `${user1.first_name} ${user1.last_name}`,
          customer_phone: user1.phone_number,
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      // Try to access with user2's token
      await request(app)
        .get(`/api/orders/${orderResponse.body.order_id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);
    });
    
    test('should allow staff to access orders from assigned location', async () => {
      // Create staff user
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create order at Test Location 1
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          customer_email: 'stafftest@example.com',
          customer_name: 'Staff Test',
          customer_phone: '+447700900741',
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      // Staff should be able to access
      const response = await request(app)
        .get(`/api/orders/${orderResponse.body.order_id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);
      
      expect(response.body.order_id).toBe(orderResponse.body.order_id);
    });
    
    test('should reject staff access to orders from non-assigned location', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 2');
      
      // Create order at Test Location 1
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          customer_email: 'wrongloc@example.com',
          customer_name: 'Wrong Location',
          customer_phone: '+447700900852',
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      await request(app)
        .get(`/api/orders/${orderResponse.body.order_id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });
  });
  
  describe('PUT /api/orders/:order_id/status', () => {
    test('should update order status with valid transition', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          customer_email: 'statustest@example.com',
          customer_name: 'Status Test',
          customer_phone: '+447700900963',
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      const orderId = orderResponse.body.order_id;
      
      // Update status: paid_awaiting_confirmation -> preparing
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          order_status: 'preparing',
          notes: 'Started preparation'
        })
        .expect(200);
      
      expect(response.body.order_status).toBe('preparing');
      expect(response.body.status_history.length).toBeGreaterThan(1);
      
      // Find the status change in history
      const statusChange = response.body.status_history.find(
        (h: any) => h.new_status === 'preparing'
      );
      expect(statusChange).toBeDefined();
      expect(statusChange.notes).toBe('Started preparation');
    });
    
    test('should reject invalid status transition', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          customer_email: 'invalidtrans@example.com',
          customer_name: 'Invalid Transition',
          customer_phone: '+447700900147',
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      // Try to jump from paid_awaiting_confirmation to completed (invalid)
      const response = await request(app)
        .put(`/api/orders/${orderResponse.body.order_id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          order_status: 'completed'
        })
        .expect(400);
      
      expect(response.body.error).toBe('invalid_status_transition');
    });
    
    test('should award loyalty points on order completion', async () => {
      const { user, token: userToken } = await createTestUser();
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: user.user_id,
          customer_email: user.email,
          customer_name: `${user.first_name} ${user.last_name}`,
          customer_phone: user.phone_number,
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 2 } // 7.00 subtotal
          ]
        });
      
      const orderId = orderResponse.body.order_id;
      const pointsToEarn = orderResponse.body.loyalty_points_earned;
      
      // Update to preparing
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'preparing' })
        .expect(200);
      
      // Update to ready_for_collection
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'ready_for_collection' })
        .expect(200);
      
      // Update to collected (completion)
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'completed' })
        .expect(200);
      
      // Verify points awarded
      const userResponse = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(userResponse.body.loyalty_points_balance).toBe(pointsToEarn);
      
      // Verify transaction created
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM loyalty_points_transactions WHERE user_id = $1 AND order_id = $2',
          [user.user_id, orderId]
        );
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].transaction_type).toBe('earned');
        expect(result.rows[0].points_change).toBe(pointsToEarn);
      } finally {
        client.release();
      }
    });
  });
  
  describe('GET /api/orders', () => {
    test('should return user orders for customer', async () => {
      const { user, token } = await createTestUser();
      
      // Create 2 orders
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/orders')
          .send({
            user_id: user.user_id,
            customer_email: user.email,
            customer_name: `${user.first_name} ${user.last_name}`,
            customer_phone: user.phone_number,
            location_name: 'Test Location 1',
            fulfillment_method: 'collection',
            payment_method: 'card',
            items: [
              { product_id: 'prod_test1', quantity: 1 }
            ]
          });
      }
      
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every((o: any) => o.user_id === user.user_id)).toBe(true);
    });
    
    test('should filter orders by status', async () => {
      const { user, token } = await createTestUser();
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: user.user_id,
          customer_email: user.email,
          customer_name: `${user.first_name} ${user.last_name}`,
          customer_phone: user.phone_number,
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      // Update to preparing
      await request(app)
        .put(`/api/orders/${orderResponse.body.order_id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'preparing' });
      
      // Filter by preparing status
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .query({ order_status: 'preparing' })
        .expect(200);
      
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].order_status).toBe('preparing');
    });
    
    test('should return location-specific orders for staff', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create order at Test Location 1
      await request(app)
        .post('/api/orders')
        .send({
          customer_email: 'loc1@example.com',
          customer_name: 'Loc 1 Customer',
          customer_phone: '+447700900111',
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);
      
      expect(response.body.data.every((o: any) => 
        o.location_name === 'Test Location 1'
      )).toBe(true);
    });
  });
});

// ============================================
// LOYALTY POINTS TESTS
// ============================================

describe('Loyalty Points Endpoints', () => {
  describe('GET /api/loyalty-points/transactions', () => {
    test('should return user loyalty points history', async () => {
      const { user, token } = await createTestUser();
      
      // Create order to earn points
      await request(app)
        .post('/api/orders')
        .send({
          user_id: user.user_id,
          customer_email: user.email,
          customer_name: `${user.first_name} ${user.last_name}`,
          customer_phone: user.phone_number,
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 5 } // Should earn points
          ]
        });
      
      // Complete the order to award points
      // (This requires staff token to update status - implementation detail)
      
      const response = await request(app)
        .get('/api/loyalty-points/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('should filter transactions by type', async () => {
      const { user, token } = await createTestUser();
      
      // Manually create transactions
      const client = await pool.connect();
      try {
        const now = new Date().toISOString();
        
        await client.query(`
          INSERT INTO loyalty_points_transactions 
          (transaction_id, user_id, transaction_type, points_change, balance_after, description, created_at)
          VALUES 
            ($1, $2, 'earned', 100, 100, 'Test earned', $3),
            ($4, $5, 'redeemed', -50, 50, 'Test redeemed', $6)
        `, [
          `trans_${Date.now()}_1`, user.user_id, now,
          `trans_${Date.now()}_2`, user.user_id, now
        ]);
      } finally {
        client.release();
      }
      
      // Filter by earned
      const response = await request(app)
        .get('/api/loyalty-points/transactions')
        .set('Authorization', `Bearer ${token}`)
        .query({ transaction_type: 'earned' })
        .expect(200);
      
      expect(response.body.data.every((t: any) => 
        t.transaction_type === 'earned'
      )).toBe(true);
    });
  });
  
  describe('GET /api/loyalty-points/balance', () => {
    test('should return current points balance', async () => {
      const { user, token } = await createTestUser();
      
      // Set balance
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE users SET loyalty_points_balance = $1 WHERE user_id = $2',
          [750, user.user_id]
        );
      } finally {
        client.release();
      }
      
      const response = await request(app)
        .get('/api/loyalty-points/balance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.balance).toBe(750);
      expect(response.body.user_id).toBe(user.user_id);
    });
  });
});

// ============================================
// FEEDBACK TESTS
// ============================================

describe('Feedback Endpoints', () => {
  describe('POST /api/feedback/customer', () => {
    test('should submit customer feedback for completed order', async () => {
      const { user, token } = await createTestUser();
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create and complete order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: user.user_id,
          customer_email: user.email,
          customer_name: `${user.first_name} ${user.last_name}`,
          customer_phone: user.phone_number,
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      const orderId = orderResponse.body.order_id;
      
      // Complete order
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'preparing' });
      
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'ready_for_collection' });
      
      await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'completed' });
      
      // Submit feedback
      const feedbackData = {
        order_id: orderId,
        overall_rating: 5,
        product_rating: 5,
        fulfillment_rating: 5,
        overall_comment: 'Great experience!',
        allow_contact: true
      };
      
      const response = await request(app)
        .post('/api/feedback/customer')
        .set('Authorization', `Bearer ${token}`)
        .send(feedbackData)
        .expect(201);
      
      expect(response.body.feedback_id).toBeDefined();
      expect(response.body.overall_rating).toBe(5);
      expect(response.body.order_id).toBe(orderId);
    });
    
    test('should reject feedback for non-completed order', async () => {
      const { user, token } = await createTestUser();
      
      // Create order (not completed)
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: user.user_id,
          customer_email: user.email,
          customer_name: `${user.first_name} ${user.last_name}`,
          customer_phone: user.phone_number,
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      const response = await request(app)
        .post('/api/feedback/customer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          order_id: orderResponse.body.order_id,
          overall_rating: 5,
          product_rating: 5,
          fulfillment_rating: 5
        })
        .expect(400);
      
      expect(response.body.error).toBe('order_not_completed');
    });
    
    test('should reject duplicate feedback for same order', async () => {
      const { user, token } = await createTestUser();
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create and complete order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: user.user_id,
          customer_email: user.email,
          customer_name: `${user.first_name} ${user.last_name}`,
          customer_phone: user.phone_number,
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      // Complete order
      await request(app)
        .put(`/api/orders/${orderResponse.body.order_id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'preparing' });
      
      await request(app)
        .put(`/api/orders/${orderResponse.body.order_id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'ready_for_collection' });
      
      await request(app)
        .put(`/api/orders/${orderResponse.body.order_id}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'completed' });
      
      // First feedback
      await request(app)
        .post('/api/feedback/customer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          order_id: orderResponse.body.order_id,
          overall_rating: 5,
          product_rating: 5,
          fulfillment_rating: 5
        })
        .expect(201);
      
      // Second feedback (should fail)
      const response = await request(app)
        .post('/api/feedback/customer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          order_id: orderResponse.body.order_id,
          overall_rating: 4,
          product_rating: 4,
          fulfillment_rating: 4
        })
        .expect(400);
      
      expect(response.body.error).toBe('feedback_already_submitted');
    });
  });
  
  describe('POST /api/feedback/staff', () => {
    test('should submit staff feedback with reference number', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      const feedbackData = {
        location_name: 'Test Location 1',
        feedback_type: 'equipment_issue',
        title: 'Oven Temperature Problem',
        description: 'Main oven not reaching correct temperature',
        priority: 'high'
      };
      
      const response = await request(app)
        .post('/api/feedback/staff')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(feedbackData)
        .expect(201);
      
      expect(response.body.reference_number).toMatch(/^SF-\d{4}-\d{4}$/);
      expect(response.body.feedback_type).toBe('equipment_issue');
      expect(response.body.status).toBe('pending_review');
    });
    
    test('should auto-set priority to urgent for safety concerns', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      const feedbackData = {
        location_name: 'Test Location 1',
        feedback_type: 'safety_concern',
        title: 'Wet Floor Hazard',
        description: 'Floor near entrance is slippery',
        priority: 'medium' // Will be overridden
      };
      
      const response = await request(app)
        .post('/api/feedback/staff')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(feedbackData)
        .expect(201);
      
      expect(response.body.priority).toBe('urgent');
    });
    
    test('should support anonymous feedback submission', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      const feedbackData = {
        location_name: 'Test Location 1',
        feedback_type: 'complaint',
        title: 'Workplace Issue',
        description: 'Sensitive workplace matter',
        is_anonymous: true
      };
      
      const response = await request(app)
        .post('/api/feedback/staff')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(feedbackData)
        .expect(201);
      
      expect(response.body.is_anonymous).toBe(true);
    });
  });
});

// ============================================
// INVENTORY ALERTS TESTS
// ============================================

describe('Inventory Alert Endpoints', () => {
  describe('POST /api/inventory/alerts', () => {
    test('should create inventory alert with reference number', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      const alertData = {
        location_name: 'Test Location 1',
        item_name: 'Chocolate Chips',
        alert_type: 'low_stock',
        current_quantity: 5,
        notes: 'Running low, need reorder',
        priority: 'medium'
      };
      
      const response = await request(app)
        .post('/api/inventory/alerts')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(alertData)
        .expect(201);
      
      expect(response.body.reference_number).toMatch(/^IA-\d{4}-\d{4}$/);
      expect(response.body.alert_type).toBe('low_stock');
      expect(response.body.status).toBe('pending');
    });
    
    test('should auto-set high priority for out_of_stock alerts', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      const alertData = {
        location_name: 'Test Location 1',
        item_name: 'Butter',
        alert_type: 'out_of_stock',
        current_quantity: 0,
        priority: 'low' // Will be overridden
      };
      
      const response = await request(app)
        .post('/api/inventory/alerts')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(alertData)
        .expect(201);
      
      expect(response.body.priority).toBe('high');
    });
  });
  
  describe('PUT /api/inventory/alerts/:alert_id', () => {
    test('should allow admin to acknowledge alert', async () => {
      const { token: staffToken, user_id: staffUserId } = await createStaffUser('Test Location 1');
      const { token: adminToken, user_id: adminUserId } = await createAdminUser();
      
      // Create alert
      const alertResponse = await request(app)
        .post('/api/inventory/alerts')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          location_name: 'Test Location 1',
          item_name: 'Flour',
          alert_type: 'low_stock',
          current_quantity: 3
        });
      
      // Admin acknowledges
      const response = await request(app)
        .put(`/api/inventory/alerts/${alertResponse.body.alert_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'acknowledged'
        })
        .expect(200);
      
      expect(response.body.status).toBe('acknowledged');
      expect(response.body.acknowledged_by_user_id).toBe(adminUserId);
      expect(response.body.acknowledged_at).toBeDefined();
    });
    
    test('should allow admin to resolve alert with notes', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      const { token: adminToken } = await createAdminUser();
      
      const alertResponse = await request(app)
        .post('/api/inventory/alerts')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          location_name: 'Test Location 1',
          item_name: 'Sugar',
          alert_type: 'low_stock',
          current_quantity: 2
        });
      
      const response = await request(app)
        .put(`/api/inventory/alerts/${alertResponse.body.alert_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved',
          resolution_notes: 'Reordered 20kg, arriving tomorrow'
        })
        .expect(200);
      
      expect(response.body.status).toBe('resolved');
      expect(response.body.resolution_notes).toBe('Reordered 20kg, arriving tomorrow');
      expect(response.body.resolved_at).toBeDefined();
    });
  });
});

// ============================================
// TRAINING COURSE TESTS
// ============================================

describe('Training Course Endpoints', () => {
  describe('GET /api/training/courses', () => {
    test('should return published courses for staff', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create published course
      const { token: adminToken } = await createAdminUser();
      
      const courseData = {
        course_title: 'Test Safety Course',
        short_description: 'Test course description',
        cover_image_url: 'http://example.com/course.jpg',
        category: 'safety',
        status: 'published',
        is_required: true
      };
      
      await request(app)
        .post('/api/training/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(courseData);
      
      const response = await request(app)
        .get('/api/training/courses')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);
      
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((c: any) => c.status === 'published')).toBe(true);
    });
    
    test('should not show draft courses to staff', async () => {
      const { token: adminToken } = await createAdminUser();
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      // Create draft course
      await request(app)
        .post('/api/training/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          course_title: 'Draft Course',
          short_description: 'Not published yet',
          cover_image_url: 'http://example.com/draft.jpg',
          category: 'baking',
          status: 'draft'
        });
      
      const response = await request(app)
        .get('/api/training/courses')
        .set('Authorization', `Bearer ${staffToken}`)
        .query({ status: 'draft' })
        .expect(200);
      
      expect(response.body.data.length).toBe(0);
    });
    
    test('should filter courses by category', async () => {
      const { token: staffToken } = await createStaffUser('Test Location 1');
      
      const response = await request(app)
        .get('/api/training/courses')
        .set('Authorization', `Bearer ${staffToken}`)
        .query({ category: 'safety' })
        .expect(200);
      
      expect(response.body.data.every((c: any) => 
        c.category === 'safety'
      )).toBe(true);
    });
  });
  
  describe('POST /api/training/lessons/:lesson_id/complete', () => {
    test('should mark lesson as completed and update course progress', async () => {
      const { user_id: staffUserId, token: staffToken } = await createStaffUser('Test Location 1');
      const { token: adminToken } = await createAdminUser();
      
      // Create course with lesson
      const courseResponse = await request(app)
        .post('/api/training/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          course_title: 'Test Course',
          short_description: 'Test',
          cover_image_url: 'http://example.com/test.jpg',
          category: 'safety',
          status: 'published'
        });
      
      const courseId = courseResponse.body.course_id;
      
      // Add lesson
      const client = await pool.connect();
      try {
        const lessonId = `lesson_${Date.now()}`;
        const now = new Date().toISOString();
        
        await client.query(`
          INSERT INTO training_lessons (
            lesson_id, course_id, lesson_title, lesson_type,
            duration_minutes, lesson_order, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [lessonId, courseId, 'Test Lesson', 'video', 30, 1, now, now]);
        
        // Mark as complete
        const response = await request(app)
          .post(`/api/training/lessons/${lessonId}/complete`)
          .set('Authorization', `Bearer ${staffToken}`)
          .send({
            personal_notes: 'Good lesson, learned a lot'
          })
          .expect(200);
        
        expect(response.body.success).toBe(true);
        
        // Verify completion record
        const result = await client.query(
          'SELECT * FROM staff_lesson_completion WHERE user_id = $1 AND lesson_id = $2',
          [staffUserId, lessonId]
        );
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].is_completed).toBe(true);
        expect(result.rows[0].personal_notes).toBe('Good lesson, learned a lot');
      } finally {
        client.release();
      }
    });
  });
});

// ============================================
// PROMO CODE TESTS
// ============================================

describe('Promo Code Endpoints', () => {
  describe('POST /api/promo-codes/validate', () => {
    test('should validate active promo code', async () => {
      // Create promo code
      const client = await pool.connect();
      try {
        const now = new Date().toISOString();
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        await client.query(`
          INSERT INTO promo_codes (
            code_id, code, discount_type, discount_value, minimum_order_value,
            valid_from, valid_until, is_active, times_used, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          `promo_${Date.now()}`, 'VALID20', 'percentage', 20, 15,
          now, futureDate, true, 0, now, now
        ]);
      } finally {
        client.release();
      }
      
      const response = await request(app)
        .post('/api/promo-codes/validate')
        .send({
          code: 'VALID20',
          order_total: 25.00,
          location_name: 'Test Location 1',
          product_ids: ['prod_test1']
        })
        .expect(200);
      
      expect(response.body.is_valid).toBe(true);
      expect(response.body.discount_amount).toBeCloseTo(5.00, 2); // 20% of 25
    });
    
    test('should reject expired promo code', async () => {
      const client = await pool.connect();
      try {
        const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const now = new Date().toISOString();
        
        await client.query(`
          INSERT INTO promo_codes (
            code_id, code, discount_type, discount_value,
            valid_from, valid_until, is_active, times_used, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          `promo_exp_${Date.now()}`, 'EXPIRED10', 'percentage', 10,
          pastDate, pastDate, true, 0, now, now
        ]);
      } finally {
        client.release();
      }
      
      const response = await request(app)
        .post('/api/promo-codes/validate')
        .send({
          code: 'EXPIRED10',
          order_total: 20.00,
          location_name: 'Test Location 1'
        })
        .expect(200);
      
      expect(response.body.is_valid).toBe(false);
      expect(response.body.message).toContain('expired');
    });
    
    test('should reject code if minimum order value not met', async () => {
      const client = await pool.connect();
      try {
        const now = new Date().toISOString();
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        await client.query(`
          INSERT INTO promo_codes (
            code_id, code, discount_type, discount_value, minimum_order_value,
            valid_from, valid_until, is_active, times_used, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          `promo_min_${Date.now()}`, 'MIN30', 'percentage', 15, 30,
          now, futureDate, true, 0, now, now
        ]);
      } finally {
        client.release();
      }
      
      const response = await request(app)
        .post('/api/promo-codes/validate')
        .send({
          code: 'MIN30',
          order_total: 20.00, // Below minimum
          location_name: 'Test Location 1'
        })
        .expect(200);
      
      expect(response.body.is_valid).toBe(false);
      expect(response.body.message).toContain('minimum order');
    });
  });
});

// ============================================
// ANALYTICS TESTS
// ============================================

describe('Analytics Endpoints', () => {
  describe('GET /api/analytics/dashboard', () => {
    test('should return dashboard metrics for admin', async () => {
      const { token: adminToken } = await createAdminUser();
      
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('today_orders_count');
      expect(response.body).toHaveProperty('today_revenue');
      expect(response.body).toHaveProperty('orders_by_status');
      expect(response.body).toHaveProperty('top_products');
    });
    
    test('should reject access from non-admin users', async () => {
      const { token } = await createTestUser();
      
      await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
    
    test('should filter metrics by date range', async () => {
      const { token: adminToken } = await createAdminUser();
      
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          date_range: 'this_week'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('this_week_orders_count');
    });
  });
});

// ============================================
// ADDRESS MANAGEMENT TESTS
// ============================================

describe('Address Endpoints', () => {
  describe('POST /api/addresses', () => {
    test('should create new address for user', async () => {
      const { token } = await createTestUser();
      
      const addressData = {
        address_label: 'Home',
        address_line1: '123 Test Street',
        city: 'Test City',
        postal_code: 'T1 1TT',
        delivery_instructions: 'Ring doorbell',
        is_default: true
      };
      
      const response = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send(addressData)
        .expect(201);
      
      expect(response.body.address_id).toBeDefined();
      expect(response.body.address_line1).toBe(addressData.address_line1);
      expect(response.body.is_default).toBe(true);
    });
    
    test('should auto-unset previous default when setting new default', async () => {
      const { token } = await createTestUser();
      
      // Create first default address
      await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address_line1: '111 First St',
          city: 'Test City',
          postal_code: 'T1 1AA',
          is_default: true
        });
      
      // Create second default address
      const response = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address_line1: '222 Second Ave',
          city: 'Test City',
          postal_code: 'T1 2BB',
          is_default: true
        })
        .expect(201);
      
      expect(response.body.is_default).toBe(true);
      
      // Verify first address is no longer default
      const allAddresses = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      const defaultAddresses = allAddresses.body.filter((a: any) => a.is_default);
      expect(defaultAddresses.length).toBe(1);
      expect(defaultAddresses[0].address_line1).toBe('222 Second Ave');
    });
  });
  
  describe('GET /api/addresses', () => {
    test('should return user addresses', async () => {
      const { token } = await createTestUser();
      
      // Create addresses
      await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address_line1: '111 Test St',
          city: 'Test City',
          postal_code: 'T1 1TT'
        });
      
      await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address_line1: '222 Test Ave',
          city: 'Test City',
          postal_code: 'T1 2TT'
        });
      
      const response = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.length).toBe(2);
    });
  });
  
  describe('DELETE /api/addresses/:address_id', () => {
    test('should delete address', async () => {
      const { token } = await createTestUser();
      
      // Create address
      const createResponse = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address_line1: '333 Delete St',
          city: 'Test City',
          postal_code: 'T1 3TT'
        });
      
      const addressId = createResponse.body.address_id;
      
      // Delete address
      await request(app)
        .delete(`/api/addresses/${addressId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify deleted
      const response = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.find((a: any) => a.address_id === addressId)).toBeUndefined();
    });
  });
});

// ============================================
// FAVORITES TESTS
// ============================================

describe('Favorites Endpoints', () => {
  describe('POST /api/favorites', () => {
    test('should add product to favorites', async () => {
      const { token } = await createTestUser();
      
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 'prod_test1'
        })
        .expect(201);
      
      expect(response.body.favorite_id).toBeDefined();
      expect(response.body.product_id).toBe('prod_test1');
    });
    
    test('should reject duplicate favorite', async () => {
      const { token } = await createTestUser();
      
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 'prod_test1'
        })
        .expect(201);
      
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          product_id: 'prod_test1'
        })
        .expect(400);
      
      expect(response.body.error).toBe('already_favorited');
    });
  });
  
  describe('GET /api/favorites', () => {
    test('should return user favorites', async () => {
      const { token } = await createTestUser();
      
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ product_id: 'prod_test1' });
      
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ product_id: 'prod_test2' });
      
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.length).toBe(2);
    });
  });
  
  describe('DELETE /api/favorites/:favorite_id', () => {
    test('should remove favorite', async () => {
      const { token } = await createTestUser();
      
      const createResponse = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ product_id: 'prod_test1' });
      
      await request(app)
        .delete(`/api/favorites/${createResponse.body.favorite_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Verify removed
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.length).toBe(0);
    });
  });
});

// ============================================
// WEBSOCKET TESTS
// ============================================

describe('WebSocket Events', () => {
  beforeEach((done) => {
    clientSocket = ioClient(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket']
    });
    clientSocket.on('connect', done);
  });
  
  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
  });
  
  test('should emit order_status_changed event on status update', (done) => {
    createStaffUser('Test Location 1').then(async ({ token: staffToken }) => {
      // Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          customer_email: 'wstest@example.com',
          customer_name: 'WS Test',
          customer_phone: '+447700900111',
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'card',
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
      
      const orderId = orderResponse.body.order_id;
      
      // Listen for status change
      clientSocket.on('order_status_changed', (data) => {
        expect(data.order_id).toBe(orderId);
        expect(data.new_status).toBe('preparing');
        expect(data.previous_status).toBe('paid_awaiting_confirmation');
        done();
      });
      
      // Join order room
      clientSocket.emit('join_order_room', { order_id: orderId });
      
      // Update status
      setTimeout(async () => {
        await request(app)
          .put(`/api/orders/${orderId}/status`)
          .set('Authorization', `Bearer ${staffToken}`)
          .send({ order_status: 'preparing' });
      }, 100);
    });
  });
  
  test('should emit new_order event to staff room', (done) => {
    createStaffUser('Test Location 1').then(async ({ token: staffToken }) => {
      // Join staff room
      clientSocket.emit('join_staff_rooms', { token: staffToken });
      
      // Listen for new order
      clientSocket.on('new_order', (data) => {
        expect(data.location_name).toBe('Test Location 1');
        expect(data.order_number).toBeDefined();
        expect(data.total_amount).toBeGreaterThan(0);
        done();
      });
      
      // Create order
      setTimeout(async () => {
        await request(app)
          .post('/api/orders')
          .send({
            customer_email: 'neworder@example.com',
            customer_name: 'New Order',
            customer_phone: '+447700900222',
            location_name: 'Test Location 1',
            fulfillment_method: 'collection',
            payment_method: 'card',
            items: [
              { product_id: 'prod_test1', quantity: 1 }
            ]
          });
      }, 100);
    });
  });
  
  test('should emit inventory_alert event to admin', (done) => {
    createAdminUser().then(async ({ token: adminToken }) => {
      createStaffUser('Test Location 1').then(async ({ token: staffToken }) => {
        // Join admin room
        clientSocket.emit('join_admin_dashboard', { token: adminToken });
        
        // Listen for inventory alert
        clientSocket.on('inventory_alert', (data) => {
          expect(data.reference_number).toMatch(/^IA-/);
          expect(data.location_name).toBe('Test Location 1');
          expect(data.item_name).toBe('Test Item');
          done();
        });
        
        // Submit inventory alert
        setTimeout(async () => {
          await request(app)
            .post('/api/inventory/alerts')
            .set('Authorization', `Bearer ${staffToken}`)
            .send({
              location_name: 'Test Location 1',
              item_name: 'Test Item',
              alert_type: 'low_stock',
              current_quantity: 2
            });
        }, 100);
      });
    });
  });
  
  test('should emit loyalty_points_updated event on points change', (done) => {
    createTestUser().then(async ({ user, token }) => {
      createStaffUser('Test Location 1').then(async ({ token: staffToken }) => {
        // Join user room
        clientSocket.emit('join_user_room', { token });
        
        // Listen for points update
        clientSocket.on('loyalty_points_updated', (data) => {
          expect(data.user_id).toBe(user.user_id);
          expect(data.points_change).toBeGreaterThan(0);
          done();
        });
        
        // Create and complete order to earn points
        setTimeout(async () => {
          const orderResponse = await request(app)
            .post('/api/orders')
            .send({
              user_id: user.user_id,
              customer_email: user.email,
              customer_name: `${user.first_name} ${user.last_name}`,
              customer_phone: user.phone_number,
              location_name: 'Test Location 1',
              fulfillment_method: 'collection',
              payment_method: 'card',
              items: [
                { product_id: 'prod_test1', quantity: 3 }
              ]
            });
          
          // Complete order
          await request(app)
            .put(`/api/orders/${orderResponse.body.order_id}/status`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ order_status: 'preparing' });
          
          await request(app)
            .put(`/api/orders/${orderResponse.body.order_id}/status`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ order_status: 'ready_for_collection' });
          
          await request(app)
            .put(`/api/orders/${orderResponse.body.order_id}/status`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ order_status: 'completed' });
        }, 100);
      });
    });
  });
});

// ============================================
// DATABASE CONSTRAINT TESTS
// ============================================

describe('Database Constraints', () => {
  test('should enforce foreign key on orders.user_id', async () => {
    const client = await pool.connect();
    try {
      const now = new Date().toISOString();
      
      // Try to create order with non-existent user_id
      await expect(
        client.query(`
          INSERT INTO orders (
            order_id, order_number, user_id, customer_email, customer_name,
            customer_phone, location_name, fulfillment_method, payment_method,
            subtotal, total_amount, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          `ord_${Date.now()}`, `ORD-${Date.now()}`, 'nonexistent_user',
          'test@example.com', 'Test', '+447700900000', 'Test Location 1',
          'collection', 'card', 10.00, 10.00, now, now
        ])
      ).rejects.toThrow();
    } finally {
      client.release();
    }
  });
  
  test('should cascade delete user sessions on user deletion', async () => {
    const { user, token } = await createTestUser();
    
    const client = await pool.connect();
    try {
      // Verify session exists
      let result = await client.query(
        'SELECT * FROM sessions WHERE user_id = $1',
        [user.user_id]
      );
      expect(result.rows.length).toBeGreaterThan(0);
      
      // Delete user
      await client.query('DELETE FROM users WHERE user_id = $1', [user.user_id]);
      
      // Verify session deleted
      result = await client.query(
        'SELECT * FROM sessions WHERE user_id = $1',
        [user.user_id]
      );
      expect(result.rows.length).toBe(0);
    } finally {
      client.release();
    }
  });
  
  test('should enforce unique email constraint', async () => {
    const email = 'duplicate@example.com';
    
    await createTestUser({ email });
    
    // Try to create another user with same email
    await request(app)
      .post('/api/auth/register')
      .send({
        email, // Duplicate
        password: 'password123',
        first_name: 'Duplicate',
        last_name: 'User',
        phone_number: '+447700900000'
      })
      .expect(400);
  });
  
  test('should enforce unique order_number', async () => {
    const orderNumber = `ORD-${Date.now()}`;
    const client = await pool.connect();
    
    try {
      const now = new Date().toISOString();
      
      // Create first order
      await client.query(`
        INSERT INTO orders (
          order_id, order_number, customer_email, customer_name, customer_phone,
          location_name, fulfillment_method, payment_method, subtotal, total_amount,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        `ord_1_${Date.now()}`, orderNumber, 'test1@example.com', 'Test 1',
        '+447700900001', 'Test Location 1', 'collection', 'card', 10, 10, now, now
      ]);
      
      // Try to create second order with same order_number
      await expect(
        client.query(`
          INSERT INTO orders (
            order_id, order_number, customer_email, customer_name, customer_phone,
            location_name, fulfillment_method, payment_method, subtotal, total_amount,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          `ord_2_${Date.now()}`, orderNumber, 'test2@example.com', 'Test 2',
          '+447700900002', 'Test Location 1', 'collection', 'card', 10, 10, now, now
        ])
      ).rejects.toThrow();
    } finally {
      client.release();
    }
  });
});

// ============================================
// ERROR HANDLING TESTS
// ============================================

describe('Error Handling', () => {
  test('should return 404 for non-existent endpoint', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);
    
    expect(response.body.error).toBe('not_found');
  });
  
  test('should return 401 for protected endpoint without token', async () => {
    await request(app)
      .get('/api/users/me')
      .expect(401);
  });
  
  test('should return 400 for invalid request body', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email', // Invalid format
        password: 'pass' // Too short
      })
      .expect(400);
    
    expect(response.body.error).toBeDefined();
  });
  
  test('should handle database connection errors gracefully', async () => {
    // Temporarily close pool connection
    await pool.end();
    
    const response = await request(app)
      .get('/api/products')
      .expect(500);
    
    expect(response.body.error).toBe('internal_server_error');
    
    // Reconnect
    // (In real tests, you'd use a separate test database connection)
  });
});

// ============================================
// TRANSACTION ROLLBACK TESTS
// ============================================

describe('Transaction Rollback', () => {
  test('should rollback order creation if payment fails', async () => {
    // This test requires mocking payment failure
    // For now, test that failed orders don't create orphaned records
    
    const initialOrderCount = await pool.query('SELECT COUNT(*) FROM orders');
    
    try {
      // Attempt order with invalid payment (simulated)
      await request(app)
        .post('/api/orders')
        .send({
          customer_email: 'paymentfail@example.com',
          customer_name: 'Payment Fail',
          customer_phone: '+447700900999',
          location_name: 'Test Location 1',
          fulfillment_method: 'collection',
          payment_method: 'invalid', // Invalid method
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
    } catch (error) {
      // Expected to fail
    }
    
    const finalOrderCount = await pool.query('SELECT COUNT(*) FROM orders');
    
    // Order count should be unchanged if rollback worked
    expect(finalOrderCount.rows[0].count).toBe(initialOrderCount.rows[0].count);
  });
  
  test('should rollback loyalty points deduction if order creation fails', async () => {
    const { user, token } = await createTestUser();
    
    // Give user points
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE users SET loyalty_points_balance = $1 WHERE user_id = $2',
        [1000, user.user_id]
      );
    } finally {
      client.release();
    }
    
    // Try invalid order (should rollback points deduction)
    try {
      await request(app)
        .post('/api/orders')
        .send({
          user_id: user.user_id,
          customer_email: user.email,
          customer_name: `${user.first_name} ${user.last_name}`,
          customer_phone: user.phone_number,
          location_name: 'NonexistentLocation', // Invalid
          fulfillment_method: 'collection',
          payment_method: 'card',
          loyalty_points_used: 500,
          items: [
            { product_id: 'prod_test1', quantity: 1 }
          ]
        });
    } catch (error) {
      // Expected to fail
    }
    
    // Verify points not deducted
    const userResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(userResponse.body.loyalty_points_balance).toBe(1000);
  });
});

// ============================================
// EDGE CASE TESTS
// ============================================

describe('Edge Cases', () => {
  test('should handle concurrent order status updates', async () => {
    const { token: staffToken } = await createStaffUser('Test Location 1');
    
    const orderResponse = await request(app)
      .post('/api/orders')
      .send({
        customer_email: 'concurrent@example.com',
        customer_name: 'Concurrent Test',
        customer_phone: '+447700900333',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items: [
          { product_id: 'prod_test1', quantity: 1 }
        ]
      });
    
    const orderId = orderResponse.body.order_id;
    
    // Try concurrent updates
    const promises = [
      request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'preparing' }),
      request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ order_status: 'preparing' })
    ];
    
    const results = await Promise.allSettled(promises);
    
    // At least one should succeed
    const succeeded = results.filter(r => r.status === 'fulfilled');
    expect(succeeded.length).toBeGreaterThan(0);
  });
  
  test('should handle session expiration', async () => {
    const { user } = await createTestUser();
    
    // Create expired session
    const client = await pool.connect();
    try {
      const expiredToken = `expired_${Date.now()}`;
      const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
      const now = new Date().toISOString();
      
      await client.query(`
        INSERT INTO sessions (
          session_id, user_id, token, expires_at, last_activity_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [`sess_${Date.now()}`, user.user_id, expiredToken, pastDate, now, now]);
      
      // Try to use expired token
      await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    } finally {
      client.release();
    }
  });
  
  test('should handle large order with many items', async () => {
    const items = [];
    for (let i = 0; i < 50; i++) {
      items.push({
        product_id: i % 2 === 0 ? 'prod_test1' : 'prod_test2',
        quantity: 1
      });
    }
    
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer_email: 'largeorder@example.com',
        customer_name: 'Large Order',
        customer_phone: '+447700900444',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items
      })
      .expect(201);
    
    expect(response.body.items.length).toBe(50);
  });
  
  test('should handle order with special characters in instructions', async () => {
    const specialInstructions = "Ring bell 🔔, don't knock! <script>alert('test')</script>";
    
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer_email: 'special@example.com',
        customer_name: 'Special Chars',
        customer_phone: '+447700900555',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        special_instructions: specialInstructions,
        items: [
          { product_id: 'prod_test1', quantity: 1 }
        ]
      })
      .expect(201);
    
    // Special chars should be escaped or sanitized
    expect(response.body.special_instructions).toBeDefined();
    // Verify no XSS vulnerability
    expect(response.body.special_instructions).not.toContain('<script>');
  });
});

// ============================================
// AUTHORIZATION TESTS
// ============================================

describe('Authorization', () => {
  test('should prevent customer from accessing admin endpoints', async () => {
    const { token } = await createTestUser();
    
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_name: 'Unauthorized',
        short_description: 'Test',
        category: 'cakes',
        price: 5.00,
        primary_image_url: 'http://example.com/test.jpg'
      })
      .expect(403);
  });
  
  test('should prevent staff from accessing other location orders', async () => {
    const { token: staffToken } = await createStaffUser('Test Location 2');
    
    // Create order at Location 1
    const orderResponse = await request(app)
      .post('/api/orders')
      .send({
        customer_email: 'otherloc@example.com',
        customer_name: 'Other Location',
        customer_phone: '+447700900666',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items: [
          { product_id: 'prod_test1', quantity: 1 }
        ]
      });
    
    // Staff from Location 2 tries to update
    await request(app)
      .put(`/api/orders/${orderResponse.body.order_id}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ order_status: 'preparing' })
      .expect(403);
  });
  
  test('should allow admin to access all locations', async () => {
    const { token: adminToken } = await createAdminUser();
    
    // Create order at Location 1
    const orderResponse = await request(app)
      .post('/api/orders')
      .send({
        customer_email: 'adminaccess@example.com',
        customer_name: 'Admin Access',
        customer_phone: '+447700900777',
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items: [
          { product_id: 'prod_test1', quantity: 1 }
        ]
      });
    
    // Admin can access
    const response = await request(app)
      .get(`/api/orders/${orderResponse.body.order_id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    
    expect(response.body.order_id).toBe(orderResponse.body.order_id);
  });
});

// ============================================
// VALIDATION TESTS
// ============================================

describe('Input Validation', () => {
  test('should validate email format on registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        phone_number: '+447700900000'
      })
      .expect(400);
    
    expect(response.body.error).toContain('email');
  });
  
  test('should validate required fields on order creation', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        // Missing required fields
        customer_email: 'test@example.com'
      })
      .expect(400);
    
    expect(response.body.error).toBe('validation_error');
  });
  
  test('should validate rating range in feedback', async () => {
    const { user, token } = await createTestUser();
    
    const response = await request(app)
      .post('/api/feedback/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        order_id: 'some_order',
        overall_rating: 6, // Invalid (max is 5)
        product_rating: 5,
        fulfillment_rating: 5
      })
      .expect(400);
    
    expect(response.body.error).toBe('validation_error');
  });
  
  test('should validate positive numbers for prices and quantities', async () => {
    const { token: adminToken } = await createAdminUser();
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product_name: 'Invalid Price',
        short_description: 'Test',
        category: 'cakes',
        price: -5.00, // Negative price
        primary_image_url: 'http://example.com/test.jpg'
      })
      .expect(400);
    
    expect(response.body.error).toBe('validation_error');
  });
});

// ============================================
// PERFORMANCE TESTS
// ============================================

describe('Performance', () => {
  test('should handle product search with 1000 products efficiently', async () => {
    // This test ensures indexes are working
    const startTime = Date.now();
    
    await request(app)
      .get('/api/products')
      .query({ limit: 100 })
      .expect(200);
    
    const duration = Date.now() - startTime;
    
    // Should complete within 1 second
    expect(duration).toBeLessThan(1000);
  });
  
  test('should paginate large result sets', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ limit: 5, offset: 0 })
      .expect(200);
    
    expect(response.body.data.length).toBeLessThanOrEqual(5);
    expect(response.body).toHaveProperty('has_more');
  });
});

// ============================================
// INTEGRATION SCENARIO TESTS
// ============================================

describe('Complete User Journeys', () => {
  test('Complete customer order journey with loyalty points', async () => {
    // 1. Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'journey@example.com',
        password: 'password123',
        first_name: 'Journey',
        last_name: 'Test',
        phone_number: '+447700900111'
      })
      .expect(201);
    
    const { token, user } = registerResponse.body;
    
    // 2. Browse products
    const productsResponse = await request(app)
      .get('/api/products')
      .query({ location_name: 'Test Location 1' })
      .expect(200);
    
    expect(productsResponse.body.data.length).toBeGreaterThan(0);
    
    // 3. Add to favorites
    await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: 'prod_test1' })
      .expect(201);
    
    // 4. Create order
    const orderResponse = await request(app)
      .post('/api/orders')
      .send({
        user_id: user.user_id,
        customer_email: user.email,
        customer_name: `${user.first_name} ${user.last_name}`,
        customer_phone: user.phone_number,
        location_name: 'Test Location 1',
        fulfillment_method: 'collection',
        payment_method: 'card',
        items: [
          { product_id: 'prod_test1', quantity: 2 }
        ]
      })
      .expect(201);
    
    expect(orderResponse.body.order_number).toBeDefined();
    expect(orderResponse.body.loyalty_points_earned).toBeGreaterThan(0);
    
    // 5. Staff processes order
    const { token: staffToken } = await createStaffUser('Test Location 1');
    
    await request(app)
      .put(`/api/orders/${orderResponse.body.order_id}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ order_status: 'preparing' })
      .expect(200);
    
    await request(app)
      .put(`/api/orders/${orderResponse.body.order_id}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ order_status: 'ready_for_collection' })
      .expect(200);
    
    const completedOrder = await request(app)
      .put(`/api/orders/${orderResponse.body.order_id}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ order_status: 'completed' })
      .expect(200);
    
    expect(completedOrder.body.order_status).toBe('completed');
    
    // 6. Check loyalty points awarded
    const userResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(userResponse.body.loyalty_points_balance).toBe(
      orderResponse.body.loyalty_points_earned
    );
    
    // 7. Submit feedback
    const feedbackResponse = await request(app)
      .post('/api/feedback/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        order_id: orderResponse.body.order_id,
        overall_rating: 5,
        product_rating: 5,
        fulfillment_rating: 5,
        overall_comment: 'Excellent service and products!'
      })
      .expect(201);
    
    expect(feedbackResponse.body.feedback_id).toBeDefined();
    
    // 8. Verify order marked as feedback_submitted
    const finalOrder = await request(app)
      .get(`/api/orders/${orderResponse.body.order_id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(finalOrder.body.feedback_submitted).toBe(true);
  });
  
  test('Complete staff operational journey', async () => {
    const { token: staffToken, user_id: staffUserId } = await createStaffUser('Test Location 1');
    
    // 1. View pending orders
    const ordersResponse = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${staffToken}`)
      .query({ order_status: 'paid_awaiting_confirmation' })
      .expect(200);
    
    // 2. Submit inventory alert
    const alertResponse = await request(app)
      .post('/api/inventory/alerts')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        location_name: 'Test Location 1',
        item_name: 'Flour',
        alert_type: 'low_stock',
        current_quantity: 3,
        notes: 'Need restock before weekend'
      })
      .expect(201);
    
    expect(alertResponse.body.reference_number).toBeDefined();
    
    // 3. Complete training lesson
    const { token: adminToken } = await createAdminUser();
    
    // Create course and lesson
    const courseResponse = await request(app)
      .post('/api/training/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        course_title: 'Staff Test Course',
        short_description: 'Test',
        cover_image_url: 'http://example.com/course.jpg',
        category: 'safety',
        status: 'published'
      });
    
    const client = await pool.connect();
    try {
      const lessonId = `lesson_${Date.now()}`;
      const now = new Date().toISOString();
      
      await client.query(`
        INSERT INTO training_lessons (
          lesson_id, course_id, lesson_title, lesson_type,
          duration_minutes, lesson_order, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [lessonId, courseResponse.body.course_id, 'Safety Lesson', 'video', 30, 1, now, now]);
      
      // Complete lesson
      await request(app)
        .post(`/api/training/lessons/${lessonId}/complete`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          personal_notes: 'Important safety information'
        })
        .expect(200);
    } finally {
      client.release();
    }
    
    // 4. Submit staff feedback
    await request(app)
      .post('/api/feedback/staff')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        location_name: 'Test Location 1',
        feedback_type: 'suggestion',
        title: 'Process Improvement Idea',
        description: 'Could improve order ticket system'
      })
      .expect(201);
  });
});