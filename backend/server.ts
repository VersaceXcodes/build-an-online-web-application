import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import multer from 'multer';

// Custom type definitions
interface AuthRequest extends Request {
  user?: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    user_type: string;
    account_status: string;
    loyalty_points_balance: number;
  };
}

interface AuthSocket extends Socket {
  user?: {
    user_id: string;
    email: string;
    user_type: string;
  };
}

interface ErrorResponse {
  success: boolean;
  message: string;
  timestamp: string;
  error_code?: string;
  details?: {
    name: string;
    message: string;
    stack?: string;
  };
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT, JWT_SECRET, PORT } = process.env;
const actualPort = PORT || '3000';
const actualPgPort = PGPORT || '5432';
const actualJwtSecret = JWT_SECRET || 'your-secret-key';

const pool = new Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : { host: PGHOST, database: PGDATABASE, user: PGUSER, password: PGPASSWORD, port: Number(actualPgPort), ssl: { rejectUnauthorized: false } }
);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', credentials: true } });

const isDist = path.basename(__dirname) === 'dist';
const publicDir = isDist ? path.resolve(__dirname, '..', 'public') : path.resolve(__dirname, 'public');
const storageDir = path.resolve(__dirname, 'storage');
const uploadsDir = path.join(publicDir, 'uploads', 'social-icons');
const eventImagesDir = path.join(publicDir, 'uploads', 'event-images');

if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(eventImagesDir)) fs.mkdirSync(eventImagesDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use(express.static(publicDir));

function createErrorResponse(message: string, error?: any, errorCode?: string): ErrorResponse {
  const response: ErrorResponse = { success: false, message, timestamp: new Date().toISOString() };
  if (errorCode) response.error_code = errorCode;
  if (error) response.details = { name: error.name, message: error.message, stack: error.stack };
  return response;
}

function generateId(prefix) {
  return `${prefix}_${uuidv4().replace(/-/g, '')}`;
}

function generateOrderNumber(orderType = 'standard') {
  const prefix = orderType === 'corporate' ? 'CE' : 'KK';
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${num}`;
}

function generateCollectionCode() {
  return `COL-${Math.floor(1000 + Math.random() * 9000)}`;
}

const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json(createErrorResponse('Access token required', undefined, 'AUTH_TOKEN_MISSING'));
  try {
    const client = await pool.connect();
    const sessionResult = await client.query('SELECT user_id, expires_at FROM sessions WHERE token = $1', [token]);
    if (sessionResult.rows.length === 0) {
      client.release();
      return res.status(401).json(createErrorResponse('Invalid token', undefined, 'AUTH_TOKEN_INVALID'));
    }
    const session = sessionResult.rows[0];
    if (new Date(session.expires_at) < new Date()) {
      client.release();
      return res.status(401).json(createErrorResponse('Token expired', undefined, 'AUTH_TOKEN_EXPIRED'));
    }
    const userResult = await client.query('SELECT user_id, email, first_name, last_name, phone_number, user_type, account_status, loyalty_points_balance FROM users WHERE user_id = $1', [session.user_id]);
    client.release();
    if (userResult.rows.length === 0) return res.status(401).json(createErrorResponse('User not found', undefined, 'USER_NOT_FOUND'));
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json(createErrorResponse('Invalid or expired token', error, 'AUTH_TOKEN_INVALID'));
  }
};

const requireRole = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.user_type)) return res.status(403).json(createErrorResponse('Insufficient permissions', undefined, 'FORBIDDEN'));
  next();
};

// Public endpoint to check email availability
app.get('/api/auth/check-email', async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json(createErrorResponse('Email parameter required', null, 'MISSING_EMAIL'));
    }
    const existingUser = await client.query('SELECT user_id FROM users WHERE email = $1', [email]);
    const isAvailable = existingUser.rows.length === 0;
    client.release();
    res.json({ available: isAvailable });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Email check failed', error, 'EMAIL_CHECK_ERROR'));
  }
});

app.post('/api/auth/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, first_name, last_name, phone_number, marketing_opt_in = false } = req.body;
    if (!email || !password || !first_name || !last_name || !phone_number) {
      return res.status(400).json(createErrorResponse('All fields required', null, 'MISSING_FIELDS'));
    }
    const existingUser = await client.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) return res.status(400).json(createErrorResponse('Email already exists', null, 'EMAIL_EXISTS'));
    const user_id = generateId('usr');
    const now = new Date().toISOString();
    const password_hash = await bcrypt.hash(password, 10);
    await client.query('INSERT INTO users (user_id, email, password_hash, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, failed_login_attempts, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [user_id, email, password_hash, first_name, last_name, phone_number, 'customer', 'active', marketing_opt_in, 0, 0, now, now]);
    const token = jwt.sign({ user_id, email }, actualJwtSecret, { expiresIn: '7d' });
    const session_id = generateId('sess');
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await client.query('INSERT INTO sessions (session_id, user_id, token, remember_me, expires_at, last_activity_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [session_id, user_id, token, false, expires_at, now, now]);
    client.release();
    res.status(201).json({ token, user: { user_id, email, first_name, last_name, phone_number, user_type: 'customer', account_status: 'active', marketing_opt_in, loyalty_points_balance: 0, created_at: now, updated_at: now } });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Registration failed', error, 'REGISTRATION_ERROR'));
  }
});

app.post('/api/auth/login', async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, remember_me = false } = req.body;
    if (!email || !password) return res.status(400).json(createErrorResponse('Email and password required', null, 'MISSING_FIELDS'));
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json(createErrorResponse('Invalid credentials', null, 'INVALID_CREDENTIALS'));
    const user = userResult.rows[0];
    
    // Check if account is locked and if lockout period has expired
    if (user.locked_until) {
      const now = new Date();
      const lockedUntil = new Date(user.locked_until);
      
      if (lockedUntil > now) {
        // Account is still locked
        const minutesRemaining = Math.ceil((lockedUntil.getTime() - now.getTime()) / (1000 * 60));
        client.release();
        return res.status(401).json(createErrorResponse(`Account locked. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`, null, 'ACCOUNT_LOCKED'));
      } else {
        // Lockout period has expired, unlock the account
        await client.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE user_id = $1', [user.user_id]);
      }
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await client.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1, locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN $1 ELSE NULL END WHERE user_id = $2', [new Date(Date.now() + 30 * 60 * 1000).toISOString(), user.user_id]);
      client.release();
      return res.status(401).json(createErrorResponse('Invalid credentials', null, 'INVALID_CREDENTIALS'));
    }
    const now = new Date().toISOString();
    await client.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = $1, updated_at = $2 WHERE user_id = $3', [now, now, user.user_id]);
    const token = jwt.sign({ user_id: user.user_id, email: user.email }, actualJwtSecret, { expiresIn: '7d' });
    const session_id = generateId('sess');
    const expires_at = new Date(Date.now() + (remember_me ? 30 * 24 : 24) * 60 * 60 * 1000).toISOString();
    await client.query('INSERT INTO sessions (session_id, user_id, token, remember_me, expires_at, last_activity_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [session_id, user.user_id, token, remember_me, expires_at, now, now]);
    
    // Include assigned locations for staff/manager users
    let assignedLocations = [];
    if (user.user_type === 'staff' || user.user_type === 'manager') {
      const assignmentsResult = await client.query('SELECT location_name FROM staff_assignments WHERE user_id = $1', [user.user_id]);
      assignedLocations = assignmentsResult.rows.map(r => r.location_name);
    }
    
    client.release();
    res.json({ token, user: { user_id: user.user_id, email: user.email, first_name: user.first_name, last_name: user.last_name, phone_number: user.phone_number, user_type: user.user_type, account_status: user.account_status, marketing_opt_in: user.marketing_opt_in, loyalty_points_balance: parseFloat(user.loyalty_points_balance), last_login_at: now, created_at: user.created_at, updated_at: now, assigned_locations: assignedLocations } });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Login failed', error, 'LOGIN_ERROR'));
  }
});

app.post('/api/auth/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const token = req.headers['authorization'].split(' ')[1];
    await client.query('DELETE FROM sessions WHERE token = $1', [token]);
    client.release();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Logout failed', error, 'LOGOUT_ERROR'));
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json(createErrorResponse('Email required', null, 'MISSING_EMAIL'));
    const userResult = await client.query('SELECT user_id, email, first_name FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const token_id = generateId('token');
      const resetToken = `rpt_${uuidv4().replace(/-/g, '')}`;
      const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();
      await client.query('INSERT INTO password_reset_tokens (token_id, user_id, token, expires_at, is_used, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [token_id, user.user_id, resetToken, expires_at, false, now]);
      const email_id = generateId('email');
      await client.query('INSERT INTO email_logs (email_id, recipient_email, email_type, subject, template_used, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [email_id, email, 'password_reset', 'Reset Your Kake Password', 'password-reset-email', 'sent', now]);
    }
    client.release();
    res.json({ success: true, message: 'If an account exists, you will receive password reset instructions.' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to process request', error, 'FORGOT_PASSWORD_ERROR'));
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const client = await pool.connect();
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json(createErrorResponse('Token and password required', null, 'MISSING_FIELDS'));
    const now = new Date().toISOString();
    const tokenResult = await client.query('SELECT token_id, user_id, expires_at, is_used FROM password_reset_tokens WHERE token = $1', [token]);
    if (tokenResult.rows.length === 0) return res.status(400).json(createErrorResponse('Invalid token', null, 'INVALID_TOKEN'));
    const resetToken = tokenResult.rows[0];
    if (resetToken.is_used) return res.status(400).json(createErrorResponse('Token already used', null, 'TOKEN_USED'));
    if (new Date(resetToken.expires_at) < new Date()) return res.status(400).json(createErrorResponse('Token expired', null, 'TOKEN_EXPIRED'));
    const password_hash = await bcrypt.hash(password, 10);
    await client.query('UPDATE users SET password_hash = $1, updated_at = $2 WHERE user_id = $3', [password_hash, now, resetToken.user_id]);
    await client.query('UPDATE password_reset_tokens SET is_used = true WHERE token_id = $1', [resetToken.token_id]);
    await client.query('DELETE FROM sessions WHERE user_id = $1', [resetToken.user_id]);
    client.release();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Password reset failed', error, 'RESET_PASSWORD_ERROR'));
  }
});

app.get('/api/users/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    // If user is staff, include their assigned locations
    if (req.user.user_type === 'staff' || req.user.user_type === 'manager') {
      const assignmentsResult = await client.query('SELECT location_name FROM staff_assignments WHERE user_id = $1', [req.user.user_id]);
      const assignedLocations = assignmentsResult.rows.map(r => r.location_name);
      client.release();
      res.json({ ...req.user, assigned_locations: assignedLocations });
    } else {
      client.release();
      res.json(req.user);
    }
  } catch (error) {
    client.release();
    res.json(req.user);
  }
});

app.put('/api/users/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { first_name, last_name, phone_number, email, current_password, marketing_opt_in } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;
    if (first_name) { updates.push(`first_name = $${idx++}`); values.push(first_name); }
    if (last_name) { updates.push(`last_name = $${idx++}`); values.push(last_name); }
    if (phone_number) { updates.push(`phone_number = $${idx++}`); values.push(phone_number); }
    if (marketing_opt_in !== undefined) { updates.push(`marketing_opt_in = $${idx++}`); values.push(marketing_opt_in); }
    if (email && email !== req.user.email) {
      if (!current_password) return res.status(400).json(createErrorResponse('Current password required for email change', null, 'PASSWORD_REQUIRED'));
      const userResult = await client.query('SELECT password_hash FROM users WHERE user_id = $1', [req.user.user_id]);
      const passwordMatch = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
      if (!passwordMatch) return res.status(400).json(createErrorResponse('Invalid password', null, 'INVALID_PASSWORD'));
      const emailCheck = await client.query('SELECT user_id FROM users WHERE email = $1 AND user_id != $2', [email, req.user.user_id]);
      if (emailCheck.rows.length > 0) return res.status(400).json(createErrorResponse('Email already exists', null, 'EMAIL_EXISTS'));
      updates.push(`email = $${idx++}`);
      values.push(email);
    }
    if (updates.length === 0) {
      client.release();
      return res.json(req.user);
    }
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.user.user_id);
    const result = await client.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING user_id, email, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, created_at, updated_at`, values);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Update failed', error, 'UPDATE_ERROR'));
  }
});

app.post('/api/users/me/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json(createErrorResponse('Current and new password required', null, 'MISSING_FIELDS'));
    const userResult = await client.query('SELECT password_hash FROM users WHERE user_id = $1', [req.user.user_id]);
    const passwordMatch = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    if (!passwordMatch) return res.status(400).json(createErrorResponse('Invalid current password', null, 'INVALID_PASSWORD'));
    const now = new Date().toISOString();
    const new_password_hash = await bcrypt.hash(new_password, 10);
    await client.query('UPDATE users SET password_hash = $1, updated_at = $2 WHERE user_id = $3', [new_password_hash, now, req.user.user_id]);
    const token = req.headers['authorization'].split(' ')[1];
    await client.query('DELETE FROM sessions WHERE user_id = $1 AND token != $2', [req.user.user_id, token]);
    client.release();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Password change failed', error, 'PASSWORD_CHANGE_ERROR'));
  }
});

app.get('/api/locations', async (req, res) => {
  const client = await pool.connect();
  try {
    const { is_collection_enabled, is_delivery_enabled } = req.query;
    let query = 'SELECT * FROM locations WHERE 1=1';
    const values = [];
    if (is_collection_enabled !== undefined) { query += ` AND is_collection_enabled = $${values.length + 1}`; values.push(String(is_collection_enabled) === 'true'); }
    if (is_delivery_enabled !== undefined) { query += ` AND is_delivery_enabled = $${values.length + 1}`; values.push(String(is_delivery_enabled) === 'true'); }
    query += ' ORDER BY location_name';
    const result = await client.query(query, values);
    client.release();
    res.json(result.rows.map(loc => ({ ...loc, delivery_radius_km: loc.delivery_radius_km ? parseFloat(loc.delivery_radius_km) : null, delivery_fee: loc.delivery_fee ? parseFloat(loc.delivery_fee) : null, free_delivery_threshold: loc.free_delivery_threshold ? parseFloat(loc.free_delivery_threshold) : null, estimated_delivery_time_minutes: loc.estimated_delivery_time_minutes ? parseFloat(loc.estimated_delivery_time_minutes) : null, estimated_preparation_time_minutes: parseFloat(loc.estimated_preparation_time_minutes) })));
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch locations', error, 'LOCATIONS_FETCH_ERROR'));
  }
});

app.get('/api/locations/:location_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM locations WHERE location_id = $1', [req.params.location_id]);
    client.release();
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('Location not found', null, 'LOCATION_NOT_FOUND'));
    const loc = result.rows[0];
    res.json({ ...loc, delivery_radius_km: loc.delivery_radius_km ? parseFloat(loc.delivery_radius_km) : null, delivery_fee: loc.delivery_fee ? parseFloat(loc.delivery_fee) : null, free_delivery_threshold: loc.free_delivery_threshold ? parseFloat(loc.free_delivery_threshold) : null, estimated_delivery_time_minutes: loc.estimated_delivery_time_minutes ? parseFloat(loc.estimated_delivery_time_minutes) : null, estimated_preparation_time_minutes: parseFloat(loc.estimated_preparation_time_minutes) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch location', error, 'LOCATION_FETCH_ERROR'));
  }
});

app.put('/api/locations/:location_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { location_id } = req.params;
    const { 
      location_name, 
      address_line1, 
      address_line2, 
      city, 
      postal_code, 
      phone_number, 
      email, 
      is_collection_enabled, 
      is_delivery_enabled, 
      delivery_radius_km, 
      delivery_fee, 
      free_delivery_threshold, 
      estimated_delivery_time_minutes, 
      estimated_preparation_time_minutes, 
      allow_scheduled_pickups, 
      just_eat_url, 
      deliveroo_url, 
      opening_hours 
    } = req.body;

    // Check if location exists
    const checkResult = await client.query('SELECT location_id FROM locations WHERE location_id = $1', [location_id]);
    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Location not found', null, 'LOCATION_NOT_FOUND'));
    }

    const now = new Date().toISOString();
    
    // Update location
    const result = await client.query(
      `UPDATE locations SET 
        location_name = COALESCE($1, location_name),
        address_line1 = COALESCE($2, address_line1),
        address_line2 = $3,
        city = COALESCE($4, city),
        postal_code = COALESCE($5, postal_code),
        phone_number = COALESCE($6, phone_number),
        email = COALESCE($7, email),
        is_collection_enabled = COALESCE($8, is_collection_enabled),
        is_delivery_enabled = COALESCE($9, is_delivery_enabled),
        delivery_radius_km = $10,
        delivery_fee = $11,
        free_delivery_threshold = $12,
        estimated_delivery_time_minutes = $13,
        estimated_preparation_time_minutes = COALESCE($14, estimated_preparation_time_minutes),
        allow_scheduled_pickups = COALESCE($15, allow_scheduled_pickups),
        just_eat_url = $16,
        deliveroo_url = $17,
        opening_hours = COALESCE($18, opening_hours),
        updated_at = $19
      WHERE location_id = $20
      RETURNING *`,
      [
        location_name, address_line1, address_line2, city, postal_code, phone_number, email,
        is_collection_enabled, is_delivery_enabled, delivery_radius_km, delivery_fee,
        free_delivery_threshold, estimated_delivery_time_minutes, estimated_preparation_time_minutes,
        allow_scheduled_pickups, just_eat_url, deliveroo_url, opening_hours, now, location_id
      ]
    );

    const loc = result.rows[0];
    client.release();
    res.json({ ...loc, delivery_radius_km: loc.delivery_radius_km ? parseFloat(loc.delivery_radius_km) : null, delivery_fee: loc.delivery_fee ? parseFloat(loc.delivery_fee) : null, free_delivery_threshold: loc.free_delivery_threshold ? parseFloat(loc.free_delivery_threshold) : null, estimated_delivery_time_minutes: loc.estimated_delivery_time_minutes ? parseFloat(loc.estimated_delivery_time_minutes) : null, estimated_preparation_time_minutes: parseFloat(loc.estimated_preparation_time_minutes) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update location', error, 'LOCATION_UPDATE_ERROR'));
  }
});

app.get('/api/products', async (req, res) => {
  const client = await pool.connect();
  try {
    const { query, location_name, category, availability_status, is_featured, min_price, max_price, dietary_tags, hide_out_of_stock, show_hidden, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    
    let sqlQuery = 'SELECT DISTINCT p.* FROM products p';
    const values = [];
    const conditions = ['p.is_archived = false'];
    
    // Only show visible products unless show_hidden=true (for admin)
    if (String(show_hidden) !== 'true') {
      conditions.push('p.is_visible = true');
    }
    
    let idx = 1;
    if (location_name) {
      sqlQuery += ' INNER JOIN product_locations pl ON p.product_id = pl.product_id';
      conditions.push(`pl.location_name = $${idx++}`);
      values.push(location_name);
    }
    if (category) { conditions.push(`p.category = $${idx++}`); values.push(category); }
    if (availability_status) { conditions.push(`p.availability_status = $${idx++}`); values.push(availability_status); }
    if (is_featured !== undefined) { conditions.push(`p.is_featured = $${idx++}`); values.push(String(is_featured) === 'true'); }
    if (min_price) { conditions.push(`p.price >= $${idx++}`); values.push(parseFloat(String(min_price))); }
    if (max_price) { conditions.push(`p.price <= $${idx++}`); values.push(parseFloat(String(max_price))); }
    if (dietary_tags) { conditions.push(`p.dietary_tags LIKE $${idx++}`); values.push(`%${dietary_tags}%`); }
    if (String(hide_out_of_stock) === 'true') conditions.push(`p.availability_status != 'out_of_stock'`);
    if (query) { conditions.push(`(p.product_name ILIKE $${idx} OR p.short_description ILIKE $${idx})`); values.push(`%${query}%`); idx++; }
    conditions.push(`(p.available_from_date IS NULL OR p.available_from_date::timestamp <= NOW())`);
    conditions.push(`(p.available_until_date IS NULL OR p.available_until_date::timestamp >= NOW())`);
    sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    const orderMap = { product_name: 'p.product_name', price: 'p.price', created_at: 'p.created_at' };
    sqlQuery += ` ORDER BY ${orderMap[String(sort_by)] || 'p.created_at'} ${String(sort_order).toUpperCase()}`;
    sqlQuery += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(sqlQuery, values);
    const countQuery = `SELECT COUNT(DISTINCT p.product_id) FROM products p ${location_name ? 'INNER JOIN product_locations pl ON p.product_id = pl.product_id' : ''} WHERE ${conditions.join(' AND ')}`;
    const countResult = await client.query(countQuery, values.slice(0, -2));
    client.release();
    res.json({ data: result.rows.map(p => ({ ...p, price: parseFloat(p.price), compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null, stock_quantity: p.stock_quantity ? parseFloat(p.stock_quantity) : null, low_stock_threshold: p.low_stock_threshold ? parseFloat(p.low_stock_threshold) : null })), total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch products', error, 'PRODUCTS_FETCH_ERROR'));
  }
});

app.get('/api/products/:product_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const show_hidden = String(req.query.show_hidden) === 'true';
    const visibilityCondition = show_hidden ? '' : ' AND is_visible = true';
    const result = await client.query(`SELECT * FROM products WHERE product_id = $1 AND is_archived = false${visibilityCondition}`, [req.params.product_id]);
    client.release();
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('Product not found', null, 'PRODUCT_NOT_FOUND'));
    const p = result.rows[0];
    res.json({ ...p, price: parseFloat(p.price), compare_at_price: p.compare_at_price ? parseFloat(p.compare_at_price) : null, stock_quantity: p.stock_quantity ? parseFloat(p.stock_quantity) : null, low_stock_threshold: p.low_stock_threshold ? parseFloat(p.low_stock_threshold) : null });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch product', error, 'PRODUCT_FETCH_ERROR'));
  }
});

// Get product locations (which products are available at which locations)
app.get('/api/product-locations', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { location_name, product_id, limit = 1000 } = req.query;
    
    let query = 'SELECT * FROM product_locations';
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (location_name) {
      conditions.push(`location_name = $${params.length + 1}`);
      params.push(location_name);
    }
    
    if (product_id) {
      conditions.push(`product_id = $${params.length + 1}`);
      params.push(product_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` LIMIT ${parseInt(limit as string) || 1000}`;
    
    const result = await client.query(query, params);
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch product locations', error, 'PRODUCT_LOCATIONS_FETCH_ERROR'));
  }
});

app.post('/api/products', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { product_name, short_description, long_description, category, price, compare_at_price, primary_image_url, additional_images, availability_status = 'in_stock', stock_quantity, low_stock_threshold, dietary_tags, custom_tags, is_featured = false, is_visible = true, available_for_corporate = true, available_from_date, available_until_date, location_assignments } = req.body;
    const product_id = generateId('prod');
    const now = new Date().toISOString();
    await client.query('INSERT INTO products (product_id, product_name, short_description, long_description, category, price, compare_at_price, primary_image_url, additional_images, availability_status, stock_quantity, low_stock_threshold, dietary_tags, custom_tags, is_featured, is_visible, available_for_corporate, available_from_date, available_until_date, is_archived, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)', [product_id, product_name, short_description, long_description, category, price, compare_at_price, primary_image_url, additional_images, availability_status, stock_quantity, low_stock_threshold, dietary_tags, custom_tags, is_featured, is_visible, available_for_corporate, available_from_date, available_until_date, false, now, now]);
    if (location_assignments && Array.isArray(location_assignments)) {
      for (const loc of location_assignments) {
        await client.query('INSERT INTO product_locations (assignment_id, product_id, location_name, assigned_at) VALUES ($1, $2, $3, $4)', [generateId('pl'), product_id, loc, now]);
      }
    }
    const result = await client.query('SELECT * FROM products WHERE product_id = $1', [product_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create product', error, 'PRODUCT_CREATE_ERROR'));
  }
});

app.put('/api/products/:product_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { location_assignments, ...productFields } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;
    const fields = ['product_name', 'short_description', 'long_description', 'category', 'price', 'compare_at_price', 'primary_image_url', 'additional_images', 'availability_status', 'stock_quantity', 'low_stock_threshold', 'dietary_tags', 'custom_tags', 'is_featured', 'is_visible', 'available_for_corporate', 'available_from_date', 'available_until_date', 'is_archived'];
    fields.forEach(field => {
      if (productFields[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(productFields[field]);
      }
    });
    if (updates.length === 0 && !location_assignments) {
      client.release();
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATES'));
    }
    const now = new Date().toISOString();
    
    // Update product fields if any
    if (updates.length > 0) {
      updates.push(`updated_at = $${idx++}`);
      values.push(now);
      values.push(req.params.product_id);
      await client.query(`UPDATE products SET ${updates.join(', ')} WHERE product_id = $${idx}`, values);
    }
    
    // Update location assignments if provided
    if (location_assignments && Array.isArray(location_assignments)) {
      // Delete existing assignments
      await client.query('DELETE FROM product_locations WHERE product_id = $1', [req.params.product_id]);
      // Insert new assignments
      for (const loc of location_assignments) {
        await client.query('INSERT INTO product_locations (assignment_id, product_id, location_name, assigned_at) VALUES ($1, $2, $3, $4)', [generateId('pl'), req.params.product_id, loc, now]);
      }
    }
    
    const result = await client.query('SELECT * FROM products WHERE product_id = $1', [req.params.product_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update product', error, 'PRODUCT_UPDATE_ERROR'));
  }
});

app.delete('/api/products/:product_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('UPDATE products SET is_archived = true, updated_at = $1 WHERE product_id = $2', [new Date().toISOString(), req.params.product_id]);
    client.release();
    res.json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete product', error, 'PRODUCT_DELETE_ERROR'));
  }
});

// ============================================
// TOPPINGS ENDPOINTS
// ============================================

// Get all toppings
app.get('/api/toppings', async (req, res) => {
  const client = await pool.connect();
  try {
    const { topping_type, is_available } = req.query;
    const limit = parseInt(String(req.query.limit || 100));
    const offset = parseInt(String(req.query.offset || 0));
    
    let query = 'SELECT * FROM toppings WHERE 1=1';
    const values = [];
    let idx = 1;
    
    if (topping_type) {
      query += ` AND topping_type = $${idx++}`;
      values.push(topping_type);
    }
    
    if (is_available !== undefined) {
      query += ` AND is_available = $${idx++}`;
      values.push(String(is_available) === 'true');
    }
    
    query += ` ORDER BY display_order ASC, topping_name ASC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    
    const result = await client.query(query, values);
    client.release();
    res.json(result.rows.map(t => ({ ...t, price: parseFloat(t.price) })));
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch toppings', error, 'TOPPINGS_FETCH_ERROR'));
  }
});

// Get single topping
app.get('/api/toppings/:topping_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM toppings WHERE topping_id = $1', [req.params.topping_id]);
    client.release();
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('Topping not found', null, 'TOPPING_NOT_FOUND'));
    const t = result.rows[0];
    res.json({ ...t, price: parseFloat(t.price) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch topping', error, 'TOPPING_FETCH_ERROR'));
  }
});

// Create topping (admin only)
app.post('/api/toppings', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { topping_name, topping_type, price = 0, is_available = true, display_order = 0 } = req.body;
    const topping_id = generateId('top');
    const now = new Date().toISOString();
    
    await client.query(
      'INSERT INTO toppings (topping_id, topping_name, topping_type, price, is_available, display_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [topping_id, topping_name, topping_type, price, is_available, display_order, now, now]
    );
    
    const result = await client.query('SELECT * FROM toppings WHERE topping_id = $1', [topping_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create topping', error, 'TOPPING_CREATE_ERROR'));
  }
});

// Update topping (admin only)
app.put('/api/toppings/:topping_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    
    const fields = ['topping_name', 'topping_type', 'price', 'is_available', 'display_order'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(req.body[field]);
      }
    });
    
    if (updates.length === 0) {
      client.release();
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATES'));
    }
    
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.topping_id);
    
    await client.query(`UPDATE toppings SET ${updates.join(', ')} WHERE topping_id = $${idx}`, values);
    const result = await client.query('SELECT * FROM toppings WHERE topping_id = $1', [req.params.topping_id]);
    client.release();
    
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('Topping not found', null, 'TOPPING_NOT_FOUND'));
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update topping', error, 'TOPPING_UPDATE_ERROR'));
  }
});

// Delete topping (admin only)
app.delete('/api/toppings/:topping_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM toppings WHERE topping_id = $1', [req.params.topping_id]);
    client.release();
    res.json({ success: true, message: 'Topping deleted successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete topping', error, 'TOPPING_DELETE_ERROR'));
  }
});

// ============================================
// PRODUCT TOPPINGS ENDPOINTS
// ============================================

// Get toppings for a product
app.get('/api/product-toppings', async (req, res) => {
  const client = await pool.connect();
  try {
    const { product_id, topping_id } = req.query;
    let query = 'SELECT pt.*, t.topping_name, t.topping_type, t.price, t.is_available FROM product_toppings pt INNER JOIN toppings t ON pt.topping_id = t.topping_id WHERE 1=1';
    const values = [];
    let idx = 1;
    
    if (product_id) {
      query += ` AND pt.product_id = $${idx++}`;
      values.push(product_id);
    }
    
    if (topping_id) {
      query += ` AND pt.topping_id = $${idx++}`;
      values.push(topping_id);
    }
    
    query += ' ORDER BY t.display_order ASC, t.topping_name ASC';
    
    const result = await client.query(query, values);
    client.release();
    res.json(result.rows.map(pt => ({ ...pt, price: parseFloat(pt.price) })));
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch product toppings', error, 'PRODUCT_TOPPINGS_FETCH_ERROR'));
  }
});

// Assign topping to product (admin only)
app.post('/api/product-toppings', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { product_id, topping_id, is_default = false } = req.body;
    const assignment_id = generateId('pta');
    const now = new Date().toISOString();
    
    // Check if already assigned
    const existing = await client.query('SELECT assignment_id FROM product_toppings WHERE product_id = $1 AND topping_id = $2', [product_id, topping_id]);
    if (existing.rows.length > 0) {
      client.release();
      return res.status(400).json(createErrorResponse('Topping already assigned to this product', null, 'DUPLICATE_ASSIGNMENT'));
    }
    
    await client.query(
      'INSERT INTO product_toppings (assignment_id, product_id, topping_id, is_default, assigned_at) VALUES ($1, $2, $3, $4, $5)',
      [assignment_id, product_id, topping_id, is_default, now]
    );
    
    const result = await client.query(
      'SELECT pt.*, t.topping_name, t.topping_type, t.price FROM product_toppings pt INNER JOIN toppings t ON pt.topping_id = t.topping_id WHERE pt.assignment_id = $1',
      [assignment_id]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to assign topping', error, 'PRODUCT_TOPPING_CREATE_ERROR'));
  }
});

// Remove topping from product (admin only)
app.delete('/api/product-toppings/:assignment_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM product_toppings WHERE assignment_id = $1', [req.params.assignment_id]);
    client.release();
    res.json({ success: true, message: 'Topping removed from product successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to remove topping', error, 'PRODUCT_TOPPING_DELETE_ERROR'));
  }
});

// Bulk assign toppings to product (admin only)
app.post('/api/products/:product_id/assign-toppings', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { topping_ids } = req.body; // Array of topping IDs
    const { product_id } = req.params;
    const now = new Date().toISOString();
    
    // Delete existing assignments
    await client.query('DELETE FROM product_toppings WHERE product_id = $1', [product_id]);
    
    // Insert new assignments
    if (topping_ids && Array.isArray(topping_ids) && topping_ids.length > 0) {
      for (const topping_id of topping_ids) {
        const assignment_id = generateId('pta');
        await client.query(
          'INSERT INTO product_toppings (assignment_id, product_id, topping_id, is_default, assigned_at) VALUES ($1, $2, $3, $4, $5)',
          [assignment_id, product_id, topping_id, false, now]
        );
      }
    }
    
    // Return updated assignments
    const result = await client.query(
      'SELECT pt.*, t.topping_name, t.topping_type, t.price FROM product_toppings pt INNER JOIN toppings t ON pt.topping_id = t.topping_id WHERE pt.product_id = $1 ORDER BY t.display_order ASC',
      [product_id]
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to assign toppings', error, 'BULK_ASSIGN_ERROR'));
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { user_id, customer_email, customer_name, customer_phone, location_name, order_type = 'standard', fulfillment_method, delivery_address_line1, delivery_address_line2, delivery_city, delivery_postal_code, delivery_phone, delivery_instructions, special_instructions, scheduled_for, event_date, guest_count, event_type, company_name, promo_code, loyalty_points_used = 0, payment_method, items } = req.body;
    if (!items || items.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json(createErrorResponse('No items in order', null, 'NO_ITEMS'));
    }
    let subtotal = 0;
    const validatedItems = [];
    for (const item of items) {
      const productResult = await client.query('SELECT product_id, product_name, price, availability_status FROM products WHERE product_id = $1 AND availability_status = $2 AND is_archived = false AND is_visible = true', [item.product_id, 'in_stock']);
      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json(createErrorResponse(`Product ${item.product_id} unavailable`, null, 'PRODUCT_UNAVAILABLE'));
      }
      const product = productResult.rows[0];
      const itemSubtotal = parseFloat(product.price) * item.quantity;
      subtotal += itemSubtotal;
      validatedItems.push({ product_id: product.product_id, product_name: product.product_name, price_at_purchase: parseFloat(product.price), quantity: item.quantity, subtotal: itemSubtotal, product_specific_notes: item.product_specific_notes || null });
    }
    let discount_amount = 0;
    if (promo_code) {
      const promoResult = await client.query('SELECT * FROM promo_codes WHERE code = $1 AND is_active = true', [promo_code]);
      if (promoResult.rows.length > 0) {
        const promo = promoResult.rows[0];
        const now = new Date();
        if (new Date(promo.valid_from) <= now && new Date(promo.valid_until) >= now) {
          if (!promo.minimum_order_value || subtotal >= parseFloat(promo.minimum_order_value)) {
            if (promo.discount_type === 'percentage') {
              discount_amount = (subtotal * parseFloat(promo.discount_value)) / 100;
            } else if (promo.discount_type === 'fixed') {
              discount_amount = parseFloat(promo.discount_value);
            }
            discount_amount = Math.min(discount_amount, subtotal);
          }
        }
      }
    }
    if (user_id && loyalty_points_used > 0) {
      const userResult = await client.query('SELECT loyalty_points_balance FROM users WHERE user_id = $1', [user_id]);
      if (userResult.rows.length === 0 || parseFloat(userResult.rows[0].loyalty_points_balance) < loyalty_points_used) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json(createErrorResponse(`Insufficient loyalty points. Available: ${userResult.rows[0] ? Math.floor(parseFloat(userResult.rows[0].loyalty_points_balance)) : 0}, Requested: ${loyalty_points_used}`, null, 'INSUFFICIENT_LOYALTY_POINTS'));
      }
      discount_amount += loyalty_points_used / 100;
    }
    let delivery_fee = 0;
    if (fulfillment_method === 'delivery') {
      const locResult = await client.query('SELECT delivery_fee, free_delivery_threshold FROM locations WHERE location_name = $1', [location_name]);
      if (locResult.rows.length > 0) {
        const loc = locResult.rows[0];
        if (!loc.free_delivery_threshold || subtotal < parseFloat(loc.free_delivery_threshold)) {
          delivery_fee = parseFloat(loc.delivery_fee || 0);
        }
      }
    }
    const tax_amount = (subtotal - discount_amount) * 0.23;
    const total_amount = subtotal + delivery_fee - discount_amount + tax_amount;
    const locResult = await client.query('SELECT estimated_preparation_time_minutes, estimated_delivery_time_minutes FROM locations WHERE location_name = $1', [location_name]);
    const loc = locResult.rows[0];
    const prep_time = parseFloat(loc.estimated_preparation_time_minutes);
    const deliv_time = fulfillment_method === 'delivery' ? parseFloat(loc.estimated_delivery_time_minutes || 0) : 0;
    const estimated_ready_time = new Date(Date.now() + (prep_time + deliv_time) * 60 * 1000).toISOString();
    const settingResult = await client.query("SELECT setting_value FROM system_settings WHERE setting_key = 'loyalty_points_per_pound'");
    const loyalty_points_earned = user_id ? Math.floor(subtotal * parseFloat(settingResult.rows[0]?.setting_value || 1)) : 0;
    const collection_code = fulfillment_method === 'collection' ? generateCollectionCode() : null;
    const order_id = generateId('ord');
    const order_number = generateOrderNumber(order_type);
    const now = new Date().toISOString();
    const payment_transaction_id = `txn_${Date.now()}`;
    const card_last_four = '4242';
    await client.query('INSERT INTO orders (order_id, order_number, user_id, customer_email, customer_name, customer_phone, location_name, order_type, fulfillment_method, order_status, delivery_address_line1, delivery_address_line2, delivery_city, delivery_postal_code, delivery_phone, delivery_instructions, special_instructions, scheduled_for, estimated_ready_time, subtotal, delivery_fee, discount_amount, tax_amount, total_amount, loyalty_points_used, loyalty_points_earned, promo_code, payment_method, payment_status, payment_transaction_id, card_last_four, event_date, guest_count, event_type, company_name, collection_code, feedback_submitted, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39)', [order_id, order_number, user_id, customer_email, customer_name, customer_phone, location_name, order_type, fulfillment_method, 'paid_awaiting_confirmation', delivery_address_line1, delivery_address_line2, delivery_city, delivery_postal_code, delivery_phone, delivery_instructions, special_instructions, scheduled_for, estimated_ready_time, subtotal, delivery_fee, discount_amount, tax_amount, total_amount, loyalty_points_used, loyalty_points_earned, promo_code, payment_method, 'completed', payment_transaction_id, card_last_four, event_date, guest_count, event_type, company_name, collection_code, false, now, now]);
    for (const item of validatedItems) {
      const item_id = generateId('item');
      await client.query('INSERT INTO order_items (item_id, order_id, product_id, product_name, price_at_purchase, quantity, subtotal, product_specific_notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [item_id, order_id, item.product_id, item.product_name, item.price_at_purchase, item.quantity, item.subtotal, item.product_specific_notes]);
    }
    await client.query('INSERT INTO order_status_history (history_id, order_id, previous_status, new_status, changed_by_user_id, notes, changed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [generateId('hist'), order_id, null, 'pending_payment', null, 'Order created', now]);
    await client.query('INSERT INTO order_status_history (history_id, order_id, previous_status, new_status, changed_by_user_id, notes, changed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [generateId('hist'), order_id, 'pending_payment', 'paid_awaiting_confirmation', null, 'Payment completed', now]);
    if (user_id && loyalty_points_used > 0) {
      const userResult = await client.query('SELECT loyalty_points_balance FROM users WHERE user_id = $1', [user_id]);
      const current_balance = parseFloat(userResult.rows[0].loyalty_points_balance);
      
      // Double-check that user has enough points (transaction-level safety check)
      if (current_balance < loyalty_points_used) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json(createErrorResponse(`Insufficient loyalty points at redemption. Available: ${Math.floor(current_balance)}, Requested: ${loyalty_points_used}`, null, 'INSUFFICIENT_LOYALTY_POINTS'));
      }
      
      const new_balance = current_balance - loyalty_points_used;
      await client.query('INSERT INTO loyalty_points_transactions (transaction_id, user_id, transaction_type, points_change, balance_after, order_id, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [generateId('lpt'), user_id, 'redeemed', -loyalty_points_used, new_balance, order_id, `Points redeemed for order ${order_number}`, now]);
      await client.query('UPDATE users SET loyalty_points_balance = $1, updated_at = $2 WHERE user_id = $3', [new_balance, now, user_id]);
    }
    if (promo_code) {
      const promoResult = await client.query('SELECT code_id FROM promo_codes WHERE code = $1', [promo_code]);
      if (promoResult.rows.length > 0) {
        await client.query('UPDATE promo_codes SET times_used = times_used + 1, updated_at = $1 WHERE code_id = $2', [now, promoResult.rows[0].code_id]);
        await client.query('INSERT INTO promo_code_usage (usage_id, code_id, order_id, user_id, discount_applied, used_at) VALUES ($1, $2, $3, $4, $5, $6)', [generateId('usage'), promoResult.rows[0].code_id, order_id, user_id, discount_amount, now]);
      }
    }
    const email_id = generateId('email');
    await client.query('INSERT INTO email_logs (email_id, recipient_email, email_type, subject, template_used, related_order_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [email_id, customer_email, 'order_confirmation', `Order Confirmation - ${order_number}`, 'order-confirmation', order_id, 'sent', now]);
    await client.query('COMMIT');
    const orderResult = await client.query('SELECT * FROM orders WHERE order_id = $1', [order_id]);
    const itemsResult = await client.query('SELECT * FROM order_items WHERE order_id = $1', [order_id]);
    client.release();
    io.to(`location_${location_name}_staff`).emit('new_order', { event_type: 'new_order', timestamp: now, order_id, order_number, customer_name, location_name, fulfillment_method, total_amount, item_count: items.length });
    res.status(201).json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json(createErrorResponse('Failed to create order', error, 'ORDER_CREATE_ERROR'));
  }
});

app.get('/api/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { user_id, location_name, order_type, order_status, fulfillment_method, payment_status, date_from, date_to, search, revenue_min, revenue_max, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    let query = 'SELECT * FROM orders WHERE 1=1';
    const values = [];
    let idx = 1;
    if (req.user.user_type === 'customer') {
      query += ` AND user_id = $${idx++}`;
      values.push(req.user.user_id);
    } else if (req.user.user_type === 'staff') {
      const assignmentsResult = await client.query('SELECT location_name FROM staff_assignments WHERE user_id = $1', [req.user.user_id]);
      const assignedLocations = assignmentsResult.rows.map(r => r.location_name);
      if (assignedLocations.length > 0) {
        query += ` AND location_name = ANY($${idx++})`;
        values.push(assignedLocations);
      }
    }
    if (user_id) { query += ` AND user_id = $${idx++}`; values.push(user_id); }
    if (location_name) { query += ` AND location_name = $${idx++}`; values.push(location_name); }
    if (order_type) { query += ` AND order_type = $${idx++}`; values.push(order_type); }
    if (order_status) { query += ` AND order_status = $${idx++}`; values.push(order_status); }
    if (fulfillment_method) { query += ` AND fulfillment_method = $${idx++}`; values.push(fulfillment_method); }
    if (payment_status) { query += ` AND payment_status = $${idx++}`; values.push(payment_status); }
    if (date_from) { query += ` AND created_at >= $${idx++}`; values.push(date_from); }
    if (date_to) { query += ` AND created_at <= $${idx++}`; values.push(date_to); }
    if (search) { query += ` AND (order_number ILIKE $${idx} OR customer_name ILIKE $${idx})`; values.push(`%${search}%`); idx++; }
    if (revenue_min) { query += ` AND total_amount >= $${idx++}`; values.push(parseFloat(String(revenue_min))); }
    if (revenue_max) { query += ` AND total_amount <= $${idx++}`; values.push(parseFloat(String(revenue_max))); }
    const orderMap = { created_at: 'created_at', total_amount: 'total_amount', order_number: 'order_number' };
    query += ` ORDER BY ${orderMap[String(sort_by)] || 'created_at'} ${String(sort_order).toUpperCase()}`;
    query += ` LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(query, values);
    const countResult = await client.query(query.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    client.release();
    res.json({ data: result.rows.map(o => ({ ...o, subtotal: parseFloat(o.subtotal), delivery_fee: parseFloat(o.delivery_fee), discount_amount: parseFloat(o.discount_amount), tax_amount: parseFloat(o.tax_amount), total_amount: parseFloat(o.total_amount), loyalty_points_used: parseFloat(o.loyalty_points_used), loyalty_points_earned: parseFloat(o.loyalty_points_earned), guest_count: o.guest_count ? parseFloat(o.guest_count) : null })), total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch orders', error, 'ORDERS_FETCH_ERROR'));
  }
});

app.get('/api/orders/:order_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const orderResult = await client.query('SELECT * FROM orders WHERE order_id = $1', [req.params.order_id]);
    if (orderResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Order not found', null, 'ORDER_NOT_FOUND'));
    }
    const order = orderResult.rows[0];
    const itemsResult = await client.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.order_id]);
    const historyResult = await client.query('SELECT oh.*, u.first_name, u.last_name FROM order_status_history oh LEFT JOIN users u ON oh.changed_by_user_id = u.user_id WHERE oh.order_id = $1 ORDER BY oh.changed_at ASC', [req.params.order_id]);
    client.release();
    res.json({ ...order, subtotal: parseFloat(order.subtotal), delivery_fee: parseFloat(order.delivery_fee), discount_amount: parseFloat(order.discount_amount), tax_amount: parseFloat(order.tax_amount), total_amount: parseFloat(order.total_amount), loyalty_points_used: parseFloat(order.loyalty_points_used), loyalty_points_earned: parseFloat(order.loyalty_points_earned), guest_count: order.guest_count ? parseFloat(order.guest_count) : null, items: itemsResult.rows.map(i => ({ ...i, price_at_purchase: parseFloat(i.price_at_purchase), quantity: parseFloat(i.quantity), subtotal: parseFloat(i.subtotal) })), status_history: historyResult.rows.map(h => ({ ...h, changed_by_name: h.first_name ? `${h.first_name} ${h.last_name}` : null })) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch order', error, 'ORDER_FETCH_ERROR'));
  }
});

app.put('/api/orders/:order_id/status', authenticateToken, requireRole(['staff', 'admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { order_status, notes } = req.body;
    const orderResult = await client.query('SELECT * FROM orders WHERE order_id = $1', [req.params.order_id]);
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json(createErrorResponse('Order not found', null, 'ORDER_NOT_FOUND'));
    }
    const order = orderResult.rows[0];
    if (req.user.user_type === 'staff') {
      const assignmentCheck = await client.query('SELECT COUNT(*) FROM staff_assignments WHERE user_id = $1 AND location_name = $2', [req.user.user_id, order.location_name]);
      if (parseInt(assignmentCheck.rows[0].count) === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(403).json(createErrorResponse('Cannot update orders for this location', null, 'FORBIDDEN'));
      }
    }
    const now = new Date().toISOString();
    let collection_code = order.collection_code;
    if (order_status === 'ready_for_collection' && !collection_code) {
      collection_code = generateCollectionCode();
    }
    let completed_at = order.completed_at;
    if (['collected', 'delivered'].includes(order_status)) completed_at = now;
    await client.query('UPDATE orders SET order_status = $1, collection_code = $2, completed_at = $3, updated_at = $4 WHERE order_id = $5', [order_status, collection_code, completed_at, now, req.params.order_id]);
    await client.query('INSERT INTO order_status_history (history_id, order_id, previous_status, new_status, changed_by_user_id, notes, changed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [generateId('hist'), req.params.order_id, order.order_status, order_status, req.user.user_id, notes, now]);
    // Award loyalty points when order is collected/delivered, but only if not already awarded
    if (['collected', 'delivered'].includes(order_status) && order.user_id && parseFloat(order.loyalty_points_earned) > 0) {
      // Check if points were already awarded for this order
      const existingTransaction = await client.query('SELECT transaction_id FROM loyalty_points_transactions WHERE order_id = $1 AND transaction_type = $2', [req.params.order_id, 'earned']);
      if (existingTransaction.rows.length === 0) {
        const userResult = await client.query('SELECT loyalty_points_balance FROM users WHERE user_id = $1', [order.user_id]);
        const current_balance = parseFloat(userResult.rows[0].loyalty_points_balance);
        const new_balance = current_balance + parseFloat(order.loyalty_points_earned);
        await client.query('INSERT INTO loyalty_points_transactions (transaction_id, user_id, transaction_type, points_change, balance_after, order_id, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [generateId('lpt'), order.user_id, 'earned', parseFloat(order.loyalty_points_earned), new_balance, req.params.order_id, `Points earned from order ${order.order_number}`, now]);
        await client.query('UPDATE users SET loyalty_points_balance = $1, updated_at = $2 WHERE user_id = $3', [new_balance, now, order.user_id]);
      }
    }
    const email_id = generateId('email');
    let email_type = 'order_status_update';
    let subject = 'Order Update';
    if (order_status === 'ready_for_collection') { subject = 'Your Order is Ready for Pickup!'; email_type = 'order_ready'; }
    if (order_status === 'out_for_delivery') { subject = 'Your Order is On the Way!'; email_type = 'order_delivery'; }
    if (order_status === 'delivered' || order_status === 'collected') { subject = 'Thank You!'; email_type = 'order_delivered'; }
    await client.query('INSERT INTO email_logs (email_id, recipient_email, email_type, subject, template_used, related_order_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [email_id, order.customer_email, email_type, subject, 'order-status-update', req.params.order_id, 'sent', now]);
    await client.query('COMMIT');
    const updatedOrder = await client.query('SELECT * FROM orders WHERE order_id = $1', [req.params.order_id]);
    const historyResult = await client.query('SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY changed_at ASC', [req.params.order_id]);
    client.release();
    io.to(`order_${req.params.order_id}`).emit('order_status_changed', { event_type: 'order_status_changed', timestamp: now, order_id: req.params.order_id, order_number: order.order_number, previous_status: order.order_status, new_status: order_status, location_name: order.location_name, fulfillment_method: order.fulfillment_method, estimated_ready_time: order.estimated_ready_time, collection_code });
    res.json({ ...updatedOrder.rows[0], status_history: historyResult.rows });
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json(createErrorResponse('Failed to update order status', error, 'ORDER_STATUS_UPDATE_ERROR'));
  }
});

// Payment confirmation endpoint - allows customers to confirm payment on their own orders
app.put('/api/orders/:order_id/confirm-payment', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { payment_transaction_id, card_last_four } = req.body;
    
    const orderResult = await client.query('SELECT * FROM orders WHERE order_id = $1', [req.params.order_id]);
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json(createErrorResponse('Order not found', null, 'ORDER_NOT_FOUND'));
    }
    
    const order = orderResult.rows[0];
    
    // Customers can only confirm payment on their own orders (or if user_id is null for guest orders)
    if (req.user.user_type === 'customer' && order.user_id && order.user_id !== req.user.user_id) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(403).json(createErrorResponse('Cannot confirm payment for this order', null, 'FORBIDDEN'));
    }
    
    // Only allow payment confirmation if order is in 'paid_awaiting_confirmation' status
    if (order.order_status !== 'paid_awaiting_confirmation') {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json(createErrorResponse('Order status does not allow payment confirmation', null, 'INVALID_STATUS'));
    }
    
    const now = new Date().toISOString();
    const new_status = 'payment_confirmed';
    
    // Update order with payment confirmation
    await client.query(
      'UPDATE orders SET order_status = $1, payment_transaction_id = $2, card_last_four = $3, updated_at = $4 WHERE order_id = $5',
      [new_status, payment_transaction_id, card_last_four, now, req.params.order_id]
    );
    
    // Add status history entry
    await client.query(
      'INSERT INTO order_status_history (history_id, order_id, previous_status, new_status, changed_by_user_id, notes, changed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [generateId('hist'), req.params.order_id, order.order_status, new_status, req.user.user_id, 'Payment confirmed by customer', now]
    );
    
    // Award loyalty points when payment is confirmed, but only if not already awarded
    if (order.user_id && parseFloat(order.loyalty_points_earned) > 0) {
      // Check if points were already awarded for this order
      const existingTransaction = await client.query('SELECT transaction_id FROM loyalty_points_transactions WHERE order_id = $1 AND transaction_type = $2', [req.params.order_id, 'earned']);
      if (existingTransaction.rows.length === 0) {
        const userResult = await client.query('SELECT loyalty_points_balance FROM users WHERE user_id = $1', [order.user_id]);
        const current_balance = parseFloat(userResult.rows[0].loyalty_points_balance);
        const new_balance = current_balance + parseFloat(order.loyalty_points_earned);
        await client.query('INSERT INTO loyalty_points_transactions (transaction_id, user_id, transaction_type, points_change, balance_after, order_id, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [generateId('lpt'), order.user_id, 'earned', parseFloat(order.loyalty_points_earned), new_balance, req.params.order_id, `Points earned from order ${order.order_number}`, now]);
        await client.query('UPDATE users SET loyalty_points_balance = $1, updated_at = $2 WHERE user_id = $3', [new_balance, now, order.user_id]);
      }
    }
    
    await client.query('COMMIT');
    
    const updatedOrder = await client.query('SELECT * FROM orders WHERE order_id = $1', [req.params.order_id]);
    client.release();
    
    // Emit socket event to notify staff
    io.to(`location_${order.location_name}_staff`).emit('order_status_changed', {
      event_type: 'order_status_changed',
      timestamp: now,
      order_id: req.params.order_id,
      order_number: order.order_number,
      previous_status: order.order_status,
      new_status: new_status,
      location_name: order.location_name,
      fulfillment_method: order.fulfillment_method,
      estimated_ready_time: order.estimated_ready_time
    });
    
    res.json(updatedOrder.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json(createErrorResponse('Failed to confirm payment', error, 'PAYMENT_CONFIRM_ERROR'));
  }
});

app.post('/api/orders/:order_id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { reason } = req.body;
    const orderResult = await client.query('SELECT * FROM orders WHERE order_id = $1', [req.params.order_id]);
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json(createErrorResponse('Order not found', null, 'ORDER_NOT_FOUND'));
    }
    const order = orderResult.rows[0];
    if (req.user.user_type === 'customer' && order.user_id !== req.user.user_id) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(403).json(createErrorResponse('Cannot cancel this order', null, 'FORBIDDEN'));
    }
    if (!['paid_awaiting_confirmation', 'payment_confirmed', 'accepted_in_preparation'].includes(order.order_status)) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json(createErrorResponse('Order cannot be cancelled at this stage', null, 'INVALID_STATUS'));
    }
    const now = new Date().toISOString();
    await client.query('UPDATE orders SET order_status = $1, payment_status = $2, updated_at = $3 WHERE order_id = $4', ['cancelled', 'refunded', now, req.params.order_id]);
    await client.query('INSERT INTO order_status_history (history_id, order_id, previous_status, new_status, changed_by_user_id, notes, changed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [generateId('hist'), req.params.order_id, order.order_status, 'cancelled', req.user.user_id, reason || 'Customer cancellation', now]);
    if (order.user_id && parseFloat(order.loyalty_points_used) > 0) {
      const userResult = await client.query('SELECT loyalty_points_balance FROM users WHERE user_id = $1', [order.user_id]);
      const current_balance = parseFloat(userResult.rows[0].loyalty_points_balance);
      const new_balance = current_balance + parseFloat(order.loyalty_points_used);
      await client.query('INSERT INTO loyalty_points_transactions (transaction_id, user_id, transaction_type, points_change, balance_after, order_id, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [generateId('lpt'), order.user_id, 'manual_adjustment', parseFloat(order.loyalty_points_used), new_balance, req.params.order_id, 'Points restored from cancelled order', now]);
      await client.query('UPDATE users SET loyalty_points_balance = $1, updated_at = $2 WHERE user_id = $3', [new_balance, now, order.user_id]);
    }
    await client.query('COMMIT');
    const updatedOrder = await client.query('SELECT * FROM orders WHERE order_id = $1', [req.params.order_id]);
    client.release();
    res.json(updatedOrder.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json(createErrorResponse('Failed to cancel order', error, 'ORDER_CANCEL_ERROR'));
  }
});

app.get('/api/addresses', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user.user_id]);
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch addresses', error, 'ADDRESSES_FETCH_ERROR'));
  }
});

app.post('/api/addresses', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { address_label, address_line1, address_line2, city, postal_code, delivery_phone, delivery_instructions, is_default = false } = req.body;
    const address_id = generateId('addr');
    const now = new Date().toISOString();
    if (is_default) await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.user_id]);
    await client.query('INSERT INTO addresses (address_id, user_id, address_label, address_line1, address_line2, city, postal_code, delivery_phone, delivery_instructions, is_default, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [address_id, req.user.user_id, address_label, address_line1, address_line2, city, postal_code, delivery_phone, delivery_instructions, is_default, now, now]);
    const result = await client.query('SELECT * FROM addresses WHERE address_id = $1', [address_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create address', error, 'ADDRESS_CREATE_ERROR'));
  }
});

app.put('/api/addresses/:address_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    ['address_label', 'address_line1', 'address_line2', 'city', 'postal_code', 'delivery_phone', 'delivery_instructions', 'is_default'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(req.body[field]);
      }
    });
    if (req.body.is_default) await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.user_id]);
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.address_id);
    await client.query(`UPDATE addresses SET ${updates.join(', ')} WHERE address_id = $${idx}`, values);
    const result = await client.query('SELECT * FROM addresses WHERE address_id = $1', [req.params.address_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update address', error, 'ADDRESS_UPDATE_ERROR'));
  }
});

app.delete('/api/addresses/:address_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM addresses WHERE address_id = $1 AND user_id = $2', [req.params.address_id, req.user.user_id]);
    client.release();
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete address', error, 'ADDRESS_DELETE_ERROR'));
  }
});

app.get('/api/loyalty-points/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { transaction_type, date_from, date_to } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    let query = 'SELECT * FROM loyalty_points_transactions WHERE user_id = $1';
    const values: any[] = [req.user?.user_id];
    let idx = 2;
    if (transaction_type) { query += ` AND transaction_type = $${idx++}`; values.push(String(transaction_type)); }
    if (date_from) { query += ` AND created_at >= $${idx++}`; values.push(String(date_from)); }
    if (date_to) { query += ` AND created_at <= $${idx++}`; values.push(String(date_to)); }
    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(query, values);
    const countResult = await client.query(query.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    client.release();
    res.json({ data: result.rows.map(t => ({ ...t, points_change: parseFloat(t.points_change), balance_after: parseFloat(t.balance_after) })), total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch transactions', error, 'TRANSACTIONS_FETCH_ERROR'));
  }
});

app.get('/api/loyalty-points/balance', authenticateToken, async (req: AuthRequest, res: Response) => {
  res.json({ balance: parseFloat(String(req.user?.loyalty_points_balance || 0)), user_id: req.user?.user_id });
});

app.get('/api/feedback/customer', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { order_id, reviewed_status, date_from, date_to } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    const min_rating = req.query.min_rating ? parseInt(String(req.query.min_rating)) : undefined;
    const max_rating = req.query.max_rating ? parseInt(String(req.query.max_rating)) : undefined;
    let query = 'SELECT cf.*, o.order_number, o.location_name FROM customer_feedback cf INNER JOIN orders o ON cf.order_id = o.order_id WHERE 1=1';
    const values = [];
    let idx = 1;
    if (req.user.user_type === 'customer') {
      query += ` AND cf.user_id = $${idx++}`;
      values.push(req.user.user_id);
    } else if (req.user.user_type === 'staff') {
      const assignmentsResult = await client.query('SELECT location_name FROM staff_assignments WHERE user_id = $1', [req.user.user_id]);
      const assignedLocations = assignmentsResult.rows.map(r => r.location_name);
      if (assignedLocations.length > 0) {
        query += ` AND o.location_name = ANY($${idx++}) AND cf.is_hidden_from_staff = false`;
        values.push(assignedLocations);
      }
    }
    if (order_id) { query += ` AND cf.order_id = $${idx++}`; values.push(order_id); }
    if (reviewed_status) { query += ` AND cf.reviewed_status = $${idx++}`; values.push(reviewed_status); }
    if (min_rating !== undefined) { query += ` AND cf.overall_rating >= $${idx++}`; values.push(min_rating); }
    if (max_rating !== undefined) { query += ` AND cf.overall_rating <= $${idx++}`; values.push(max_rating); }
    if (date_from) { query += ` AND cf.created_at >= $${idx++}`; values.push(date_from); }
    if (date_to) { query += ` AND cf.created_at <= $${idx++}`; values.push(date_to); }
    query += ` ORDER BY cf.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(query, values);
    const countResult = await client.query(query.replace('SELECT cf.*, o.order_number, o.location_name', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    client.release();
    res.json({ data: result.rows.map(f => ({ ...f, overall_rating: parseFloat(f.overall_rating), product_rating: parseFloat(f.product_rating), fulfillment_rating: parseFloat(f.fulfillment_rating) })), total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch feedback', error, 'FEEDBACK_FETCH_ERROR'));
  }
});

app.post('/api/feedback/customer', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { order_id, overall_rating, product_rating, fulfillment_rating, product_comment, fulfillment_comment, overall_comment, quick_tags, allow_contact = false } = req.body;
    const orderResult = await client.query('SELECT * FROM orders WHERE order_id = $1', [order_id]);
    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json(createErrorResponse('Order not found', null, 'ORDER_NOT_FOUND'));
    }
    const order = orderResult.rows[0];
    if (!['collected', 'delivered', 'completed'].includes(order.order_status)) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json(createErrorResponse('Can only submit feedback for completed orders', null, 'INVALID_ORDER_STATUS'));
    }
    if (order.feedback_submitted) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json(createErrorResponse('Feedback already submitted', null, 'FEEDBACK_EXISTS'));
    }
    const feedback_id = generateId('fb');
    const now = new Date().toISOString();
    await client.query('INSERT INTO customer_feedback (feedback_id, order_id, user_id, overall_rating, product_rating, fulfillment_rating, product_comment, fulfillment_comment, overall_comment, quick_tags, allow_contact, reviewed_status, is_hidden_from_staff, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)', [feedback_id, order_id, order.user_id, overall_rating, product_rating, fulfillment_rating, product_comment, fulfillment_comment, overall_comment, quick_tags, allow_contact, 'pending_review', false, now, now]);
    await client.query('UPDATE orders SET feedback_submitted = true, updated_at = $1 WHERE order_id = $2', [now, order_id]);
    if (order.user_id) {
      const feedbackBonusResult = await client.query("SELECT setting_value FROM system_settings WHERE setting_key = 'feedback_bonus_points'");
      const bonusPoints = parseInt(feedbackBonusResult.rows[0]?.setting_value || 25);
      const userResult = await client.query('SELECT loyalty_points_balance FROM users WHERE user_id = $1', [order.user_id]);
      const current_balance = parseFloat(userResult.rows[0].loyalty_points_balance);
      const new_balance = current_balance + bonusPoints;
      await client.query('INSERT INTO loyalty_points_transactions (transaction_id, user_id, transaction_type, points_change, balance_after, order_id, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [generateId('lpt'), order.user_id, 'earned', bonusPoints, new_balance, order_id, 'Bonus points for feedback submission', now]);
      await client.query('UPDATE users SET loyalty_points_balance = $1, updated_at = $2 WHERE user_id = $3', [new_balance, now, order.user_id]);
    }
    await client.query('COMMIT');
    const result = await client.query('SELECT * FROM customer_feedback WHERE feedback_id = $1', [feedback_id]);
    client.release();
    if (overall_rating <= 2) {
      io.to('admin_dashboard').emit('feedback_received', { event_type: 'new_customer_feedback', timestamp: now, feedback_id, order_id, order_number: order.order_number, overall_rating, product_rating, fulfillment_rating, overall_comment, allow_contact, customer_name: order.customer_name, customer_email: order.customer_email, location_name: order.location_name });
    }
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json(createErrorResponse('Failed to submit feedback', error, 'FEEDBACK_SUBMIT_ERROR'));
  }
});

app.get('/api/feedback/customer/:feedback_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM customer_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    client.release();
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('Feedback not found', null, 'FEEDBACK_NOT_FOUND'));
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch feedback', error, 'FEEDBACK_FETCH_ERROR'));
  }
});

app.put('/api/feedback/customer/:feedback_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const feedbackResult = await client.query('SELECT * FROM customer_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    if (feedbackResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Feedback not found', null, 'FEEDBACK_NOT_FOUND'));
    }
    const feedback = feedbackResult.rows[0];
    const hoursSinceCreated = (Date.now() - new Date(feedback.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreated > 48) {
      client.release();
      return res.status(400).json(createErrorResponse('Can only edit feedback within 48 hours', null, 'EDIT_WINDOW_EXPIRED'));
    }
    const { overall_rating, product_rating, fulfillment_rating, product_comment, fulfillment_comment, overall_comment, quick_tags } = req.body;
    const now = new Date().toISOString();
    await client.query('UPDATE customer_feedback SET overall_rating = $1, product_rating = $2, fulfillment_rating = $3, product_comment = $4, fulfillment_comment = $5, overall_comment = $6, quick_tags = $7, updated_at = $8 WHERE feedback_id = $9', [overall_rating, product_rating, fulfillment_rating, product_comment, fulfillment_comment, overall_comment, quick_tags, now, req.params.feedback_id]);
    const result = await client.query('SELECT * FROM customer_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update feedback', error, 'FEEDBACK_UPDATE_ERROR'));
  }
});

app.post('/api/feedback/customer/:feedback_id/review', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { reviewed_status, notes } = req.body;
    const now = new Date().toISOString();
    await client.query('UPDATE customer_feedback SET reviewed_status = $1, reviewed_by_user_id = $2, reviewed_at = $3, updated_at = $4 WHERE feedback_id = $5', [reviewed_status, req.user.user_id, now, now, req.params.feedback_id]);
    if (notes) {
      await client.query('INSERT INTO feedback_internal_notes (note_id, feedback_id, created_by_user_id, note_text, created_at) VALUES ($1, $2, $3, $4, $5)', [generateId('fn'), req.params.feedback_id, req.user.user_id, notes, now]);
    }
    const result = await client.query('SELECT * FROM customer_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to review feedback', error, 'FEEDBACK_REVIEW_ERROR'));
  }
});

app.get('/api/feedback/staff', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { location_name, feedback_type, status, priority, date_from, date_to } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    let query = 'SELECT * FROM staff_feedback WHERE 1=1';
    const values = [];
    let idx = 1;
    if (req.user.user_type === 'staff') {
      query += ` AND submitted_by_user_id = $${idx++}`;
      values.push(req.user.user_id);
    }
    if (location_name) { query += ` AND location_name = $${idx++}`; values.push(location_name); }
    if (feedback_type) { query += ` AND feedback_type = $${idx++}`; values.push(feedback_type); }
    if (status) { query += ` AND status = $${idx++}`; values.push(status); }
    if (priority) { query += ` AND priority = $${idx++}`; values.push(priority); }
    if (date_from) { query += ` AND created_at >= $${idx++}`; values.push(date_from); }
    if (date_to) { query += ` AND created_at <= $${idx++}`; values.push(date_to); }
    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(query, values);
    const countResult = await client.query(query.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    client.release();
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch staff feedback', error, 'STAFF_FEEDBACK_FETCH_ERROR'));
  }
});

app.post('/api/feedback/staff', authenticateToken, requireRole(['staff', 'admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { location_name, feedback_type, title, description, priority = 'medium', attachment_urls, is_anonymous = false } = req.body;
    const feedback_id = generateId('sf');
    const reference_number = `SF-${Date.now().toString().slice(-8)}`;
    const now = new Date().toISOString();
    await client.query('INSERT INTO staff_feedback (feedback_id, reference_number, submitted_by_user_id, location_name, feedback_type, title, description, priority, attachment_urls, is_anonymous, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [feedback_id, reference_number, req.user.user_id, location_name, feedback_type, title, description, priority, attachment_urls, is_anonymous, 'pending_review', now, now]);
    const result = await client.query('SELECT * FROM staff_feedback WHERE feedback_id = $1', [feedback_id]);
    const userResult = await client.query('SELECT first_name, last_name FROM users WHERE user_id = $1', [req.user.user_id]);
    client.release();
    io.to('admin_dashboard').emit('staff_feedback_received', { event_type: 'new_staff_feedback', timestamp: now, feedback_id, reference_number, submitted_by_name: is_anonymous ? 'Anonymous' : `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`, location_name, feedback_type, title, priority, status: 'pending_review' });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to submit staff feedback', error, 'STAFF_FEEDBACK_SUBMIT_ERROR'));
  }
});

app.get('/api/feedback/staff/:feedback_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM staff_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    client.release();
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('Feedback not found', null, 'FEEDBACK_NOT_FOUND'));
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch feedback', error, 'FEEDBACK_FETCH_ERROR'));
  }
});

app.put('/api/feedback/staff/:feedback_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { status, priority, assigned_to_user_id, resolution_notes } = req.body;
    const feedbackResult = await client.query('SELECT * FROM staff_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    if (feedbackResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json(createErrorResponse('Feedback not found', null, 'FEEDBACK_NOT_FOUND'));
    }
    const feedback = feedbackResult.rows[0];
    const updates = [];
    const values = [];
    let idx = 1;
    if (status) { updates.push(`status = $${idx++}`); values.push(status); }
    if (priority) { updates.push(`priority = $${idx++}`); values.push(priority); }
    if (assigned_to_user_id !== undefined) { updates.push(`assigned_to_user_id = $${idx++}`); values.push(assigned_to_user_id); }
    if (resolution_notes) { updates.push(`resolution_notes = $${idx++}`); values.push(resolution_notes); }
    if (status === 'resolved') { updates.push(`resolved_at = $${idx++}`); values.push(new Date().toISOString()); }
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.feedback_id);
    await client.query(`UPDATE staff_feedback SET ${updates.join(', ')} WHERE feedback_id = $${idx}`, values);
    await client.query('COMMIT');
    const result = await client.query('SELECT * FROM staff_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    client.release();
    io.to(`user_${feedback.submitted_by_user_id}`).emit('staff_feedback_response', { event_type: 'staff_feedback_updated', timestamp: now, feedback_id: req.params.feedback_id, reference_number: feedback.reference_number, new_status: status, resolution_notes });
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json(createErrorResponse('Failed to update staff feedback', error, 'STAFF_FEEDBACK_UPDATE_ERROR'));
  }
});

app.get('/api/inventory/alerts', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { location_name, alert_type, status, priority, date_from, date_to, search } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    let query = 'SELECT * FROM inventory_alerts WHERE 1=1';
    const values = [];
    let idx = 1;
    if (location_name) { query += ` AND location_name = $${idx++}`; values.push(location_name); }
    if (alert_type) { query += ` AND alert_type = $${idx++}`; values.push(alert_type); }
    if (status) { query += ` AND status = $${idx++}`; values.push(status); }
    if (priority) { query += ` AND priority = $${idx++}`; values.push(priority); }
    if (date_from) { query += ` AND created_at >= $${idx++}`; values.push(date_from); }
    if (date_to) { query += ` AND created_at <= $${idx++}`; values.push(date_to); }
    if (search) { query += ` AND (item_name ILIKE $${idx} OR reference_number ILIKE $${idx})`; values.push(`%${search}%`); idx++; }
    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(query, values);
    const countResult = await client.query(query.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    client.release();
    res.json({ data: result.rows.map(a => ({ ...a, current_quantity: a.current_quantity ? parseFloat(a.current_quantity) : null })), total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch inventory alerts', error, 'ALERTS_FETCH_ERROR'));
  }
});

app.post('/api/inventory/alerts', authenticateToken, requireRole(['staff', 'admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { location_name, item_name, alert_type, current_quantity, notes, priority = 'medium' } = req.body;
    const alert_id = generateId('ia');
    const reference_number = `INV-${Date.now().toString().slice(-5)}`;
    const now = new Date().toISOString();
    const auto_priority = alert_type === 'out_of_stock' ? 'high' : priority;
    await client.query('INSERT INTO inventory_alerts (alert_id, reference_number, submitted_by_user_id, location_name, item_name, alert_type, current_quantity, notes, priority, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [alert_id, reference_number, req.user.user_id, location_name, item_name, alert_type, current_quantity, notes, auto_priority, 'pending', now, now]);
    const result = await client.query('SELECT * FROM inventory_alerts WHERE alert_id = $1', [alert_id]);
    const userResult = await client.query('SELECT first_name, last_name FROM users WHERE user_id = $1', [req.user.user_id]);
    client.release();
    io.to('admin_dashboard').emit('inventory_alert', { event_type: 'new_inventory_alert', timestamp: now, alert_id, reference_number, submitted_by_name: `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`, location_name, item_name, alert_type, current_quantity, priority: auto_priority, status: 'pending' });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create inventory alert', error, 'ALERT_CREATE_ERROR'));
  }
});

app.get('/api/inventory/alerts/:alert_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM inventory_alerts WHERE alert_id = $1', [req.params.alert_id]);
    client.release();
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('Alert not found', null, 'ALERT_NOT_FOUND'));
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch alert', error, 'ALERT_FETCH_ERROR'));
  }
});

app.put('/api/inventory/alerts/:alert_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { status, priority, resolution_notes } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;
    const now = new Date().toISOString();
    if (status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
      if (status === 'acknowledged') {
        updates.push(`acknowledged_by_user_id = $${idx++}`);
        values.push(req.user.user_id);
        updates.push(`acknowledged_at = $${idx++}`);
        values.push(now);
      }
      if (status === 'resolved') {
        updates.push(`resolved_by_user_id = $${idx++}`);
        values.push(req.user.user_id);
        updates.push(`resolved_at = $${idx++}`);
        values.push(now);
      }
    }
    if (priority) { updates.push(`priority = $${idx++}`); values.push(priority); }
    if (resolution_notes) { updates.push(`resolution_notes = $${idx++}`); values.push(resolution_notes); }
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.alert_id);
    await client.query(`UPDATE inventory_alerts SET ${updates.join(', ')} WHERE alert_id = $${idx}`, values);
    const result = await client.query('SELECT * FROM inventory_alerts WHERE alert_id = $1', [req.params.alert_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update alert', error, 'ALERT_UPDATE_ERROR'));
  }
});

app.get('/api/training/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { category, status, is_required, query } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    let sqlQuery = 'SELECT * FROM training_courses WHERE 1=1';
    const values = [];
    let idx = 1;
    if (req.user.user_type === 'staff') {
      sqlQuery += ` AND status = $${idx++}`;
      values.push('published');
    }
    if (category) { sqlQuery += ` AND category = $${idx++}`; values.push(category); }
    if (status && req.user.user_type === 'admin') { sqlQuery += ` AND status = $${idx++}`; values.push(status); }
    if (is_required !== undefined) { sqlQuery += ` AND is_required = $${idx++}`; values.push(String(is_required) === 'true'); }
    if (query) { sqlQuery += ` AND (course_title ILIKE $${idx} OR short_description ILIKE $${idx})`; values.push(`%${query}%`); idx++; }
    sqlQuery += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(sqlQuery, values);
    const countResult = await client.query(sqlQuery.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    const coursesWithLessons = [];
    for (const course of result.rows) {
      const lessonsResult = await client.query('SELECT * FROM training_lessons WHERE course_id = $1 ORDER BY lesson_order ASC', [course.course_id]);
      coursesWithLessons.push({ ...course, lessons: lessonsResult.rows });
    }
    client.release();
    res.json({ data: coursesWithLessons, total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch courses', error, 'COURSES_FETCH_ERROR'));
  }
});

app.post('/api/training/courses', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { course_title, short_description, long_description, cover_image_url, category, tags, status = 'draft', is_required = false, estimated_duration_minutes, prerequisite_course_ids } = req.body;
    const course_id = generateId('course');
    const now = new Date().toISOString();
    await client.query('INSERT INTO training_courses (course_id, course_title, short_description, long_description, cover_image_url, category, tags, status, is_required, estimated_duration_minutes, prerequisite_course_ids, created_by_user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', [course_id, course_title, short_description, long_description, cover_image_url, category, tags, status, is_required, estimated_duration_minutes, prerequisite_course_ids, req.user.user_id, now, now]);
    const result = await client.query('SELECT * FROM training_courses WHERE course_id = $1', [course_id]);
    client.release();
    res.status(201).json({ ...result.rows[0], lessons: [] });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create course', error, 'COURSE_CREATE_ERROR'));
  }
});

app.get('/api/training/courses/:course_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const courseResult = await client.query('SELECT * FROM training_courses WHERE course_id = $1', [req.params.course_id]);
    if (courseResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Course not found', null, 'COURSE_NOT_FOUND'));
    }
    const lessonsResult = await client.query('SELECT * FROM training_lessons WHERE course_id = $1 ORDER BY lesson_order ASC', [req.params.course_id]);
    client.release();
    res.json({ ...courseResult.rows[0], lessons: lessonsResult.rows });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch course', error, 'COURSE_FETCH_ERROR'));
  }
});

app.put('/api/training/courses/:course_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    ['course_title', 'short_description', 'long_description', 'cover_image_url', 'category', 'tags', 'status', 'is_required', 'estimated_duration_minutes', 'prerequisite_course_ids'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(req.body[field]);
      }
    });
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.course_id);
    await client.query(`UPDATE training_courses SET ${updates.join(', ')} WHERE course_id = $${idx}`, values);
    const result = await client.query('SELECT * FROM training_courses WHERE course_id = $1', [req.params.course_id]);
    const lessonsResult = await client.query('SELECT * FROM training_lessons WHERE course_id = $1 ORDER BY lesson_order ASC', [req.params.course_id]);
    client.release();
    res.json({ ...result.rows[0], lessons: lessonsResult.rows });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update course', error, 'COURSE_UPDATE_ERROR'));
  }
});

app.get('/api/training/courses/:course_id/progress', authenticateToken, requireRole(['staff']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM staff_course_progress WHERE user_id = $1 AND course_id = $2', [req.user.user_id, req.params.course_id]);
    if (result.rows.length === 0) {
      const progress_id = generateId('prog');
      await client.query('INSERT INTO staff_course_progress (progress_id, user_id, course_id, status, progress_percentage) VALUES ($1, $2, $3, $4, $5)', [progress_id, req.user.user_id, req.params.course_id, 'not_started', 0]);
      const newResult = await client.query('SELECT * FROM staff_course_progress WHERE progress_id = $1', [progress_id]);
      client.release();
      return res.json(newResult.rows[0]);
    }
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch progress', error, 'PROGRESS_FETCH_ERROR'));
  }
});

app.get('/api/training/courses/:course_id/lessons/completions', authenticateToken, requireRole(['staff']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT slc.* FROM staff_lesson_completion slc 
       INNER JOIN training_lessons tl ON slc.lesson_id = tl.lesson_id 
       WHERE slc.user_id = $1 AND tl.course_id = $2`,
      [req.user.user_id, req.params.course_id]
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch lesson completions', error, 'LESSON_COMPLETIONS_FETCH_ERROR'));
  }
});

app.post('/api/training/lessons/:lesson_id/complete', authenticateToken, requireRole(['staff']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { personal_notes } = req.body;
    const lessonResult = await client.query('SELECT * FROM training_lessons WHERE lesson_id = $1', [req.params.lesson_id]);
    if (lessonResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json(createErrorResponse('Lesson not found', null, 'LESSON_NOT_FOUND'));
    }
    const lesson = lessonResult.rows[0];
    const now = new Date().toISOString();
    const completionResult = await client.query('SELECT * FROM staff_lesson_completion WHERE user_id = $1 AND lesson_id = $2', [req.user.user_id, req.params.lesson_id]);
    if (completionResult.rows.length === 0) {
      const completion_id = generateId('comp');
      await client.query('INSERT INTO staff_lesson_completion (completion_id, user_id, lesson_id, is_completed, personal_notes, completed_at) VALUES ($1, $2, $3, $4, $5, $6)', [completion_id, req.user.user_id, req.params.lesson_id, true, personal_notes, now]);
    } else {
      await client.query('UPDATE staff_lesson_completion SET is_completed = true, personal_notes = $1, completed_at = $2 WHERE user_id = $3 AND lesson_id = $4', [personal_notes, now, req.user.user_id, req.params.lesson_id]);
    }
    const allLessonsResult = await client.query('SELECT COUNT(*) FROM training_lessons WHERE course_id = $1', [lesson.course_id]);
    const completedLessonsResult = await client.query('SELECT COUNT(*) FROM staff_lesson_completion WHERE user_id = $1 AND is_completed = true AND lesson_id IN (SELECT lesson_id FROM training_lessons WHERE course_id = $2)', [req.user.user_id, lesson.course_id]);
    const total_lessons = parseInt(allLessonsResult.rows[0].count);
    const completed_lessons = parseInt(completedLessonsResult.rows[0].count);
    const progress_percentage = (completed_lessons / total_lessons) * 100;
    const course_status = progress_percentage === 100 ? 'completed' : 'in_progress';
    const progressResult = await client.query('SELECT * FROM staff_course_progress WHERE user_id = $1 AND course_id = $2', [req.user.user_id, lesson.course_id]);
    if (progressResult.rows.length === 0) {
      const progress_id = generateId('prog');
      await client.query('INSERT INTO staff_course_progress (progress_id, user_id, course_id, status, progress_percentage, started_at, completed_at, last_accessed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [progress_id, req.user.user_id, lesson.course_id, course_status, progress_percentage, now, course_status === 'completed' ? now : null, now]);
    } else {
      await client.query('UPDATE staff_course_progress SET status = $1, progress_percentage = $2, completed_at = $3, last_accessed_at = $4 WHERE user_id = $5 AND course_id = $6', [course_status, progress_percentage, course_status === 'completed' ? now : null, now, req.user.user_id, lesson.course_id]);
    }
    await client.query('COMMIT');
    client.release();
    io.to(`user_${req.user.user_id}`).emit('lesson_completed', { event_type: 'lesson_completed', timestamp: now, lesson_id: req.params.lesson_id, course_id: lesson.course_id, course_progress_percentage: progress_percentage });
    res.json({ success: true, message: 'Lesson marked as complete', progress_percentage });
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json(createErrorResponse('Failed to mark lesson complete', error, 'LESSON_COMPLETE_ERROR'));
  }
});

app.get('/api/training/progress', authenticateToken, requireRole(['staff']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT scp.*, tc.course_title FROM staff_course_progress scp INNER JOIN training_courses tc ON scp.course_id = tc.course_id WHERE scp.user_id = $1 ORDER BY scp.last_accessed_at DESC', [req.user.user_id]);
    client.release();
    res.json(result.rows.map(p => ({ ...p, progress_percentage: parseFloat(p.progress_percentage) })));
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch training progress', error, 'PROGRESS_FETCH_ERROR'));
  }
});

// ============================================================================
// TRAINING LESSON MANAGEMENT ENDPOINTS
// ============================================================================

app.post('/api/training/courses/:course_id/lessons', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { lesson_title, lesson_type, content_url, content_text, duration_minutes, additional_notes, lesson_order } = req.body;
    const lesson_id = generateId('lesson');
    const now = new Date().toISOString();
    
    // Verify course exists
    const courseCheck = await client.query('SELECT course_id FROM training_courses WHERE course_id = $1', [req.params.course_id]);
    if (courseCheck.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Course not found', null, 'COURSE_NOT_FOUND'));
    }
    
    await client.query(
      'INSERT INTO training_lessons (lesson_id, course_id, lesson_title, lesson_type, content_url, content_text, duration_minutes, additional_notes, lesson_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [lesson_id, req.params.course_id, lesson_title, lesson_type, content_url, content_text, duration_minutes, additional_notes, lesson_order, now, now]
    );
    
    const result = await client.query('SELECT * FROM training_lessons WHERE lesson_id = $1', [lesson_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create lesson', error, 'LESSON_CREATE_ERROR'));
  }
});

app.get('/api/training/courses/:course_id/lessons', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM training_lessons WHERE course_id = $1 ORDER BY lesson_order ASC', [req.params.course_id]);
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch lessons', error, 'LESSONS_FETCH_ERROR'));
  }
});

app.put('/api/training/lessons/:lesson_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    ['lesson_title', 'lesson_type', 'content_url', 'content_text', 'duration_minutes', 'additional_notes', 'lesson_order'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(req.body[field]);
      }
    });
    
    if (updates.length === 0) {
      client.release();
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATES'));
    }
    
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.lesson_id);
    
    await client.query(`UPDATE training_lessons SET ${updates.join(', ')} WHERE lesson_id = $${idx}`, values);
    const result = await client.query('SELECT * FROM training_lessons WHERE lesson_id = $1', [req.params.lesson_id]);
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Lesson not found', null, 'LESSON_NOT_FOUND'));
    }
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update lesson', error, 'LESSON_UPDATE_ERROR'));
  }
});

app.delete('/api/training/lessons/:lesson_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM training_lessons WHERE lesson_id = $1 RETURNING *', [req.params.lesson_id]);
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Lesson not found', null, 'LESSON_NOT_FOUND'));
    }
    
    client.release();
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete lesson', error, 'LESSON_DELETE_ERROR'));
  }
});

app.post('/api/promo-codes/validate', async (req, res) => {
  const client = await pool.connect();
  try {
    const { code, order_total, location_name, product_ids = [] } = req.body;
    console.log('[PROMO API] Validating promo code:', code, 'for order total:', order_total);
    
    const promoResult = await client.query('SELECT * FROM promo_codes WHERE code = $1 AND is_active = true', [code]);
    if (promoResult.rows.length === 0) {
      console.log('[PROMO API] Promo code not found or inactive');
      client.release();
      return res.json({ is_valid: false, discount_amount: 0, message: 'Invalid promo code' });
    }
    const promo = promoResult.rows[0];
    console.log('[PROMO API] Found promo:', { discount_type: promo.discount_type, discount_value: promo.discount_value, minimum_order_value: promo.minimum_order_value });
    
    const now = new Date();
    if (new Date(promo.valid_from) > now || new Date(promo.valid_until) < now) {
      console.log('[PROMO API] Promo code expired');
      client.release();
      return res.json({ is_valid: false, discount_amount: 0, message: 'Promo code expired' });
    }
    if (promo.minimum_order_value && parseFloat(promo.minimum_order_value) > 0 && order_total < parseFloat(promo.minimum_order_value)) {
      console.log('[PROMO API] Order total below minimum:', order_total, '<', promo.minimum_order_value);
      client.release();
      return res.json({ is_valid: false, discount_amount: 0, message: `Minimum order €${promo.minimum_order_value} required` });
    }
    if (promo.usage_limit && parseInt(promo.times_used) >= parseInt(promo.usage_limit)) {
      console.log('[PROMO API] Usage limit reached');
      client.release();
      return res.json({ is_valid: false, discount_amount: 0, message: 'Promo code usage limit reached' });
    }
    let discount_amount = 0;
    if (promo.discount_type === 'percentage') {
      discount_amount = (order_total * parseFloat(promo.discount_value)) / 100;
      console.log('[PROMO API] Percentage discount calculated:', discount_amount);
    } else if (promo.discount_type === 'fixed') {
      discount_amount = parseFloat(promo.discount_value);
      console.log('[PROMO API] Fixed discount:', discount_amount);
    } else if (promo.discount_type === 'delivery') {
      discount_amount = parseFloat(promo.discount_value);
      console.log('[PROMO API] Delivery discount:', discount_amount);
    }
    discount_amount = Math.min(discount_amount, order_total);
    console.log('[PROMO API] Final discount amount:', discount_amount);
    
    client.release();
    res.json({ is_valid: true, discount_amount, message: 'Promo code applied successfully' });
  } catch (error) {
    console.error('[PROMO API] Error:', error);
    client.release();
    res.status(500).json(createErrorResponse('Failed to validate promo code', error, 'PROMO_VALIDATE_ERROR'));
  }
});

app.get('/api/promo-codes', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { query, discount_type, is_active } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    let sqlQuery = 'SELECT * FROM promo_codes WHERE 1=1';
    const values = [];
    let idx = 1;
    if (query) { sqlQuery += ` AND code ILIKE $${idx++}`; values.push(`%${query}%`); }
    if (discount_type) { sqlQuery += ` AND discount_type = $${idx++}`; values.push(discount_type); }
    if (is_active !== undefined) { sqlQuery += ` AND is_active = $${idx++}`; values.push(String(is_active) === 'true'); }
    sqlQuery += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(sqlQuery, values);
    const countResult = await client.query(sqlQuery.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    client.release();
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch promo codes', error, 'PROMO_FETCH_ERROR'));
  }
});

app.post('/api/promo-codes', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { code, discount_type, discount_value, minimum_order_value, valid_from, valid_until, usage_limit, is_single_use = false, applicable_locations, applicable_products, is_active = true } = req.body;
    const code_id = generateId('promo');
    const now = new Date().toISOString();
    await client.query('INSERT INTO promo_codes (code_id, code, discount_type, discount_value, minimum_order_value, valid_from, valid_until, usage_limit, is_single_use, times_used, applicable_locations, applicable_products, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)', [code_id, code.toUpperCase(), discount_type, discount_value, minimum_order_value, valid_from, valid_until, usage_limit, is_single_use, 0, applicable_locations, applicable_products, is_active, now, now]);
    const result = await client.query('SELECT * FROM promo_codes WHERE code_id = $1', [code_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create promo code', error, 'PROMO_CREATE_ERROR'));
  }
});

app.delete('/api/promo-codes/:code_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { code_id } = req.params;
    
    // Check if promo code exists
    const checkResult = await client.query('SELECT code_id FROM promo_codes WHERE code_id = $1', [code_id]);
    if (checkResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Promo code not found', null, 'PROMO_NOT_FOUND'));
    }
    
    // Delete the promo code
    await client.query('DELETE FROM promo_codes WHERE code_id = $1', [code_id]);
    client.release();
    res.status(200).json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete promo code', error, 'PROMO_DELETE_ERROR'));
  }
});

app.get('/api/drop-of-the-month', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM drop_of_the_month WHERE is_active = true ORDER BY created_at DESC LIMIT 1');
    client.release();
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('No active drop', null, 'NO_ACTIVE_DROP'));
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch drop of the month', error, 'DROP_FETCH_ERROR'));
  }
});

app.post('/api/drop-of-the-month', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { product_name, description, price, product_image_url, available_from, available_until, is_active = false } = req.body;
    if (is_active) await client.query('UPDATE drop_of_the_month SET is_active = false');
    const drop_id = generateId('drop');
    const now = new Date().toISOString();
    await client.query('INSERT INTO drop_of_the_month (drop_id, product_name, description, price, product_image_url, available_from, available_until, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [drop_id, product_name, description, price, product_image_url, available_from, available_until, is_active, now, now]);
    const result = await client.query('SELECT * FROM drop_of_the_month WHERE drop_id = $1', [drop_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create drop', error, 'DROP_CREATE_ERROR'));
  }
});

app.put('/api/drop-of-the-month/:drop_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    if (req.body.is_active) await client.query('UPDATE drop_of_the_month SET is_active = false');
    ['product_name', 'description', 'price', 'product_image_url', 'available_from', 'available_until', 'is_active'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(req.body[field]);
      }
    });
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.drop_id);
    await client.query(`UPDATE drop_of_the_month SET ${updates.join(', ')} WHERE drop_id = $${idx}`, values);
    const result = await client.query('SELECT * FROM drop_of_the_month WHERE drop_id = $1', [req.params.drop_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update drop', error, 'DROP_UPDATE_ERROR'));
  }
});

app.get('/api/stall-events', async (req, res) => {
  const client = await pool.connect();
  try {
    const { is_visible } = req.query;
    let query = 'SELECT * FROM stall_events';
    const values = [];
    if (is_visible !== undefined) {
      query += ' WHERE is_visible = $1';
      values.push(String(is_visible) === 'true');
    }
    query += ' ORDER BY event_date DESC';
    const result = await client.query(query, values);
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch events', error, 'EVENTS_FETCH_ERROR'));
  }
});

app.post('/api/stall-events', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { event_name, venue_location, event_date, event_time, description, event_image_url, cta_button_text, cta_button_action, cta_button_url, is_visible = false } = req.body;
    const event_id = generateId('event');
    const now = new Date().toISOString();
    await client.query('INSERT INTO stall_events (event_id, event_name, venue_location, event_date, event_time, description, event_image_url, cta_button_text, cta_button_action, cta_button_url, is_visible, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [event_id, event_name, venue_location, event_date, event_time, description, event_image_url, cta_button_text, cta_button_action, cta_button_url, is_visible, now, now]);
    const result = await client.query('SELECT * FROM stall_events WHERE event_id = $1', [event_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create event', error, 'EVENT_CREATE_ERROR'));
  }
});

app.put('/api/stall-events/:event_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const updates = [];
    const values = [];
    let idx = 1;
    ['event_name', 'venue_location', 'event_date', 'event_time', 'description', 'event_image_url', 'cta_button_text', 'cta_button_action', 'cta_button_url', 'is_visible'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(req.body[field]);
      }
    });
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.event_id);
    await client.query(`UPDATE stall_events SET ${updates.join(', ')} WHERE event_id = $${idx}`, values);
    const result = await client.query('SELECT * FROM stall_events WHERE event_id = $1', [req.params.event_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update event', error, 'EVENT_UPDATE_ERROR'));
  }
});

app.get('/api/favorites', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT f.*, p.product_name, p.price, p.primary_image_url FROM favorites f INNER JOIN products p ON f.product_id = p.product_id WHERE f.user_id = $1 ORDER BY f.created_at DESC', [req.user.user_id]);
    client.release();
    res.json(result.rows.map(f => ({ ...f, price: parseFloat(f.price) })));
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch favorites', error, 'FAVORITES_FETCH_ERROR'));
  }
});

app.post('/api/favorites', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { product_id } = req.body;
    
    // Check if favorite already exists
    const existingResult = await client.query('SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2', [req.user.user_id, product_id]);
    
    if (existingResult.rows.length > 0) {
      // Idempotent behavior: Return existing favorite with 200 OK instead of error
      client.release();
      return res.status(200).json({
        ...existingResult.rows[0],
        message: 'Product already in favorites'
      });
    }
    
    // Create new favorite
    const favorite_id = generateId('fav');
    const now = new Date().toISOString();
    await client.query('INSERT INTO favorites (favorite_id, user_id, product_id, created_at) VALUES ($1, $2, $3, $4)', [favorite_id, req.user.user_id, product_id, now]);
    const result = await client.query('SELECT * FROM favorites WHERE favorite_id = $1', [favorite_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to add favorite', error, 'FAVORITE_ADD_ERROR'));
  }
});

app.delete('/api/favorites/:favorite_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM favorites WHERE favorite_id = $1 AND user_id = $2', [req.params.favorite_id, req.user.user_id]);
    client.release();
    res.json({ success: true, message: 'Favorite removed successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to remove favorite', error, 'FAVORITE_DELETE_ERROR'));
  }
});

app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { is_read, notification_type } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const values: any[] = [req.user?.user_id];
    let idx = 2;
    if (is_read !== undefined) { query += ` AND is_read = $${idx++}`; values.push(String(is_read) === 'true'); }
    if (notification_type) { query += ` AND notification_type = $${idx++}`; values.push(String(notification_type)); }
    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(String(limit), String(offset));
    const result = await client.query(query, values);
    const countResult = await client.query(query.replace('SELECT *', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    client.release();
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch notifications', error, 'NOTIFICATIONS_FETCH_ERROR'));
  }
});

app.post('/api/notifications/:notification_id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const now = new Date().toISOString();
    await client.query('UPDATE notifications SET is_read = true, read_at = $1 WHERE notification_id = $2 AND user_id = $3', [now, req.params.notification_id, req.user.user_id]);
    client.release();
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to mark notification as read', error, 'NOTIFICATION_READ_ERROR'));
  }
});

app.post('/api/notifications/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const now = new Date().toISOString();
    await client.query('UPDATE notifications SET is_read = true, read_at = $1 WHERE user_id = $2 AND is_read = false', [now, req.user.user_id]);
    client.release();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to mark all notifications as read', error, 'NOTIFICATIONS_READ_ALL_ERROR'));
  }
});

app.get('/api/analytics/dashboard', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { date_range = 'today', start_date, end_date, location } = req.query;
    const now = new Date();
    let dateFrom, dateTo;
    if (date_range === 'today') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      dateTo = now.toISOString();
    } else if (date_range === 'this_week') {
      const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
      dateFrom = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()).toISOString();
      dateTo = now.toISOString();
    } else if (date_range === 'this_month') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      dateTo = now.toISOString();
    } else if (date_range === 'custom') {
      dateFrom = start_date;
      dateTo = end_date;
    } else {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      dateTo = now.toISOString();
    }
    let whereClause = 'WHERE created_at >= $1 AND created_at <= $2';
    const values = [dateFrom, dateTo];
    let idx = 3;
    if (location) { whereClause += ` AND location_name = $${idx++}`; values.push(location); }
    const orderCountResult = await client.query(`SELECT COUNT(*) FROM orders ${whereClause}`, values);
    const revenueResult = await client.query(`SELECT SUM(total_amount) FROM orders ${whereClause} AND payment_status = 'completed'`, values);
    const activeOrdersResult = await client.query("SELECT COUNT(*) FROM orders WHERE order_status IN ('paid_awaiting_confirmation', 'accepted_in_preparation', 'ready_for_collection', 'out_for_delivery')");
    const ordersByStatusResult = await client.query("SELECT order_status, COUNT(*) as count FROM orders WHERE order_status IN ('paid_awaiting_confirmation', 'accepted_in_preparation', 'ready_for_collection', 'out_for_delivery') GROUP BY order_status");
    const ordersByLocationResult = await client.query(`SELECT location_name, COUNT(*) as count FROM orders ${whereClause} GROUP BY location_name`, values);
    const topProductsResult = await client.query(`SELECT oi.product_name, SUM(oi.quantity) as quantity_sold, SUM(oi.subtotal) as revenue FROM order_items oi INNER JOIN orders o ON oi.order_id = o.order_id ${whereClause.replace('created_at', 'o.created_at')} GROUP BY oi.product_name ORDER BY quantity_sold DESC LIMIT 3`, values);
    client.release();
    const ordersByStatus = {};
    ordersByStatusResult.rows.forEach(r => { ordersByStatus[r.order_status] = parseInt(r.count); });
    const ordersByLocation = {};
    ordersByLocationResult.rows.forEach(r => { ordersByLocation[r.location_name] = parseInt(r.count); });
    res.json({ today_orders_count: parseInt(orderCountResult.rows[0].count), today_revenue: parseFloat(revenueResult.rows[0].sum || 0), active_orders_count: parseInt(activeOrdersResult.rows[0].count), orders_by_status: ordersByStatus, orders_by_location: ordersByLocation, top_products: topProductsResult.rows.map(p => ({ product_name: p.product_name, quantity_sold: parseInt(p.quantity_sold), revenue: parseFloat(p.revenue) })) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch dashboard metrics', error, 'DASHBOARD_FETCH_ERROR'));
  }
});

app.get('/api/analytics/reports', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { report_type, date_from, date_to, location, format = 'json' } = req.query;
    const values = [];
    let query = '';
    if (report_type === 'daily_sales') {
      query = 'SELECT * FROM analytics_snapshots WHERE snapshot_type = $1';
      values.push('daily_sales');
      if (date_from) { query += ' AND snapshot_date >= $2'; values.push(date_from); }
      if (date_to) { query += ' AND snapshot_date <= $3'; values.push(date_to); }
      if (location) { query += ' AND location_name = $4'; values.push(location); }
    }
    const result = await client.query(query, values);
    client.release();
    if (format === 'csv') {
      const csv = result.rows.map(r => Object.values(r).join(',')).join('\n');
      res.header('Content-Type', 'text/csv');
      return res.send(csv);
    }
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to generate report', error, 'REPORT_GENERATE_ERROR'));
  }
});

app.get('/api/settings', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { setting_group } = req.query;
    let query = 'SELECT * FROM system_settings';
    const values = [];
    if (setting_group) {
      query += ' WHERE setting_group = $1';
      values.push(setting_group);
    }
    const result = await client.query(query, values);
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch settings', error, 'SETTINGS_FETCH_ERROR'));
  }
});

app.put('/api/settings/:setting_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { setting_value } = req.body;
    const now = new Date().toISOString();
    await client.query('UPDATE system_settings SET setting_value = $1, updated_at = $2 WHERE setting_id = $3', [setting_value, now, req.params.setting_id]);
    const result = await client.query('SELECT * FROM system_settings WHERE setting_id = $1', [req.params.setting_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update setting', error, 'SETTING_UPDATE_ERROR'));
  }
});

// ============================================================================
// SOCIAL MEDIA LINKS ROUTES
// ============================================================================

// Get all social media links (public)
app.get('/api/social-links', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM social_media_links WHERE is_active = TRUE ORDER BY display_order ASC'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch social media links', error, 'SOCIAL_LINKS_FETCH_ERROR'));
  }
});

// Get all social media links including inactive (admin only)
app.get('/api/admin/social-links', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM social_media_links ORDER BY display_order ASC'
    );
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch social media links', error, 'SOCIAL_LINKS_FETCH_ERROR'));
  }
});

// Create new social media link (admin only)
app.post('/api/admin/social-links', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      platform_name,
      platform_url,
      icon_type,
      icon_name,
      icon_url,
      hover_color,
      display_order,
      is_active
    } = req.body;

    const link_id = generateId('sml');
    const now = new Date().toISOString();

    const result = await client.query(
      `INSERT INTO social_media_links (
        link_id, platform_name, platform_url, icon_type, icon_name, icon_url,
        hover_color, display_order, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        link_id,
        platform_name,
        platform_url,
        icon_type,
        icon_name || null,
        icon_url || null,
        hover_color || '#3b82f6',
        display_order || 0,
        is_active !== undefined ? is_active : true,
        now,
        now
      ]
    );

    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create social media link', error, 'SOCIAL_LINK_CREATE_ERROR'));
  }
});

// Update social media link (admin only)
app.put('/api/admin/social-links/:link_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      platform_name,
      platform_url,
      icon_type,
      icon_name,
      icon_url,
      hover_color,
      display_order,
      is_active
    } = req.body;

    const now = new Date().toISOString();

    const result = await client.query(
      `UPDATE social_media_links SET
        platform_name = COALESCE($1, platform_name),
        platform_url = COALESCE($2, platform_url),
        icon_type = COALESCE($3, icon_type),
        icon_name = $4,
        icon_url = $5,
        hover_color = COALESCE($6, hover_color),
        display_order = COALESCE($7, display_order),
        is_active = COALESCE($8, is_active),
        updated_at = $9
      WHERE link_id = $10
      RETURNING *`,
      [
        platform_name,
        platform_url,
        icon_type,
        icon_name,
        icon_url,
        hover_color,
        display_order,
        is_active,
        now,
        req.params.link_id
      ]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Social media link not found', null, 'SOCIAL_LINK_NOT_FOUND'));
    }

    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update social media link', error, 'SOCIAL_LINK_UPDATE_ERROR'));
  }
});

// Delete social media link (admin only)
app.delete('/api/admin/social-links/:link_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM social_media_links WHERE link_id = $1 RETURNING *',
      [req.params.link_id]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Social media link not found', null, 'SOCIAL_LINK_NOT_FOUND'));
    }

    client.release();
    res.json({ success: true, message: 'Social media link deleted successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete social media link', error, 'SOCIAL_LINK_DELETE_ERROR'));
  }
});

// Configure multer for social media icon uploads
const socialIconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `social-icon-${uniqueSuffix}${ext}`);
  }
});

const socialIconUpload = multer({
  storage: socialIconStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG images are allowed.'));
    }
  }
});

// Upload social media icon (admin only)
app.post('/api/admin/upload-social-icon', authenticateToken, requireRole(['admin']), socialIconUpload.single('icon'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse('No file uploaded', null, 'NO_FILE_UPLOADED'));
    }

    const fileUrl = `/uploads/social-icons/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Icon uploaded successfully',
      icon_url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to upload icon', error, 'ICON_UPLOAD_ERROR'));
  }
});

// Configure multer for event image uploads
const eventImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `event-${uniqueSuffix}${ext}`);
  }
});

const eventImageUpload = multer({
  storage: eventImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for event images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'));
    }
  }
});

// Upload event image (admin only)
app.post('/api/admin/upload-event-image', authenticateToken, requireRole(['admin']), eventImageUpload.single('image'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse('No file uploaded', null, 'NO_FILE_UPLOADED'));
    }

    const fileUrl = `/uploads/event-images/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Event image uploaded successfully',
      image_url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to upload event image', error, 'EVENT_IMAGE_UPLOAD_ERROR'));
  }
});

// ============================================================================
// ABOUT PAGE CONTENT ROUTES
// ============================================================================

// Get about page content (public)
app.get('/api/about-page', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    // Get main content
    const contentResult = await client.query(
      'SELECT * FROM about_page_content ORDER BY created_at DESC LIMIT 1'
    );
    
    if (contentResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('About page content not found', null, 'ABOUT_PAGE_NOT_FOUND'));
    }
    
    const content = contentResult.rows[0];
    
    // Get milestones
    const milestonesResult = await client.query(
      'SELECT * FROM about_page_milestones WHERE content_id = $1 ORDER BY display_order ASC',
      [content.content_id]
    );
    
    // Get values
    const valuesResult = await client.query(
      'SELECT * FROM about_page_values WHERE content_id = $1 ORDER BY display_order ASC',
      [content.content_id]
    );
    
    // Get team members
    const teamResult = await client.query(
      'SELECT * FROM about_page_team_members WHERE content_id = $1 AND is_active = TRUE ORDER BY display_order ASC',
      [content.content_id]
    );
    
    client.release();
    
    res.json({
      ...content,
      milestones: milestonesResult.rows,
      values: valuesResult.rows,
      team_members: teamResult.rows
    });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch about page content', error, 'ABOUT_PAGE_FETCH_ERROR'));
  }
});

// Get about page content for admin (includes inactive team members)
app.get('/api/admin/about-page', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    // Get main content
    const contentResult = await client.query(
      'SELECT * FROM about_page_content ORDER BY created_at DESC LIMIT 1'
    );
    
    if (contentResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('About page content not found', null, 'ABOUT_PAGE_NOT_FOUND'));
    }
    
    const content = contentResult.rows[0];
    
    // Get milestones
    const milestonesResult = await client.query(
      'SELECT * FROM about_page_milestones WHERE content_id = $1 ORDER BY display_order ASC',
      [content.content_id]
    );
    
    // Get values
    const valuesResult = await client.query(
      'SELECT * FROM about_page_values WHERE content_id = $1 ORDER BY display_order ASC',
      [content.content_id]
    );
    
    // Get all team members (including inactive)
    const teamResult = await client.query(
      'SELECT * FROM about_page_team_members WHERE content_id = $1 ORDER BY display_order ASC',
      [content.content_id]
    );
    
    client.release();
    
    res.json({
      ...content,
      milestones: milestonesResult.rows,
      values: valuesResult.rows,
      team_members: teamResult.rows
    });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch about page content', error, 'ABOUT_PAGE_FETCH_ERROR'));
  }
});

// Update main about page content (admin only)
app.put('/api/admin/about-page/:content_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { hero_image_url, page_title, story_content } = req.body;
    const now = new Date().toISOString();
    
    const result = await client.query(
      `UPDATE about_page_content 
       SET hero_image_url = $1, page_title = $2, story_content = $3, updated_at = $4 
       WHERE content_id = $5 
       RETURNING *`,
      [hero_image_url, page_title, story_content, now, req.params.content_id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('About page content not found', null, 'ABOUT_PAGE_NOT_FOUND'));
    }
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update about page content', error, 'ABOUT_PAGE_UPDATE_ERROR'));
  }
});

// Create milestone (admin only)
app.post('/api/admin/about-page/milestones', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { content_id, year, title, description, display_order } = req.body;
    const milestone_id = generateId('mlst');
    const now = new Date().toISOString();
    
    const result = await client.query(
      `INSERT INTO about_page_milestones 
       (milestone_id, content_id, year, title, description, display_order, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [milestone_id, content_id, year, title, description, display_order || 0, now, now]
    );
    
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create milestone', error, 'MILESTONE_CREATE_ERROR'));
  }
});

// Update milestone (admin only)
app.put('/api/admin/about-page/milestones/:milestone_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { year, title, description, display_order } = req.body;
    const now = new Date().toISOString();
    
    const result = await client.query(
      `UPDATE about_page_milestones 
       SET year = $1, title = $2, description = $3, display_order = $4, updated_at = $5 
       WHERE milestone_id = $6 
       RETURNING *`,
      [year, title, description, display_order, now, req.params.milestone_id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Milestone not found', null, 'MILESTONE_NOT_FOUND'));
    }
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update milestone', error, 'MILESTONE_UPDATE_ERROR'));
  }
});

// Delete milestone (admin only)
app.delete('/api/admin/about-page/milestones/:milestone_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM about_page_milestones WHERE milestone_id = $1 RETURNING *',
      [req.params.milestone_id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Milestone not found', null, 'MILESTONE_NOT_FOUND'));
    }
    
    client.release();
    res.json({ success: true, message: 'Milestone deleted successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete milestone', error, 'MILESTONE_DELETE_ERROR'));
  }
});

// Create value (admin only)
app.post('/api/admin/about-page/values', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { content_id, icon_name, value_name, description, display_order } = req.body;
    const value_id = generateId('val');
    const now = new Date().toISOString();
    
    const result = await client.query(
      `INSERT INTO about_page_values 
       (value_id, content_id, icon_name, value_name, description, display_order, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [value_id, content_id, icon_name, value_name, description, display_order || 0, now, now]
    );
    
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create value', error, 'VALUE_CREATE_ERROR'));
  }
});

// Update value (admin only)
app.put('/api/admin/about-page/values/:value_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { icon_name, value_name, description, display_order } = req.body;
    const now = new Date().toISOString();
    
    const result = await client.query(
      `UPDATE about_page_values 
       SET icon_name = $1, value_name = $2, description = $3, display_order = $4, updated_at = $5 
       WHERE value_id = $6 
       RETURNING *`,
      [icon_name, value_name, description, display_order, now, req.params.value_id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Value not found', null, 'VALUE_NOT_FOUND'));
    }
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update value', error, 'VALUE_UPDATE_ERROR'));
  }
});

// Delete value (admin only)
app.delete('/api/admin/about-page/values/:value_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM about_page_values WHERE value_id = $1 RETURNING *',
      [req.params.value_id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Value not found', null, 'VALUE_NOT_FOUND'));
    }
    
    client.release();
    res.json({ success: true, message: 'Value deleted successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete value', error, 'VALUE_DELETE_ERROR'));
  }
});

// Create team member (admin only)
app.post('/api/admin/about-page/team', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { content_id, photo_url, name, role, bio, display_order, is_active } = req.body;
    const member_id = generateId('team');
    const now = new Date().toISOString();
    
    const result = await client.query(
      `INSERT INTO about_page_team_members 
       (member_id, content_id, photo_url, name, role, bio, display_order, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [member_id, content_id, photo_url, name, role, bio, display_order || 0, is_active !== false, now, now]
    );
    
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create team member', error, 'TEAM_MEMBER_CREATE_ERROR'));
  }
});

// Update team member (admin only)
app.put('/api/admin/about-page/team/:member_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { photo_url, name, role, bio, display_order, is_active } = req.body;
    const now = new Date().toISOString();
    
    const result = await client.query(
      `UPDATE about_page_team_members 
       SET photo_url = $1, name = $2, role = $3, bio = $4, display_order = $5, is_active = $6, updated_at = $7 
       WHERE member_id = $8 
       RETURNING *`,
      [photo_url, name, role, bio, display_order, is_active, now, req.params.member_id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Team member not found', null, 'TEAM_MEMBER_NOT_FOUND'));
    }
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update team member', error, 'TEAM_MEMBER_UPDATE_ERROR'));
  }
});

// Delete team member (admin only)
app.delete('/api/admin/about-page/team/:member_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM about_page_team_members WHERE member_id = $1 RETURNING *',
      [req.params.member_id]
    );
    
    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Team member not found', null, 'TEAM_MEMBER_NOT_FOUND'));
    }
    
    client.release();
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to delete team member', error, 'TEAM_MEMBER_DELETE_ERROR'));
  }
});

app.get('/api/users', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { query, user_type, account_status, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    let sqlQuery = 'SELECT user_id, email, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, last_login_at, created_at, updated_at FROM users WHERE 1=1';
    const values = [];
    let idx = 1;
    if (query) { sqlQuery += ` AND (first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR email ILIKE $${idx})`; values.push(`%${query}%`); idx++; }
    if (user_type) { sqlQuery += ` AND user_type = $${idx++}`; values.push(user_type); }
    if (account_status) { sqlQuery += ` AND account_status = $${idx++}`; values.push(account_status); }
    const orderMap = { created_at: 'created_at', email: 'email', last_login_at: 'last_login_at' };
    sqlQuery += ` ORDER BY ${orderMap[String(sort_by)] || 'created_at'} ${String(sort_order).toUpperCase()} LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await client.query(sqlQuery, values);
    const countResult = await client.query(sqlQuery.replace('SELECT user_id, email, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, last_login_at, created_at, updated_at', 'SELECT COUNT(*)').split('ORDER BY')[0], values.slice(0, -2));
    client.release();
    res.json({ data: result.rows.map(u => ({ ...u, loyalty_points_balance: parseFloat(u.loyalty_points_balance) })), total: parseInt(countResult.rows[0].count), limit, offset, has_more: (offset + limit) < parseInt(countResult.rows[0].count) });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch users', error, 'USERS_FETCH_ERROR'));
  }
});

app.post('/api/users', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { email, password, first_name, last_name, phone_number, user_type = 'customer', marketing_opt_in = false } = req.body;
    const existingUser = await client.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json(createErrorResponse('Email already exists', null, 'EMAIL_EXISTS'));
    }
    const user_id = generateId('usr');
    const now = new Date().toISOString();
    await client.query('INSERT INTO users (user_id, email, password_hash, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, failed_login_attempts, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [user_id, email, password, first_name, last_name, phone_number, user_type, 'active', marketing_opt_in, 0, 0, now, now]);
    const result = await client.query('SELECT user_id, email, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, created_at, updated_at FROM users WHERE user_id = $1', [user_id]);
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to create user', error, 'USER_CREATE_ERROR'));
  }
});

app.get('/api/users/:user_id', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT user_id, email, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, created_at, updated_at FROM users WHERE user_id = $1', [req.params.user_id]);
    client.release();
    if (result.rows.length === 0) return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch user', error, 'USER_FETCH_ERROR'));
  }
});

app.put('/api/users/:user_id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { email, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in } = req.body;
    
    // Check if user exists
    const existingUser = await client.query('SELECT user_id FROM users WHERE user_id = $1', [req.params.user_id]);
    if (existingUser.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let idx = 1;
    
    if (first_name !== undefined) { updates.push(`first_name = $${idx++}`); values.push(first_name); }
    if (last_name !== undefined) { updates.push(`last_name = $${idx++}`); values.push(last_name); }
    if (phone_number !== undefined) { updates.push(`phone_number = $${idx++}`); values.push(phone_number); }
    if (user_type !== undefined) { updates.push(`user_type = $${idx++}`); values.push(user_type); }
    if (account_status !== undefined) { updates.push(`account_status = $${idx++}`); values.push(account_status); }
    if (marketing_opt_in !== undefined) { updates.push(`marketing_opt_in = $${idx++}`); values.push(marketing_opt_in); }
    
    // Check if email is being changed
    if (email && email !== existingUser.rows[0].email) {
      const emailCheck = await client.query('SELECT user_id FROM users WHERE email = $1 AND user_id != $2', [email, req.params.user_id]);
      if (emailCheck.rows.length > 0) {
        client.release();
        return res.status(400).json(createErrorResponse('Email already exists', null, 'EMAIL_EXISTS'));
      }
      updates.push(`email = $${idx++}`);
      values.push(email);
    }
    
    if (updates.length === 0) {
      client.release();
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATES'));
    }
    
    const now = new Date().toISOString();
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.user_id);
    
    await client.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = $${idx}`, values);
    
    // Return updated user data
    const result = await client.query('SELECT user_id, email, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, created_at, updated_at FROM users WHERE user_id = $1', [req.params.user_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to update user', error, 'USER_UPDATE_ERROR'));
  }
});

app.post('/api/auth/unlock-account', async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json(createErrorResponse('Email required', null, 'MISSING_EMAIL'));
    
    const userResult = await client.query('SELECT user_id, email, failed_login_attempts, locked_until FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
    }
    
    const user = userResult.rows[0];
    await client.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE user_id = $1', [user.user_id]);
    
    client.release();
    res.json({ success: true, message: 'Account unlocked successfully', email: user.email });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to unlock account', error, 'UNLOCK_ERROR'));
  }
});

// ============================================================================
// UNIFIED FEEDBACK SYSTEM ENDPOINTS
// ============================================================================

// Submit feedback (customers, staff, managers)
app.post('/api/unified-feedback', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { location, order_id, category, subject, message, priority = 'Low' } = req.body;
    
    if (!location || !category || !subject || !message) {
      client.release();
      return res.status(400).json(createErrorResponse('Location, category, subject, and message are required', null, 'MISSING_FIELDS'));
    }
    
    const feedback_id = generateId('feedback');
    const now = new Date().toISOString();
    
    await client.query(
      'INSERT INTO unified_feedback (feedback_id, created_by_user_id, created_by_role, location, order_id, category, subject, message, priority, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [feedback_id, req.user.user_id, req.user.user_type, location, order_id, category, subject, message, priority, 'Open', now, now]
    );
    
    // Create timeline entry
    const timeline_id = generateId('timeline');
    await client.query(
      'INSERT INTO feedback_timeline (timeline_id, feedback_id, changed_by_user_id, change_type, new_value, notes, changed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [timeline_id, feedback_id, req.user.user_id, 'status_change', 'Open', 'Feedback created', now]
    );
    
    const result = await client.query('SELECT * FROM unified_feedback WHERE feedback_id = $1', [feedback_id]);
    client.release();
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to submit feedback', error, 'FEEDBACK_SUBMIT_ERROR'));
  }
});

// Get feedback list (filtered by user role and permissions)
app.get('/api/unified-feedback', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const { location, category, priority, status, assigned_to, date_from, date_to, role } = req.query;
    const limit = parseInt(String(req.query.limit || 20));
    const offset = parseInt(String(req.query.offset || 0));
    
    let query = 'SELECT uf.*, u1.first_name as created_by_first_name, u1.last_name as created_by_last_name, u1.email as created_by_email, u1.account_status as created_by_status, u2.first_name as assigned_to_first_name, u2.last_name as assigned_to_last_name FROM unified_feedback uf LEFT JOIN users u1 ON uf.created_by_user_id = u1.user_id LEFT JOIN users u2 ON uf.assigned_to_user_id = u2.user_id WHERE 1=1';
    const values = [];
    let idx = 1;
    
    // Role-based filtering
    if (req.user.user_type === 'customer') {
      // Customers can only see their own feedback
      query += ` AND uf.created_by_user_id = $${idx++}`;
      values.push(req.user.user_id);
    } else if (req.user.user_type === 'staff' || req.user.user_type === 'manager') {
      // Staff/managers can see feedback they created OR feedback assigned to them
      query += ` AND (uf.created_by_user_id = $${idx++} OR uf.assigned_to_user_id = $${idx++})`;
      values.push(req.user.user_id, req.user.user_id);
    }
    // Admin can see all feedback (no additional filter)
    
    // Additional filters
    if (location) { query += ` AND uf.location = $${idx++}`; values.push(location); }
    if (category) { query += ` AND uf.category = $${idx++}`; values.push(category); }
    if (priority) { query += ` AND uf.priority = $${idx++}`; values.push(priority); }
    if (status) { query += ` AND uf.status = $${idx++}`; values.push(status); }
    if (assigned_to) { query += ` AND uf.assigned_to_user_id = $${idx++}`; values.push(assigned_to); }
    if (role && req.user.user_type === 'admin') { query += ` AND uf.created_by_role = $${idx++}`; values.push(role); }
    if (date_from) { query += ` AND uf.created_at >= $${idx++}`; values.push(date_from); }
    if (date_to) { query += ` AND uf.created_at <= $${idx++}`; values.push(date_to); }
    
    query += ` ORDER BY uf.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    
    const result = await client.query(query, values);
    
    // Get count for pagination
    const countQuery = query.replace('SELECT uf.*, u1.first_name as created_by_first_name, u1.last_name as created_by_last_name, u1.email as created_by_email, u1.account_status as created_by_status, u2.first_name as assigned_to_first_name, u2.last_name as assigned_to_last_name FROM unified_feedback uf LEFT JOIN users u1 ON uf.created_by_user_id = u1.user_id LEFT JOIN users u2 ON uf.assigned_to_user_id = u2.user_id', 'SELECT COUNT(*)').split('ORDER BY')[0];
    const countResult = await client.query(countQuery, values.slice(0, -2));
    
    // Filter out internal_notes for customers
    const filteredRows = result.rows.map(row => {
      if (req.user.user_type === 'customer') {
        const { internal_notes, assigned_to_user_id, assigned_to_first_name, assigned_to_last_name, ...publicData } = row;
        return publicData;
      }
      return row;
    });
    
    client.release();
    res.json({ 
      data: filteredRows, 
      total: parseInt(countResult.rows[0].count), 
      limit, 
      offset, 
      has_more: (offset + limit) < parseInt(countResult.rows[0].count) 
    });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch feedback', error, 'FEEDBACK_FETCH_ERROR'));
  }
});

// Get single feedback item with timeline
app.get('/api/unified-feedback/:feedback_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const feedbackResult = await client.query(
      'SELECT uf.*, u1.first_name as created_by_first_name, u1.last_name as created_by_last_name, u1.email as created_by_email, u1.account_status as created_by_status, u2.first_name as assigned_to_first_name, u2.last_name as assigned_to_last_name FROM unified_feedback uf LEFT JOIN users u1 ON uf.created_by_user_id = u1.user_id LEFT JOIN users u2 ON uf.assigned_to_user_id = u2.user_id WHERE uf.feedback_id = $1',
      [req.params.feedback_id]
    );
    
    if (feedbackResult.rows.length === 0) {
      client.release();
      return res.status(404).json(createErrorResponse('Feedback not found', null, 'FEEDBACK_NOT_FOUND'));
    }
    
    const feedback = feedbackResult.rows[0];
    
    // Permission check
    if (req.user.user_type === 'customer' && feedback.created_by_user_id !== req.user.user_id) {
      client.release();
      return res.status(403).json(createErrorResponse('Cannot access this feedback', null, 'FORBIDDEN'));
    } else if ((req.user.user_type === 'staff' || req.user.user_type === 'manager') && 
               feedback.created_by_user_id !== req.user.user_id && 
               feedback.assigned_to_user_id !== req.user.user_id) {
      client.release();
      return res.status(403).json(createErrorResponse('Cannot access this feedback', null, 'FORBIDDEN'));
    }
    
    // Get timeline
    const timelineResult = await client.query(
      'SELECT ft.*, u.first_name, u.last_name FROM feedback_timeline ft LEFT JOIN users u ON ft.changed_by_user_id = u.user_id WHERE ft.feedback_id = $1 ORDER BY ft.changed_at ASC',
      [req.params.feedback_id]
    );
    
    // Get order details if present
    let orderDetails = null;
    if (feedback.order_id) {
      const orderResult = await client.query(
        'SELECT order_id, order_number, customer_name, location_name, total_amount, created_at FROM orders WHERE order_id = $1',
        [feedback.order_id]
      );
      if (orderResult.rows.length > 0) {
        orderDetails = orderResult.rows[0];
      }
    }
    
    // Filter sensitive data for customers
    if (req.user.user_type === 'customer') {
      const { internal_notes, assigned_to_user_id, assigned_to_first_name, assigned_to_last_name, ...publicData } = feedback;
      client.release();
      return res.json({ 
        ...publicData, 
        timeline: timelineResult.rows.filter(t => t.change_type !== 'note_added'),
        order: orderDetails
      });
    }
    
    client.release();
    res.json({ ...feedback, timeline: timelineResult.rows, order: orderDetails });
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch feedback', error, 'FEEDBACK_FETCH_ERROR'));
  }
});

// Update feedback (admin and assigned staff/managers)
app.put('/api/unified-feedback/:feedback_id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { priority, status, assigned_to_user_id, internal_notes, public_response } = req.body;
    
    // Get current feedback
    const currentResult = await client.query('SELECT * FROM unified_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json(createErrorResponse('Feedback not found', null, 'FEEDBACK_NOT_FOUND'));
    }
    
    const current = currentResult.rows[0];
    
    // Permission check - only admin can update any feedback, managers can update feedback assigned to them if changing to Resolved/Closed
    if (req.user.user_type !== 'admin') {
      if (req.user.user_type === 'manager' && current.assigned_to_user_id === req.user.user_id) {
        // Managers can only update status to Resolved or Closed and add notes
        if ((status && !['Resolved', 'Closed'].includes(status)) || priority || assigned_to_user_id !== undefined) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(403).json(createErrorResponse('Managers can only mark feedback as Resolved/Closed', null, 'FORBIDDEN'));
        }
      } else if (req.user.user_type === 'staff' && current.assigned_to_user_id === req.user.user_id) {
        // Staff can only add notes
        if (status || priority || assigned_to_user_id !== undefined || public_response) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(403).json(createErrorResponse('Staff can only add internal notes', null, 'FORBIDDEN'));
        }
      } else {
        await client.query('ROLLBACK');
        client.release();
        return res.status(403).json(createErrorResponse('Insufficient permissions', null, 'FORBIDDEN'));
      }
    }
    
    const updates = [];
    const values = [];
    let idx = 1;
    const now = new Date().toISOString();
    
    // Track changes for timeline
    const timelineEntries = [];
    
    if (priority && priority !== current.priority) {
      updates.push(`priority = $${idx++}`);
      values.push(priority);
      timelineEntries.push({
        type: 'priority_change',
        old: current.priority,
        new: priority
      });
    }
    
    if (status && status !== current.status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
      if (status === 'Resolved' || status === 'Closed') {
        updates.push(`resolved_at = $${idx++}`);
        values.push(now);
      }
      timelineEntries.push({
        type: 'status_change',
        old: current.status,
        new: status
      });
    }
    
    if (assigned_to_user_id !== undefined && assigned_to_user_id !== current.assigned_to_user_id) {
      updates.push(`assigned_to_user_id = $${idx++}`);
      values.push(assigned_to_user_id);
      timelineEntries.push({
        type: 'assignment',
        old: current.assigned_to_user_id,
        new: assigned_to_user_id
      });
    }
    
    if (internal_notes !== undefined) {
      updates.push(`internal_notes = $${idx++}`);
      values.push(internal_notes);
      timelineEntries.push({
        type: 'note_added',
        new: 'Internal note added'
      });
    }
    
    if (public_response !== undefined) {
      updates.push(`public_response = $${idx++}`);
      values.push(public_response);
      timelineEntries.push({
        type: 'response_added',
        new: 'Public response added'
      });
    }
    
    if (updates.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATES'));
    }
    
    updates.push(`updated_at = $${idx++}`);
    values.push(now);
    values.push(req.params.feedback_id);
    
    await client.query(`UPDATE unified_feedback SET ${updates.join(', ')} WHERE feedback_id = $${idx}`, values);
    
    // Add timeline entries
    for (const entry of timelineEntries) {
      const timeline_id = generateId('timeline');
      await client.query(
        'INSERT INTO feedback_timeline (timeline_id, feedback_id, changed_by_user_id, change_type, old_value, new_value, changed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [timeline_id, req.params.feedback_id, req.user.user_id, entry.type, entry.old || null, entry.new || null, now]
      );
    }
    
    await client.query('COMMIT');
    
    const result = await client.query('SELECT * FROM unified_feedback WHERE feedback_id = $1', [req.params.feedback_id]);
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    res.status(500).json(createErrorResponse('Failed to update feedback', error, 'FEEDBACK_UPDATE_ERROR'));
  }
});

// Get my orders (for customer feedback form)
app.get('/api/my-orders-for-feedback', authenticateToken, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    if (req.user.user_type !== 'customer') {
      client.release();
      return res.status(403).json(createErrorResponse('Only customers can access this endpoint', null, 'FORBIDDEN'));
    }
    
    const result = await client.query(
      'SELECT order_id, order_number, location_name, total_amount, created_at FROM orders WHERE user_id = $1 AND order_status IN (\'completed\', \'delivered\', \'collected\') ORDER BY created_at DESC LIMIT 10',
      [req.user.user_id]
    );
    
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch orders', error, 'ORDERS_FETCH_ERROR'));
  }
});

// Get internal users (staff/managers) for assignment (admin only)
app.get('/api/internal-users', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT user_id, email, first_name, last_name, user_type FROM users WHERE user_type IN (\'staff\', \'manager\') AND account_status = \'active\' ORDER BY first_name, last_name'
    );
    
    client.release();
    res.json(result.rows);
  } catch (error) {
    client.release();
    res.status(500).json(createErrorResponse('Failed to fetch internal users', error, 'USERS_FETCH_ERROR'));
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.use(async (socket: AuthSocket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const client = await pool.connect();
    const sessionResult = await client.query('SELECT user_id FROM sessions WHERE token = $1 AND expires_at >= $2', [token, new Date().toISOString()]);
    if (sessionResult.rows.length === 0) {
      client.release();
      return next(new Error('Invalid token'));
    }
    const userResult = await client.query('SELECT user_id, email, user_type FROM users WHERE user_id = $1', [sessionResult.rows[0].user_id]);
    client.release();
    socket.user = userResult.rows[0];
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', async (socket: AuthSocket) => {
  console.log('User connected:', socket.user?.email);
  if (socket.user) {
    socket.join(`user_${socket.user.user_id}`);
    if (socket.user.user_type === 'admin') {
      socket.join('admin_dashboard');
    }
    if (socket.user.user_type === 'staff' || socket.user.user_type === 'admin') {
      const client = await pool.connect();
      const assignmentsResult = await client.query('SELECT location_name FROM staff_assignments WHERE user_id = $1', [socket.user.user_id]);
      client.release();
      assignmentsResult.rows.forEach(assignment => {
        socket.join(`location_${assignment.location_name}_staff`);
      });
      if (socket.user.user_type === 'admin') {
        const locations = ['Blanchardstown', 'Tallaght', 'Glasnevin'];
        locations.forEach(loc => socket.join(`location_${loc}_staff`));
      }
    }
  }
  socket.on('join_order_room', (data) => {
    if (data.order_id) socket.join(`order_${data.order_id}`);
  });
  socket.on('leave_order_room', (data) => {
    if (data.order_id) socket.leave(`order_${data.order_id}`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user?.email);
  });
});

setInterval(async () => {
  try {
    const client = await pool.connect();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const ordersCountResult = await client.query('SELECT COUNT(*) FROM orders WHERE created_at >= $1', [todayStart]);
    const revenueResult = await client.query("SELECT SUM(total_amount) FROM orders WHERE created_at >= $1 AND payment_status = 'completed'", [todayStart]);
    const ordersByStatusResult = await client.query("SELECT order_status, COUNT(*) as count FROM orders WHERE order_status IN ('paid_awaiting_confirmation', 'accepted_in_preparation', 'ready_for_collection', 'out_for_delivery') GROUP BY order_status");
    const lateOrdersResult = await client.query("SELECT order_id, order_number, created_at, location_name FROM orders WHERE order_status = 'paid_awaiting_confirmation' AND created_at < $1", [new Date(Date.now() - 10 * 60 * 1000).toISOString()]);
    client.release();
    const ordersByStatus = {};
    ordersByStatusResult.rows.forEach(r => { ordersByStatus[r.order_status] = parseInt(r.count); });
    io.to('admin_dashboard').emit('analytics_update', { event_type: 'analytics_update', timestamp: new Date().toISOString(), today_orders_count: parseInt(ordersCountResult.rows[0].count), today_revenue: parseFloat(revenueResult.rows[0].sum || 0), orders_by_status: ordersByStatus, late_orders: lateOrdersResult.rows });
  } catch (error) {
    console.error('Analytics update error:', error);
  }
}, 60000);

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

export { app, pool };

httpServer.listen(Number(actualPort), '0.0.0.0', () => {
  console.log(`Server running on port ${actualPort} and listening on 0.0.0.0`);
});