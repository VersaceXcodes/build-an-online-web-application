-- ============================================
-- DROP EXISTING TABLES (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS analytics_snapshots CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS stall_events CASCADE;
DROP TABLE IF EXISTS drop_of_the_month CASCADE;
DROP TABLE IF EXISTS promo_code_usage CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS staff_lesson_notes CASCADE;
DROP TABLE IF EXISTS staff_lesson_completion CASCADE;
DROP TABLE IF EXISTS staff_course_progress CASCADE;
DROP TABLE IF EXISTS training_lessons CASCADE;
DROP TABLE IF EXISTS training_courses CASCADE;
DROP TABLE IF EXISTS inventory_alerts CASCADE;
DROP TABLE IF EXISTS staff_feedback_responses CASCADE;
DROP TABLE IF EXISTS staff_feedback CASCADE;
DROP TABLE IF EXISTS feedback_internal_notes CASCADE;
DROP TABLE IF EXISTS customer_feedback CASCADE;
DROP TABLE IF EXISTS loyalty_points_transactions CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_locations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS staff_assignments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- USERS TABLE
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'customer',
    account_status TEXT NOT NULL DEFAULT 'active',
    marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
    loyalty_points_balance NUMERIC NOT NULL DEFAULT 0,
    failed_login_attempts NUMERIC NOT NULL DEFAULT 0,
    locked_until TEXT,
    last_login_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- STAFF ASSIGNMENTS TABLE
CREATE TABLE staff_assignments (
    assignment_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    assigned_at TEXT NOT NULL
);

-- LOCATIONS TABLE
CREATE TABLE locations (
    location_id TEXT PRIMARY KEY,
    location_name TEXT UNIQUE NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    is_collection_enabled BOOLEAN NOT NULL DEFAULT true,
    is_delivery_enabled BOOLEAN NOT NULL DEFAULT true,
    delivery_radius_km NUMERIC,
    delivery_fee NUMERIC,
    free_delivery_threshold NUMERIC,
    estimated_delivery_time_minutes NUMERIC,
    estimated_preparation_time_minutes NUMERIC NOT NULL DEFAULT 20,
    allow_scheduled_pickups BOOLEAN NOT NULL DEFAULT true,
    just_eat_url TEXT,
    deliveroo_url TEXT,
    opening_hours TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- PRODUCTS TABLE
CREATE TABLE products (
    product_id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    compare_at_price NUMERIC,
    primary_image_url TEXT NOT NULL,
    additional_images TEXT,
    availability_status TEXT NOT NULL DEFAULT 'in_stock',
    stock_quantity NUMERIC,
    low_stock_threshold NUMERIC,
    dietary_tags TEXT,
    custom_tags TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    available_for_corporate BOOLEAN NOT NULL DEFAULT true,
    available_from_date TEXT,
    available_until_date TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- PRODUCT LOCATIONS TABLE
CREATE TABLE product_locations (
    assignment_id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    assigned_at TEXT NOT NULL
);

-- ORDERS TABLE
CREATE TABLE orders (
    order_id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    location_name TEXT NOT NULL,
    order_type TEXT NOT NULL DEFAULT 'standard',
    fulfillment_method TEXT NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'pending_payment',
    delivery_address_line1 TEXT,
    delivery_address_line2 TEXT,
    delivery_city TEXT,
    delivery_postal_code TEXT,
    delivery_phone TEXT,
    delivery_instructions TEXT,
    special_instructions TEXT,
    scheduled_for TEXT,
    estimated_ready_time TEXT,
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    loyalty_points_used NUMERIC NOT NULL DEFAULT 0,
    loyalty_points_earned NUMERIC NOT NULL DEFAULT 0,
    promo_code TEXT,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_transaction_id TEXT,
    card_last_four TEXT,
    event_date TEXT,
    guest_count NUMERIC,
    event_type TEXT,
    company_name TEXT,
    collection_code TEXT,
    feedback_submitted BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT
);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
    item_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL,
    product_specific_notes TEXT
);

-- ORDER STATUS HISTORY TABLE
CREATE TABLE order_status_history (
    history_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by_user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    notes TEXT,
    changed_at TEXT NOT NULL
);

-- ADDRESSES TABLE
CREATE TABLE addresses (
    address_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    address_label TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    delivery_phone TEXT,
    delivery_instructions TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- LOYALTY POINTS TRANSACTIONS TABLE
CREATE TABLE loyalty_points_transactions (
    transaction_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    points_change NUMERIC NOT NULL,
    balance_after NUMERIC NOT NULL,
    order_id TEXT REFERENCES orders(order_id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- CUSTOMER FEEDBACK TABLE
CREATE TABLE customer_feedback (
    feedback_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    overall_rating NUMERIC NOT NULL,
    product_rating NUMERIC NOT NULL,
    fulfillment_rating NUMERIC NOT NULL,
    product_comment TEXT,
    fulfillment_comment TEXT,
    overall_comment TEXT,
    quick_tags TEXT,
    allow_contact BOOLEAN NOT NULL DEFAULT false,
    reviewed_status TEXT NOT NULL DEFAULT 'pending_review',
    reviewed_by_user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    reviewed_at TEXT,
    is_hidden_from_staff BOOLEAN NOT NULL DEFAULT false,
    original_feedback_id TEXT REFERENCES customer_feedback(feedback_id) ON DELETE SET NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- FEEDBACK INTERNAL NOTES TABLE
CREATE TABLE feedback_internal_notes (
    note_id TEXT PRIMARY KEY,
    feedback_id TEXT NOT NULL REFERENCES customer_feedback(feedback_id) ON DELETE CASCADE,
    created_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- STAFF FEEDBACK TABLE
CREATE TABLE staff_feedback (
    feedback_id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    submitted_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    feedback_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    attachment_urls TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending_review',
    assigned_to_user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- STAFF FEEDBACK RESPONSES TABLE
CREATE TABLE staff_feedback_responses (
    response_id TEXT PRIMARY KEY,
    feedback_id TEXT NOT NULL REFERENCES staff_feedback(feedback_id) ON DELETE CASCADE,
    responded_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    is_internal_note BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL
);

-- INVENTORY ALERTS TABLE
CREATE TABLE inventory_alerts (
    alert_id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,
    submitted_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    item_name TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    current_quantity NUMERIC,
    notes TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    acknowledged_by_user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    acknowledged_at TEXT,
    resolution_notes TEXT,
    resolved_by_user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    resolved_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- TRAINING COURSES TABLE
CREATE TABLE training_courses (
    course_id TEXT PRIMARY KEY,
    course_title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT,
    cover_image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    is_required BOOLEAN NOT NULL DEFAULT false,
    estimated_duration_minutes NUMERIC,
    prerequisite_course_ids TEXT,
    created_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- TRAINING LESSONS TABLE
CREATE TABLE training_lessons (
    lesson_id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES training_courses(course_id) ON DELETE CASCADE,
    lesson_title TEXT NOT NULL,
    lesson_type TEXT NOT NULL,
    content_url TEXT,
    content_text TEXT,
    duration_minutes NUMERIC,
    additional_notes TEXT,
    lesson_order NUMERIC NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- STAFF COURSE PROGRESS TABLE
CREATE TABLE staff_course_progress (
    progress_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES training_courses(course_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started',
    progress_percentage NUMERIC NOT NULL DEFAULT 0,
    started_at TEXT,
    completed_at TEXT,
    last_accessed_at TEXT
);

-- STAFF LESSON COMPLETION TABLE
CREATE TABLE staff_lesson_completion (
    completion_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES training_lessons(lesson_id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    personal_notes TEXT,
    completed_at TEXT
);

-- STAFF LESSON NOTES TABLE
CREATE TABLE staff_lesson_notes (
    note_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES training_lessons(lesson_id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- PROMO CODES TABLE
CREATE TABLE promo_codes (
    code_id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    minimum_order_value NUMERIC,
    valid_from TEXT NOT NULL,
    valid_until TEXT NOT NULL,
    usage_limit NUMERIC,
    is_single_use BOOLEAN NOT NULL DEFAULT false,
    times_used NUMERIC NOT NULL DEFAULT 0,
    applicable_locations TEXT,
    applicable_products TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- PROMO CODE USAGE TABLE
CREATE TABLE promo_code_usage (
    usage_id TEXT PRIMARY KEY,
    code_id TEXT NOT NULL REFERENCES promo_codes(code_id) ON DELETE CASCADE,
    order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    discount_applied NUMERIC NOT NULL,
    used_at TEXT NOT NULL
);

-- DROP OF THE MONTH TABLE
CREATE TABLE drop_of_the_month (
    drop_id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    product_image_url TEXT NOT NULL,
    available_from TEXT NOT NULL,
    available_until TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- STALL EVENTS TABLE (Event Alerts)
CREATE TABLE stall_events (
    event_id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    venue_location TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL,
    description TEXT,
    event_image_url TEXT,
    cta_button_text TEXT,
    cta_button_action TEXT,
    cta_button_url TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT false,
    is_drop_of_the_month BOOLEAN NOT NULL DEFAULT false,
    special_price NUMERIC(10, 2),
    available_until TEXT,
    preorder_button_label TEXT,
    preorder_button_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- STALL EVENTS TABLE
CREATE TABLE stall_events (
    event_id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    venue_location TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL,
    description TEXT,
    event_image_url TEXT,
    cta_button_text TEXT,
    cta_button_action TEXT,
    cta_button_url TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- FAVORITES TABLE
CREATE TABLE favorites (
    favorite_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
);

-- PASSWORD RESET TOKENS TABLE
CREATE TABLE password_reset_tokens (
    token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL
);

-- SYSTEM SETTINGS TABLE
CREATE TABLE system_settings (
    setting_id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type TEXT NOT NULL,
    setting_group TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    log_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL
);

-- SESSIONS TABLE
CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    remember_me BOOLEAN NOT NULL DEFAULT false,
    expires_at TEXT NOT NULL,
    last_activity_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    notification_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type TEXT,
    related_entity_id TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TEXT,
    created_at TEXT NOT NULL
);

-- EMAIL LOGS TABLE
CREATE TABLE email_logs (
    email_id TEXT PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    email_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_used TEXT,
    related_order_id TEXT REFERENCES orders(order_id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL
);

-- REFUNDS TABLE
CREATE TABLE refunds (
    refund_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    refund_amount NUMERIC NOT NULL,
    refund_type TEXT NOT NULL,
    refund_reason TEXT NOT NULL,
    refund_items TEXT,
    payment_transaction_id TEXT,
    processed_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    processed_at TEXT,
    created_at TEXT NOT NULL
);

-- ANALYTICS SNAPSHOTS TABLE
CREATE TABLE analytics_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    snapshot_date TEXT NOT NULL,
    snapshot_type TEXT NOT NULL,
    location_name TEXT,
    metrics TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- ============================================
-- SEED DATA
-- ============================================

-- SEED USERS
INSERT INTO users (user_id, email, password_hash, first_name, last_name, phone_number, user_type, account_status, marketing_opt_in, loyalty_points_balance, failed_login_attempts, locked_until, last_login_at, created_at, updated_at) VALUES
('user_001', 'john.smith@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'John', 'Smith', '+447700900123', 'customer', 'active', true, 450, 0, NULL, '2024-01-15T10:30:00Z', '2023-06-01T09:00:00Z', '2024-01-15T10:30:00Z'),
('user_002', 'sarah.jones@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'Sarah', 'Jones', '+447700900124', 'customer', 'active', true, 820, 0, NULL, '2024-01-14T14:20:00Z', '2023-07-15T11:30:00Z', '2024-01-14T14:20:00Z'),
('user_003', 'mike.williams@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'Mike', 'Williams', '+447700900125', 'customer', 'active', false, 150, 0, NULL, '2024-01-13T16:45:00Z', '2023-08-20T13:15:00Z', '2024-01-13T16:45:00Z'),
('user_004', 'emma.brown@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'Emma', 'Brown', '+447700900126', 'customer', 'active', true, 1250, 0, NULL, '2024-01-15T08:15:00Z', '2023-05-10T10:00:00Z', '2024-01-15T08:15:00Z'),
('user_005', 'david.taylor@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'David', 'Taylor', '+447700900127', 'customer', 'active', false, 95, 0, NULL, '2024-01-12T12:30:00Z', '2023-09-05T14:45:00Z', '2024-01-12T12:30:00Z'),
('user_006', 'admin@bakery.com', '$2a$10$2veAJFEsjkIyoXZ/V7asoufUpqLIyRANn38JSqBnFttAEdPABDXAW', 'Admin', 'User', '+447700900128', 'admin', 'active', false, 0, 0, NULL, '2024-01-15T07:00:00Z', '2023-01-01T08:00:00Z', '2024-01-15T07:00:00Z'),
('user_007', 'manager.london@bakery.com', '$2a$10$F2TEZrnaMn0EF4qv7aD74.aKCxLWt7mK9XH.8ElFpHyMFNP.LJNN.', 'Laura', 'Martinez', '+447700900129', 'manager', 'active', false, 0, 0, NULL, '2024-01-15T07:30:00Z', '2023-02-01$09:00:00Z', '2024-01-15T07:30:00Z'),
('user_008', 'staff.london@bakery.com', '$2a$10$Mur6pwDZD61r.SKT2F26r.mdTEon1ExsKIBFyI78zjvXdBPiIAm5S', 'James', 'Anderson', '+447700900130', 'staff', 'active', false, 0, 0, NULL, '2024-01-15T07:45:00Z', '2023-03-15T10:00:00Z', '2024-01-15T07:45:00Z'),
('user_009', 'staff.manchester@bakery.com', '$2a$10$Mur6pwDZD61r.SKT2F26r.mdTEon1ExsKIBFyI78zjvXdBPiIAm5S', 'Sophie', 'Wilson', '+447700900131', 'staff', 'active', false, 0, 0, NULL, '2024-01-15T08:00:00Z', '2023-04-01T11:00:00Z', '2024-01-15T08:00:00Z'),
('user_010', 'olivia.davis@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'Olivia', 'Davis', '+447700900132', 'customer', 'active', true, 680, 0, NULL, '2024-01-14T18:30:00Z', '2023-06-20T12:00:00Z', '2024-01-14T18:30:00Z'),
('user_011', 'daniel.moore@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'Daniel', 'Moore', '+447700900133', 'customer', 'active', false, 340, 0, NULL, '2024-01-14T09:15:00Z', '2023-07-25T13:30:00Z', '2024-01-14T09:15:00Z'),
('user_012', 'jessica.white@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'Jessica', 'White', '+447700900134', 'customer', 'active', true, 920, 0, NULL, '2024-01-13T15:45:00Z', '2023-05-30T14:00:00Z', '2024-01-13T15:45:00Z'),
('user_013', 'manager.birmingham@bakery.com', '$2a$10$4ItZvume3wEWFXGPmvPEW.yKMB1GRvGEOTP45Kt2SyshX3.nMo4om', 'Robert', 'Clark', '+447700900135', 'manager', 'active', false, 0, 0, NULL, '2024-01-15T08:30:00Z', '2023-02-20T09:30:00Z', '2024-01-15T08:30:00Z'),
('user_014', 'staff.birmingham@bakery.com', '$2a$10$Mur6pwDZD61r.SKT2F26r.mdTEon1ExsKIBFyI78zjvXdBPiIAm5S', 'Emily', 'Harris', '+447700900136', 'staff', 'active', false, 0, 0, NULL, '2024-01-15T08:45:00Z', '2023-04-15T10:30:00Z', '2024-01-15T08:45:00Z'),
('user_015', 'charlotte.thomas@example.com', '$2a$10$gXjGW2YXUfXybYOw3nGIx.IykYi97ZpY5PlfI8ZkQhxdYFsoyBLWS', 'Charlotte', 'Thomas', '+447700900137', 'customer', 'active', true, 1560, 0, NULL, '2024-01-15T11:00:00Z', '2023-04-10T11:15:00Z', '2024-01-15T11:00:00Z');

-- SEED STAFF ASSIGNMENTS
INSERT INTO staff_assignments (assignment_id, user_id, location_name, assigned_at) VALUES
('assign_001', 'user_007', 'London Flagship', '2023-02-01T09:00:00Z'),
('assign_002', 'user_008', 'London Flagship', '2023-03-15T10:00:00Z'),
('assign_003', 'user_009', 'Manchester Store', '2023-04-01T11:00:00Z'),
('assign_004', 'user_013', 'Birmingham Store', '2023-02-20T09:30:00Z'),
('assign_005', 'user_014', 'Birmingham Store', '2023-04-15T10:30:00Z');

-- SEED LOCATIONS
INSERT INTO locations (location_id, location_name, address_line1, address_line2, city, postal_code, phone_number, email, is_collection_enabled, is_delivery_enabled, delivery_radius_km, delivery_fee, free_delivery_threshold, estimated_delivery_time_minutes, estimated_preparation_time_minutes, allow_scheduled_pickups, just_eat_url, deliveroo_url, opening_hours, created_at, updated_at) VALUES
('loc_001', 'London Flagship', '123 Baker Street', 'Marylebone', 'London', 'W1U 6RS', '+442071234567', 'london@bakery.com', true, true, 5, 3.99, 25, 30, 20, true, 'https://www.just-eat.co.uk/restaurants-bakery-london', 'https://deliveroo.co.uk/menu/london/bakery', '{"monday":"7:00-20:00","tuesday":"7:00-20:00","wednesday":"7:00-20:00","thursday":"7:00-20:00","friday":"7:00-21:00","saturday":"8:00-21:00","sunday":"9:00-18:00"}', '2023-01-01T08:00:00Z', '2024-01-10T10:00:00Z'),
('loc_002', 'Manchester Store', '45 Deansgate', NULL, 'Manchester', 'M3 2AY', '+441612345678', 'manchester@bakery.com', true, true, 4, 2.99, 20, 35, 20, true, 'https://www.just-eat.co.uk/restaurants-bakery-manchester', 'https://deliveroo.co.uk/menu/manchester/bakery', '{"monday":"7:30-19:30","tuesday":"7:30-19:30","wednesday":"7:30-19:30","thursday":"7:30-19:30","friday":"7:30-20:00","saturday":"8:30-20:00","sunday":"9:30-17:00"}', '2023-01-15T09:00:00Z', '2024-01-10T10:00:00Z'),
('loc_003', 'Birmingham Store', '78 Bull Street', 'City Centre', 'Birmingham', 'B4 6AF', '+441213456789', 'birmingham@bakery.com', true, true, 3.5, 2.49, 18, 25, 15, true, 'https://www.just-eat.co.uk/restaurants-bakery-birmingham', NULL, '{"monday":"8:00-19:00","tuesday":"8:00-19:00","wednesday":"8:00-19:00","thursday":"8:00-19:00","friday":"8:00-20:00","saturday":"9:00-20:00","sunday":"10:00-17:00"}', '2023-02-01T10:00:00Z', '2024-01-10T10:00:00Z');

-- SEED PRODUCTS
INSERT INTO products (product_id, product_name, short_description, long_description, category, price, compare_at_price, primary_image_url, additional_images, availability_status, stock_quantity, low_stock_threshold, dietary_tags, custom_tags, is_featured, available_for_corporate, available_from_date, available_until_date, is_archived, created_at, updated_at) VALUES
('prod_001', 'Classic Croissant', 'Buttery, flaky French pastry', 'Our signature croissant made with premium French butter, laminated to perfection over 24 hours. Each layer is delicate and crispy on the outside, soft and airy on the inside. Perfect for breakfast or any time of day.', 'pastries', 3.50, 4.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', '["https://images.unsplash.com/photo-1623334044303-241021148842","https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae"]', 'in_stock', 150, 20, '["vegetarian"]', '["bestseller","french","breakfast"]', true, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_002', 'Chocolate Éclair', 'Classic French pastry with chocolate', 'Delightfully light choux pastry filled with rich vanilla cream and topped with smooth chocolate ganache. A perfect balance of textures and flavors.', 'pastries', 4.25, NULL, 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d', '["https://images.unsplash.com/photo-1587241321921-91aacc4289ef"]', 'in_stock', 80, 15, '["vegetarian"]', '["chocolate","cream","signature"]', true, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_003', 'Sourdough Loaf', 'Artisan sourdough bread', 'Handcrafted sourdough bread made with our 50-year-old starter culture. Naturally fermented for 48 hours, giving it a distinctive tangy flavor and perfect crust. No commercial yeast added.', 'breads', 5.50, 6.50, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73', '["https://images.unsplash.com/photo-1585478259715-876acc5be8eb","https://images.unsplash.com/photo-1589367920969-ab8e050bbb04"]', 'in_stock', 60, 10, '["vegan","dairy-free"]', '["artisan","natural-yeast","bestseller"]', true, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_004', 'Red Velvet Cupcake', 'Moist red velvet with cream cheese frosting', 'Our famous red velvet cupcake with a velvety texture and hint of cocoa, topped with smooth cream cheese frosting and a dusting of red velvet crumbs.', 'cakes', 4.00, NULL, 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7', '["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd"]', 'in_stock', 100, 20, '["vegetarian"]', '["cupcake","cream-cheese","popular"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_005', 'Blueberry Muffin', 'Fresh blueberries in every bite', 'Large, moist muffin packed with fresh blueberries and topped with a crunchy streusel topping. Baked fresh every morning.', 'cakes', 3.75, NULL, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa', NULL, 'in_stock', 120, 25, '["vegetarian"]', '["muffin","berries","breakfast"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_006', 'Almond Croissant', 'Croissant filled with almond cream', 'Our classic croissant filled with rich almond frangipane, topped with sliced almonds and dusted with powdered sugar. A perfect combination of textures.', 'pastries', 4.50, NULL, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35', NULL, 'in_stock', 70, 15, '["vegetarian"]', '["almond","sweet","pastry"]', true, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_007', 'Lemon Drizzle Cake', 'Tangy lemon sponge with lemon glaze', 'Light and fluffy lemon sponge cake soaked in lemon syrup and topped with a zesty lemon glaze. The perfect balance of sweet and tart.', 'cakes', 4.50, NULL, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187', '["https://images.unsplash.com/photo-1621303837174-89787a7d4729"]', 'in_stock', 45, 10, '["vegetarian"]', '["lemon","citrus","slice"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_008', 'Cinnamon Roll', 'Soft roll with cinnamon and cream cheese frosting', 'Large, fluffy cinnamon roll swirled with brown sugar and cinnamon, topped with generous cream cheese frosting. Best served warm.', 'pastries', 4.75, NULL, 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a', NULL, 'in_stock', 90, 18, '["vegetarian"]', '["cinnamon","sweet","frosting"]', true, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_009', 'Baguette', 'Traditional French baguette', 'Classic French baguette with a crispy crust and soft, airy interior. Baked throughout the day for maximum freshness.', 'breads', 2.80, NULL, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73', NULL, 'in_stock', 200, 30, '["vegan","dairy-free"]', '["french","bread","daily-fresh"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_010', 'Carrot Cake Slice', 'Moist carrot cake with cream cheese frosting', 'Three layers of moist carrot cake made with fresh carrots, walnuts, and warm spices, layered with tangy cream cheese frosting and topped with candied walnuts.', 'cakes', 5.25, NULL, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729', NULL, 'in_stock', 35, 8, '["vegetarian"]', '["carrot","cream-cheese","slice"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_011', 'Pain au Chocolat', 'Chocolate-filled pastry', 'Similar to our croissant but filled with two bars of premium dark chocolate. The perfect morning treat with your coffee.', 'pastries', 3.75, NULL, 'https://images.unsplash.com/photo-1585238341710-4a932d72072f', NULL, 'in_stock', 110, 20, '["vegetarian"]', '["chocolate","french","pastry"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_012', 'Brownie', 'Rich chocolate brownie', 'Dense, fudgy chocolate brownie made with premium Belgian chocolate and topped with chocolate chunks. Pure chocolate indulgence.', 'cakes', 3.50, NULL, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', NULL, 'in_stock', 85, 18, '["vegetarian"]', '["chocolate","fudgy","popular"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_013', 'Victoria Sponge Slice', 'Classic British sponge cake', 'Traditional Victoria sponge with layers of light vanilla sponge, raspberry jam, and fresh whipped cream, dusted with icing sugar.', 'cakes', 4.80, NULL, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3', NULL, 'in_stock', 40, 10, '["vegetarian"]', '["traditional","jam","cream"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_014', 'Focaccia', 'Italian flatbread with rosemary and sea salt', 'Authentic Italian focaccia drizzled with olive oil and topped with fresh rosemary and sea salt. Perfect for sharing or sandwiches.', 'breads', 4.20, NULL, 'https://images.unsplash.com/photo-1600296148605-33c0ba7f2862', NULL, 'in_stock', 55, 12, '["vegan","dairy-free"]', '["italian","flatbread","herbs"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_015', 'Tiramisu Slice', 'Italian coffee-flavored dessert', 'Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa powder. A classic Italian dessert made to perfection.', 'cakes', 5.75, NULL, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', NULL, 'in_stock', 30, 8, '["vegetarian"]', '["italian","coffee","mascarpone"]', true, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_016', 'Raspberry Danish', 'Flaky pastry with raspberry filling', 'Light and flaky Danish pastry filled with sweet raspberry compote and topped with a vanilla glaze and sliced almonds.', 'pastries', 4.00, NULL, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32', NULL, 'in_stock', 65, 15, '["vegetarian"]', '["berry","danish","sweet"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_017', 'Corporate Sandwich Platter', 'Assorted gourmet sandwiches', 'Selection of 20 gourmet sandwiches including smoked salmon, roast beef, chicken tikka, and vegetarian options. Perfect for corporate events. 24-hour notice required.', 'corporate', 85.00, NULL, 'https://images.unsplash.com/photo-1509722747041-616f39b57569', NULL, 'in_stock', NULL, NULL, '["contains-fish","contains-meat"]', '["corporate","catering","party"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_018', 'Celebration Cake 8"', 'Custom celebration cake', 'Beautiful 8-inch celebration cake serving 12-15 people. Choice of vanilla, chocolate, or red velvet sponge with buttercream or cream cheese frosting. Custom message and decorations included.', 'cakes', 45.00, NULL, 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d', NULL, 'in_stock', NULL, NULL, '["vegetarian"]', '["celebration","custom","party"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_019', 'Gluten-Free Brownie', 'Rich chocolate brownie (gluten-free)', 'Our famous chocolate brownie recipe adapted for gluten-free diets. Just as rich and fudgy as the original.', 'cakes', 4.25, NULL, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c', NULL, 'in_stock', 40, 10, '["gluten-free","vegetarian"]', '["chocolate","dietary","special"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z'),
('prod_020', 'Vegan Chocolate Muffin', 'Rich chocolate muffin (vegan)', 'Moist chocolate muffin made without any animal products. Topped with vegan chocolate chips.', 'cakes', 3.95, NULL, 'https://images.unsplash.com/photo-1607478900766-efe13248b125', NULL, 'in_stock', 60, 15, '["vegan","dairy-free"]', '["chocolate","plant-based","muffin"]', false, true, NULL, NULL, false, '2023-01-01T08:00:00Z', '2024-01-15T09:00:00Z');

-- SEED PRODUCT LOCATIONS
INSERT INTO product_locations (assignment_id, product_id, location_name, assigned_at) VALUES
('pl_001', 'prod_001', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_002', 'prod_001', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_003', 'prod_001', 'Birmingham Store', '2023-02-01T10:00:00Z'),
('pl_004', 'prod_002', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_005', 'prod_002', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_006', 'prod_003', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_007', 'prod_003', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_008', 'prod_003', 'Birmingham Store', '2023-02-01T10:00:00Z'),
('pl_009', 'prod_004', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_010', 'prod_004', 'Birmingham Store', '2023-02-01T10:00:00Z'),
('pl_011', 'prod_005', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_012', 'prod_005', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_013', 'prod_005', 'Birmingham Store', '2023-02-01T10:00:00Z'),
('pl_014', 'prod_006', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_015', 'prod_006', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_016', 'prod_007', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_017', 'prod_007', 'Birmingham Store', '2023-02-01T10:00:00Z'),
('pl_018', 'prod_008', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_019', 'prod_008', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_020', 'prod_009', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_021', 'prod_009', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_022', 'prod_009', 'Birmingham Store', '2023-02-01T10:00:00Z'),
('pl_023', 'prod_010', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_024', 'prod_011', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_025', 'prod_011', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_026', 'prod_012', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_027', 'prod_012', 'Birmingham Store', '2023-02-01T10:00:00Z'),
('pl_028', 'prod_013', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_029', 'prod_014', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_030', 'prod_014', 'Manchester Store', '2023-01-15T09:00:00Z'),
('pl_031', 'prod_015', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_032', 'prod_016', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_033', 'prod_016', 'Birmingham Store', '2023-02-01T10:00:00Z'),
('pl_034', 'prod_017', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_035', 'prod_018', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_036', 'prod_019', 'London Flagship', '2023-01-01T08:00:00Z'),
('pl_037', 'prod_020', 'London Flagship', '2023-01-01T08:00:00Z');

-- SEED ORDERS
INSERT INTO orders (order_id, order_number, user_id, customer_email, customer_name, customer_phone, location_name, order_type, fulfillment_method, order_status, delivery_address_line1, delivery_address_line2, delivery_city, delivery_postal_code, delivery_phone, delivery_instructions, special_instructions, scheduled_for, estimated_ready_time, subtotal, delivery_fee, discount_amount, tax_amount, total_amount, loyalty_points_used, loyalty_points_earned, promo_code, payment_method, payment_status, payment_transaction_id, card_last_four, event_date, guest_count, event_type, company_name, collection_code, feedback_submitted, created_at, updated_at, completed_at) VALUES
('order_001', 'ORD-2024-0001', 'user_001', 'john.smith@example.com', 'John Smith', '+447700900123', 'London Flagship', 'standard', 'delivery', 'completed', '45 Oxford Street', 'Flat 3B', 'London', 'W1D 2DZ', '+447700900123', 'Ring bell twice', NULL, NULL, '2024-01-10T11:30:00Z', 14.50, 3.99, 0, 2.18, 18.49, 0, 15, NULL, 'card', 'completed', 'txn_abc123def456', '4242', NULL, NULL, NULL, NULL, '1001', true, '2024-01-10T10:15:00Z', '2024-01-10T12:45:00Z', '2024-01-10T12:45:00Z'),
('order_002', 'ORD-2024-0002', 'user_002', 'sarah.jones@example.com', 'Sarah Jones', '+447700900124', 'London Flagship', 'standard', 'collection', 'completed', NULL, NULL, NULL, NULL, NULL, NULL, 'Extra crispy croissants please', '2024-01-11T14:00:00Z', '2024-01-11T14:00:00Z', 11.00, 0, 0, 1.65, 11.00, 0, 11, NULL, 'card', 'completed', 'txn_ghi789jkl012', '5555', NULL, NULL, NULL, NULL, '1002', true, '2024-01-11T13:30:00Z', '2024-01-11T14:15:00Z', '2024-01-11T14:15:00Z'),
('order_003', 'ORD-2024-0003', 'user_003', 'mike.williams@example.com', 'Mike Williams', '+447700900125', 'Manchester Store', 'standard', 'delivery', 'completed', '78 Portland Street', NULL, 'Manchester', 'M1 4GX', '+447700900125', 'Leave with concierge', NULL, NULL, '2024-01-12T16:00:00Z', 23.25, 2.99, 0, 3.14, 26.39, 0, 23, NULL, 'card', 'completed', 'txn_mno345pqr678', '1234', NULL, NULL, NULL, NULL, '2003', false, '2024-01-12T15:10:00Z', '2024-01-12T16:30:00Z', '2024-01-12T16:30:00Z'),
('order_004', 'ORD-2024-0004', 'user_004', 'emma.brown@example.com', 'Emma Brown', '+447700900126', 'London Flagship', 'corporate', 'delivery', 'completed', '100 Bishopsgate', 'Reception Desk', 'London', 'EC2M 1GT', '+447700900126', 'For board meeting at 10am', 'Need plates and napkins', '2024-01-13T09:30:00Z', '2024-01-13T09:30:00Z', 85.00, 0, 8.50, 9.15, 76.50, 50, 77, 'CORPORATE10', 'card', 'completed', 'txn_stu901vwx234', '9876', '2024-01-13T10:00:00Z', 15, 'board_meeting', 'Tech Innovations Ltd', NULL, true, '2024-01-12T17:00:00Z', '2024-01-13T10:00:00Z', '2024-01-13T10:00:00Z'),
('order_005', 'ORD-2024-0005', 'user_005', 'david.taylor@example.com', 'David Taylor', '+447700900127', 'Birmingham Store', 'standard', 'collection', 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-01-13T15:30:00Z', 8.25, 0, 0, 1.24, 8.25, 0, 8, NULL, 'cash', 'completed', NULL, NULL, NULL, NULL, NULL, NULL, '3001', false, '2024-01-13T15:00:00Z', '2024-01-13T15:45:00Z', '2024-01-13T15:45:00Z'),
('order_006', 'ORD-2024-0006', 'user_010', 'olivia.davis@example.com', 'Olivia Davis', '+447700900132', 'London Flagship', 'standard', 'delivery', 'completed', '22 Abbey Road', NULL, 'London', 'NW8 9AY', '+447700900132', 'Side entrance', NULL, NULL, '2024-01-14T12:00:00Z', 19.50, 3.99, 0, 2.82, 23.49, 0, 20, NULL, 'card', 'completed', 'txn_yza567bcd890', '3333', NULL, NULL, NULL, NULL, '1006', true, '2024-01-14T11:15:00Z', '2024-01-14T12:30:00Z', '2024-01-14T12:30:00Z'),
('order_007', 'ORD-2024-0007', 'user_001', 'john.smith@example.com', 'John Smith', '+447700900123', 'London Flagship', 'standard', 'collection', 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-01-14T16:30:00Z', '2024-01-14T16:30:00Z', 7.00, 0, 0, 1.05, 7.00, 0, 7, NULL, 'card', 'completed', 'txn_efg123hij456', '4242', NULL, NULL, NULL, NULL, '1007', false, '2024-01-14T16:00:00Z', '2024-01-14T16:45:00Z', '2024-01-14T16:45:00Z'),
('order_008', 'ORD-2024-0008', 'user_012', 'jessica.white@example.com', 'Jessica White', '+447700900134', 'Manchester Store', 'standard', 'delivery', 'in_progress', '56 King Street', 'Apartment 12', 'Manchester', 'M2 4LQ', '+447700900134', 'Buzz apartment 12', NULL, NULL, '2024-01-15T13:00:00Z', 16.75, 2.99, 0, 2.37, 19.74, 0, 0, NULL, 'card', 'completed', 'txn_klm789nop012', '6789', NULL, NULL, NULL, NULL, NULL, false, '2024-01-15T12:10:00Z', '2024-01-15T12:30:00Z', NULL),
('order_009', 'ORD-2024-0009', 'user_015', 'charlotte.thomas@example.com', 'Charlotte Thomas', '+447700900137', 'London Flagship', 'celebration', 'collection', 'ready_for_collection', NULL, NULL, NULL, NULL, NULL, NULL, 'Happy 30th Birthday Sarah!', '2024-01-16T14:00:00Z', '2024-01-16T14:00:00Z', 45.00, 0, 0, 6.75, 45.00, 100, 45, NULL, 'card', 'completed', 'txn_qrs345tuv678', '7777', '2024-01-16T18:00:00Z', 20, 'birthday', NULL, '1009', false, '2024-01-13T10:00:00Z', '2024-01-15T14:00:00Z', NULL),
('order_010', 'ORD-2024-0010', 'user_011', 'daniel.moore@example.com', 'Daniel Moore', '+447700900133', 'Birmingham Store', 'standard', 'delivery', 'completed', '34 New Street', NULL, 'Birmingham', 'B2 4EG', '+447700900133', NULL, NULL, NULL, '2024-01-14T17:30:00Z', 12.50, 2.49, 1.25, 1.62, 13.74, 0, 14, 'SAVE10', 'card', 'completed', 'txn_wxy901zab234', '4444', NULL, NULL, NULL, NULL, '3010', true, '2024-01-14T16:45:00Z', '2024-01-14T18:00:00Z', '2024-01-14T18:00:00Z'),
('order_011', 'ORD-2024-0011', 'user_002', 'sarah.jones@example.com', 'Sarah Jones', '+447700900124', 'London Flagship', 'standard', 'collection', 'pending_payment', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-01-15T18:00:00Z', '2024-01-15T18:00:00Z', 15.25, 0, 0, 2.29, 15.25, 0, 0, NULL, 'card', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '2024-01-15T17:30:00Z', '2024-01-15T17:30:00Z', NULL),
('order_012', 'ORD-2024-0012', 'user_004', 'emma.brown@example.com', 'Emma Brown', '+447700900126', 'London Flagship', 'standard', 'delivery', 'completed', '45 Oxford Street', 'Flat 3B', 'London', 'W1D 2DZ', '+447700900126', 'Ring bell twice', 'Extra napkins please', NULL, '2024-01-13T10:30:00Z', 22.00, 3.99, 0, 3.12, 25.99, 0, 22, NULL, 'card', 'completed', 'txn_cde567fgh890', '8888', NULL, NULL, NULL, NULL, '1012', false, '2024-01-13T09:45:00Z', '2024-01-13T11:00:00Z', '2024-01-13T11:00:00Z');

-- SEED ORDER ITEMS
INSERT INTO order_items (item_id, order_id, product_id, product_name, price_at_purchase, quantity, subtotal, product_specific_notes) VALUES
('item_001', 'order_001', 'prod_001', 'Classic Croissant', 3.50, 2, 7.00, NULL),
('item_002', 'order_001', 'prod_008', 'Cinnamon Roll', 4.75, 1, 4.75, 'Extra frosting'),
('item_003', 'order_001', 'prod_005', 'Blueberry Muffin', 3.75, 1, 3.75, NULL),
('item_004', 'order_002', 'prod_001', 'Classic Croissant', 3.50, 2, 7.00, 'Extra crispy'),
('item_005', 'order_002', 'prod_011', 'Pain au Chocolat', 3.75, 1, 3.75, NULL),
('item_006', 'order_003', 'prod_002', 'Chocolate Éclair', 4.25, 2, 8.50, NULL),
('item_007', 'order_003', 'prod_006', 'Almond Croissant', 4.50, 2, 9.00, NULL),
('item_008', 'order_003', 'prod_003', 'Sourdough Loaf', 5.50, 1, 5.50, 'Well done crust'),
('item_009', 'order_004', 'prod_017', 'Corporate Sandwich Platter', 85.00, 1, 85.00, 'No seafood allergies'),
('item_010', 'order_005', 'prod_001', 'Classic Croissant', 3.50, 1, 3.50, NULL),
('item_011', 'order_005', 'prod_012', 'Brownie', 3.50, 1, 3.50, NULL),
('item_012', 'order_005', 'prod_004', 'Red Velvet Cupcake', 4.00, 1, 4.00, NULL),
('item_013', 'order_006', 'prod_015', 'Tiramisu Slice', 5.75, 2, 11.50, NULL),
('item_014', 'order_006', 'prod_006', 'Almond Croissant', 4.50, 1, 4.50, NULL),
('item_015', 'order_006', 'prod_002', 'Chocolate Éclair', 4.25, 1, 4.25, NULL),
('item_016', 'order_007', 'prod_001', 'Classic Croissant', 3.50, 2, 7.00, NULL),
('item_017', 'order_008', 'prod_008', 'Cinnamon Roll', 4.75, 2, 9.50, NULL),
('item_018', 'order_008', 'prod_007', 'Lemon Drizzle Cake', 4.50, 1, 4.50, NULL),
('item_019', 'order_008', 'prod_005', 'Blueberry Muffin', 3.75, 1, 3.75, NULL),
('item_020', 'order_009', 'prod_018', 'Celebration Cake 8"', 45.00, 1, 45.00, 'Happy 30th Birthday Sarah!'),
('item_021', 'order_010', 'prod_003', 'Sourdough Loaf', 5.50, 1, 5.50, NULL),
('item_022', 'order_010', 'prod_014', 'Focaccia', 4.20, 1, 4.20, NULL),
('item_023', 'order_010', 'prod_009', 'Baguette', 2.80, 1, 2.80, NULL),
('item_024', 'order_011', 'prod_015', 'Tiramisu Slice', 5.75, 1, 5.75, NULL),
('item_025', 'order_011', 'prod_006', 'Almond Croissant', 4.50, 2, 9.00, NULL),
('item_026', 'order_012', 'prod_001', 'Classic Croissant', 3.50, 4, 14.00, NULL),
('item_027', 'order_012', 'prod_002', 'Chocolate Éclair', 4.25, 2, 8.50, NULL);

-- SEED ORDER STATUS HISTORY
INSERT INTO order_status_history (history_id, order_id, previous_status, new_status, changed_by_user_id, notes, changed_at) VALUES
('hist_001', 'order_001', NULL, 'pending_payment', NULL, 'Order created', '2024-01-10T10:15:00Z'),
('hist_002', 'order_001', 'pending_payment', 'payment_confirmed', NULL, 'Payment successful', '2024-01-10T10:16:00Z'),
('hist_003', 'order_001', 'payment_confirmed', 'preparing', 'user_008', 'Started preparation', '2024-01-10T10:20:00Z'),
('hist_004', 'order_001', 'preparing', 'out_for_delivery', 'user_008', 'Driver collected order', '2024-01-10T11:30:00Z'),
('hist_005', 'order_001', 'out_for_delivery', 'completed', NULL, 'Order delivered', '2024-01-10T12:45:00Z'),
('hist_006', 'order_002', NULL, 'pending_payment', NULL, 'Order created', '2024-01-11T13:30:00Z'),
('hist_007', 'order_002', 'pending_payment', 'payment_confirmed', NULL, 'Payment successful', '2024-01-11T13:31:00Z'),
('hist_008', 'order_002', 'payment_confirmed', 'preparing', 'user_008', 'Started preparation', '2024-01-11T13:35:00Z'),
('hist_009', 'order_002', 'preparing', 'ready_for_collection', 'user_008', 'Order ready', '2024-01-11T14:00:00Z'),
('hist_010', 'order_002', 'ready_for_collection', 'completed', 'user_008', 'Customer collected', '2024-01-11T14:15:00Z'),
('hist_011', 'order_003', NULL, 'pending_payment', NULL, 'Order created', '2024-01-12T15:10:00Z'),
('hist_012', 'order_003', 'pending_payment', 'payment_confirmed', NULL, 'Payment successful', '2024-01-12T15:11:00Z'),
('hist_013', 'order_003', 'payment_confirmed', 'preparing', 'user_009', 'Started preparation', '2024-01-12T15:15:00Z'),
('hist_014', 'order_003', 'preparing', 'out_for_delivery', 'user_009', 'Driver collected', '2024-01-12T16:00:00Z'),
('hist_015', 'order_003', 'out_for_delivery', 'completed', NULL, 'Order delivered', '2024-01-12T16:30:00Z'),
('hist_016', 'order_004', NULL, 'pending_payment', NULL, 'Corporate order created', '2024-01-12T17:00:00Z'),
('hist_017', 'order_004', 'pending_payment', 'payment_confirmed', NULL, 'Payment successful', '2024-01-12T17:01:00Z'),
('hist_018', 'order_004', 'payment_confirmed', 'preparing', 'user_007', 'Corporate order preparation started', '2024-01-13T08:00:00Z'),
('hist_019', 'order_004', 'preparing', 'out_for_delivery', 'user_008', 'Driver collected corporate order', '2024-01-13T09:30:00Z'),
('hist_020', 'order_004', 'out_for_delivery', 'completed', NULL, 'Corporate order delivered', '2024-01-13T10:00:00Z'),
('hist_021', 'order_008', NULL, 'pending_payment', NULL, 'Order created', '2024-01-15T12:10:00Z'),
('hist_022', 'order_008', 'pending_payment', 'payment_confirmed', NULL, 'Payment successful', '2024-01-15T12:11:00Z'),
('hist_023', 'order_008', 'payment_confirmed', 'preparing', 'user_009', 'Started preparation', '2024-01-15T12:15:00Z'),
('hist_024', 'order_008', 'preparing', 'in_progress', 'user_009', 'Order in progress', '2024-01-15T12:30:00Z'),
('hist_025', 'order_009', NULL, 'pending_payment', NULL, 'Celebration order created', '2024-01-13T10:00:00Z'),
('hist_026', 'order_009', 'pending_payment', 'payment_confirmed', NULL, 'Payment successful', '2024-01-13T10:01:00Z'),
('hist_027', 'order_009', 'payment_confirmed', 'preparing', 'user_007', 'Custom cake preparation', '2024-01-14T09:00:00Z'),
('hist_028', 'order_009', 'preparing', 'ready_for_collection', 'user_008', 'Celebration cake ready', '2024-01-15T14:00:00Z');

-- SEED ADDRESSES
INSERT INTO addresses (address_id, user_id, address_label, address_line1, address_line2, city, postal_code, delivery_phone, delivery_instructions, is_default, created_at, updated_at) VALUES
('addr_001', 'user_001', 'Home', '45 Oxford Street', 'Flat 3B', 'London', 'W1D 2DZ', '+447700900123', 'Ring bell twice', true, '2023-06-01T09:00:00Z', '2023-06-01T09:00:00Z'),
('addr_002', 'user_001', 'Work', '25 Baker Street', 'Floor 5', 'London', 'W1U 3BW', '+447700900123', 'Reception desk', false, '2023-06-15T10:00:00Z', '2023-06-15T10:00:00Z'),
('addr_003', 'user_002', 'Home', '89 Regent Street', NULL, 'London', 'W1B 4DY', '+447700900124', 'Leave with neighbor at number 91', true, '2023-07-15T11:30:00Z', '2023-07-15T11:30:00Z'),
('addr_004', 'user_004', 'Home', '67 Chelsea Gardens', 'Apartment 12', 'London', 'SW3 4LJ', '+447700900126', 'Concierge available 24/7', true, '2023-05-10T10:00:00Z', '2023-05-10T10:00:00Z'),
('addr_005', 'user_004', 'Office', '100 Bishopsgate', 'Reception Desk', 'London', 'EC2M 1GT', '+447700900126', 'For board meeting deliveries', false, '2023-06-20T14:00:00Z', '2023-06-20T14:00:00Z'),
('addr_006', 'user_010', 'Home', '22 Abbey Road', NULL, 'London', 'NW8 9AY', '+447700900132', 'Side entrance', true, '2023-06-20T12:00:00Z', '2023-06-20T12:00:00Z'),
('addr_007', 'user_012', 'Home', '134 King Street', 'Flat 7', 'Manchester', 'M2 4NQ', '+447700900134', 'Buzz flat 7', true, '2023-05-30T14:00:00Z', '2023-05-30T14:00:00Z'),
('addr_008', 'user_015', 'Home', '56 Notting Hill Gate', NULL, 'London', 'W11 3HT', '+447700900137', 'Blue door on the left', true, '2023-04-10T11:15:00Z', '2023-04-10T11:15:00Z');

-- SEED LOYALTY POINTS TRANSACTIONS
INSERT INTO loyalty_points_transactions (transaction_id, user_id, transaction_type, points_change, balance_after, order_id, description, created_at) VALUES
('lpt_001', 'user_001', 'earned', 15, 15, 'order_001', 'Points earned from order ORD-2024-0001', '2024-01-10T12:45:00Z'),
('lpt_002', 'user_002', 'earned', 11, 11, 'order_002', 'Points earned from order ORD-2024-0002', '2024-01-11T14:15:00Z'),
('lpt_003', 'user_003', 'earned', 23, 23, 'order_003', 'Points earned from order ORD-2024-0003', '2024-01-12T16:30:00Z'),
('lpt_004', 'user_004', 'redeemed', -50, 800, 'order_004', 'Points redeemed for discount', '2024-01-12T17:00:00Z'),
('lpt_005', 'user_004', 'earned', 77, 877, 'order_004', 'Points earned from order ORD-2024-0004', '2024-01-13T10:00:00Z'),
('lpt_006', 'user_005', 'earned', 8, 8, 'order_005', 'Points earned from order ORD-2024-0005', '2024-01-13T15:45:00Z'),
('lpt_007', 'user_010', 'earned', 20, 20, 'order_006', 'Points earned from order ORD-2024-0006', '2024-01-14T12:30:00Z'),
('lpt_008', 'user_001', 'earned', 7, 22, 'order_007', 'Points earned from order ORD-2024-0007', '2024-01-14T16:45:00Z'),
('lpt_009', 'user_015', 'redeemed', -100, 1460, 'order_009', 'Points redeemed for celebration cake', '2024-01-13T10:00:00Z'),
('lpt_010', 'user_015', 'earned', 45, 1505, 'order_009', 'Points earned from order ORD-2024-0009', '2024-01-15T14:00:00Z'),
('lpt_011', 'user_011', 'earned', 14, 14, 'order_010', 'Points earned from order ORD-2024-0010', '2024-01-14T18:00:00Z'),
('lpt_012', 'user_004', 'earned', 22, 899, 'order_012', 'Points earned from order ORD-2024-0012', '2024-01-13T11:00:00Z'),
('lpt_013', 'user_001', 'manual_adjustment', 428, 450, NULL, 'Loyalty bonus for being valued customer', '2024-01-14T10:00:00Z'),
('lpt_014', 'user_002', 'manual_adjustment', 809, 820, NULL, 'Compensation for delayed order last month', '2024-01-10T12:00:00Z'),
('lpt_015', 'user_003', 'manual_adjustment', 127, 150, NULL, 'Welcome bonus points', '2023-08-20T14:00:00Z');

-- SEED CUSTOMER FEEDBACK
INSERT INTO customer_feedback (feedback_id, order_id, user_id, overall_rating, product_rating, fulfillment_rating, product_comment, fulfillment_comment, overall_comment, quick_tags, allow_contact, reviewed_status, reviewed_by_user_id, reviewed_at, is_hidden_from_staff, original_feedback_id, created_at, updated_at) VALUES
('fb_001', 'order_001', 'user_001', 5, 5, 5, 'The croissants were absolutely perfect! Crispy outside and fluffy inside.', 'Delivery was on time and the driver was very polite.', 'Amazing experience! Will definitely order again.', '["fresh","great_service","timely"]', true, 'reviewed', 'user_007', '2024-01-10T14:00:00Z', false, NULL, '2024-01-10T13:00:00Z', '2024-01-10T14:00:00Z'),
('fb_002', 'order_002', 'user_002', 5, 5, 5, 'Love the cinnamon rolls! Extra frosting was perfect.', 'Collection was smooth and staff were friendly.', 'Best bakery in London!', '["delicious","friendly_staff"]', false, 'reviewed', 'user_007', '2024-01-11T16:00:00Z', false, NULL, '2024-01-11T15:00:00Z', '2024-01-11T16:00:00Z'),
('fb_003', 'order_004', 'user_004', 5, 5, 5, 'The sandwich platter was a huge hit at our board meeting. Fresh ingredients and great variety.', 'Perfect timing for our 10am meeting. Well packaged and presented.', 'Excellent corporate catering service. Will use again for future events.', '["corporate_friendly","professional","quality"]', true, 'reviewed', 'user_006', '2024-01-13T12:00:00Z', false, NULL, '2024-01-13T11:30:00Z', '2024-01-13T12:00:00Z'),
('fb_004', 'order_006', 'user_010', 4, 5, 3, 'Tiramisu was absolutely divine! Best I''ve had in London.', 'Delivery was 15 minutes late but the driver apologized.', 'Great products, delivery could be improved.', '["delicious","slightly_late"]', false, 'reviewed', 'user_007', '2024-01-14T15:00:00Z', false, NULL, '2024-01-14T14:00:00Z', '2024-01-14T15:00:00Z'),
('fb_005', 'order_010', 'user_011', 4, 4, 5, 'Good breads, sourdough was excellent. Focaccia could have been a bit more herby.', 'Quick delivery and well packaged. Promo code worked great!', 'Satisfied with the order overall.', '["good_value","prompt"]', false, 'reviewed', 'user_013', '2024-01-14T19:00:00Z', false, NULL, '2024-01-14T18:30:00Z', '2024-01-14T19:00:00Z');

-- SEED FEEDBACK INTERNAL NOTES
INSERT INTO feedback_internal_notes (note_id, feedback_id, created_by_user_id, note_text, created_at) VALUES
('fn_001', 'fb_001', 'user_007', 'Excellent feedback. Customer seems very satisfied. Consider featuring them in testimonials.', '2024-01-10T14:05:00Z'),
('fn_002', 'fb_004', 'user_007', 'Need to address delivery timing issues. Will discuss with delivery coordinator.', '2024-01-14T15:05:00Z'),
('fn_003', 'fb_003', 'user_006', 'Great corporate client. Add to preferred corporate customers list.', '2024-01-13T12:05:00Z');

-- SEED STAFF FEEDBACK
INSERT INTO staff_feedback (feedback_id, reference_number, submitted_by_user_id, location_name, feedback_type, title, description, priority, attachment_urls, is_anonymous, status, assigned_to_user_id, resolution_notes, resolved_at, created_at, updated_at) VALUES
('sf_001', 'SF-2024-0001', 'user_008', 'London Flagship', 'equipment_issue', 'Oven Temperature Issue', 'The main oven is not reaching the correct temperature. It''s affecting the quality of our croissants. Temperature fluctuates between 180-190C when it should be steady at 200C.', 'high', '["https://images.unsplash.com/photo-1556910096-6f5e72db6803"]', false, 'resolved', 'user_006', 'Technician came out and replaced the thermostat. Oven now working perfectly.', '2024-01-12T16:00:00Z', '2024-01-10T09:00:00Z', '2024-01-12T16:00:00Z'),
('sf_002', 'SF-2024-0002', 'user_009', 'Manchester Store', 'suggestion', 'New Product Suggestion', 'Several customers have asked about vegan cake options. We could expand our vegan range beyond just the chocolate muffin. Maybe a vegan Victoria sponge or carrot cake?', 'medium', NULL, false, 'under_review', 'user_006', NULL, NULL, '2024-01-11T14:00:00Z', '2024-01-11T14:00:00Z'),
('sf_003', 'SF-2024-0003', 'user_014', 'Birmingham Store', 'safety_concern', 'Wet Floor Not Marked', 'The floor near the back entrance gets wet when it rains and there''s no wet floor sign. Someone could slip.', 'high', NULL, false, 'resolved', 'user_013', 'Ordered additional wet floor signs and placed one permanently at the back entrance. Staff reminded to check regularly.', '2024-01-13T10:00:00Z', '2024-01-12T16:30:00Z', '2024-01-13T10:00:00Z'),
('sf_004', 'SF-2024-0004', 'user_008', 'London Flagship', 'process_improvement', 'Order Ticket System', 'During busy periods, the paper ticket system gets confusing. We should consider a digital display system for orders.', 'low', NULL, false, 'pending_review', NULL, NULL, NULL, '2024-01-14T11:00:00Z', '2024-01-14T11:00:00Z'),
('sf_005', 'SF-2024-0005', 'user_009', 'Manchester Store', 'complaint', 'Insufficient Break Room Seating', 'With the new staff members, we only have 4 chairs in the break room but often have 6-7 staff on shift. People are eating lunch standing up.', 'medium', NULL, true, 'in_progress', 'user_006', NULL, NULL, '2024-01-13T09:00:00Z', '2024-01-13T09:00:00Z');

-- SEED STAFF FEEDBACK RESPONSES
INSERT INTO staff_feedback_responses (response_id, feedback_id, responded_by_user_id, response_text, is_internal_note, created_at) VALUES
('sfr_001', 'sf_001', 'user_006', 'Thanks for reporting this. I''ve scheduled a technician to come tomorrow morning at 8am. Please make sure they have access to the kitchen.', false, '2024-01-10T10:00:00Z'),
('sfr_002', 'sf_001', 'user_008', 'Perfect, I''ll be there to let them in. Thanks for the quick response!', false, '2024-01-10T10:30:00Z'),
('sfr_003', 'sf_001', 'user_006', 'Technician visit complete. Please test the oven and let me know if the issue persists.', false, '2024-01-12T11:00:00Z'),
('sfr_004', 'sf_002', 'user_006', 'This is a great suggestion! I''ll discuss with the head baker and add it to our Q1 product development meeting agenda.', false, '2024-01-12T09:00:00Z'),
('sfr_005', 'sf_003', 'user_013', 'Absolutely right to flag this. Ordering signs today and will have them by Friday.', false, '2024-01-12T17:00:00Z'),
('sfr_006', 'sf_005', 'user_006', 'Good point. I''ll order 4 more chairs for the break room this week.', true, '2024-01-13T10:00:00Z');

-- SEED INVENTORY ALERTS
INSERT INTO inventory_alerts (alert_id, reference_number, submitted_by_user_id, location_name, item_name, alert_type, current_quantity, notes, priority, status, acknowledged_by_user_id, acknowledged_at, resolution_notes, resolved_by_user_id, resolved_at, created_at, updated_at) VALUES
('ia_001', 'IA-2024-0001', 'user_008', 'London Flagship', 'Premium French Butter', 'low_stock', 5, 'Only 5kg left. We typically use 8kg per day on weekends. Order placed but won''t arrive until Monday.', 'high', 'resolved', 'user_007', '2024-01-12T09:00:00Z', 'Emergency delivery arranged for Saturday morning. 20kg delivered.', 'user_007', '2024-01-13T08:00:00Z', '2024-01-12T08:30:00Z', '2024-01-13T08:00:00Z'),
('ia_002', 'IA-2024-0002', 'user_009', 'Manchester Store', 'Almond Flour', 'out_of_stock', 0, 'Completely out. Can''t make almond croissants today. Regular flour is fine.', 'medium', 'resolved', 'user_006', '2024-01-13T10:30:00Z', 'Sourced from local supplier. 10kg delivered same day.', 'user_006', '2024-01-13T15:00:00Z', '2024-01-13T10:00:00Z', '2024-01-13T15:00:00Z'),
('ia_003', 'IA-2024-0003', 'user_014', 'Birmingham Store', 'Vanilla Extract', 'low_stock', 2, 'Only 2 bottles remaining. Should last until Wednesday.', 'low', 'acknowledged', 'user_013', '2024-01-14T09:00:00Z', NULL, NULL, NULL, '2024-01-14T08:45:00Z', '2024-01-14T09:00:00Z'),
('ia_004', 'IA-2024-0004', 'user_008', 'London Flagship', 'Fresh Blueberries', 'quality_issue', 15, 'Latest delivery of blueberries has some mold. About 30% unusable. Will need fresh delivery for tomorrow.', 'high', 'resolved', 'user_007', '2024-01-14T11:00:00Z', 'Supplier contacted. Fresh batch delivered and old batch credited.', 'user_007', '2024-01-14T16:00:00Z', '2024-01-14T10:30:00Z', '2024-01-14T16:00:00Z'),
('ia_005', 'IA-2024-0005', 'user_009', 'Manchester Store', 'Chocolate Chips', 'low_stock', 3, 'Down to 3 bags. Will need more by Friday for weekend baking.', 'medium', 'pending', NULL, NULL, NULL, NULL, NULL, '2024-01-15T09:00:00Z', '2024-01-15T09:00:00Z');

-- SEED TRAINING COURSES
INSERT INTO training_courses (course_id, course_title, short_description, long_description, cover_image_url, category, tags, status, is_required, estimated_duration_minutes, prerequisite_course_ids, created_by_user_id, created_at, updated_at) VALUES
('course_001', 'Food Safety & Hygiene Level 2', 'Essential food safety training for all staff', 'Comprehensive food safety course covering personal hygiene, food storage, temperature control, cross-contamination prevention, and cleaning procedures. Required for all staff handling food.', 'https://images.unsplash.com/photo-1584448062019-c6f0ac07d014', 'safety', '["required","hygiene","safety","compliance"]', 'published', true, 180, NULL, 'user_006', '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('course_002', 'Customer Service Excellence', 'Delivering outstanding customer experiences', 'Learn how to provide exceptional customer service, handle complaints professionally, and create memorable experiences for our customers. Covers communication skills, problem-solving, and product knowledge.', 'https://images.unsplash.com/photo-1556740714-a8395b3bf30f', 'customer_service', '["communication","service","skills"]', 'published', true, 120, NULL, 'user_006', '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('course_003', 'Artisan Bread Baking Techniques', 'Advanced bread making skills', 'Deep dive into artisan bread baking including sourdough cultivation, lamination techniques, scoring methods, and understanding gluten development. For experienced bakers looking to expand their skills.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 'baking', '["advanced","bread","techniques"]', 'published', false, 240, NULL, 'user_007', '2023-02-01T09:00:00Z', '2023-02-01T09:00:00Z'),
('course_004', 'Coffee Machine Operation & Maintenance', 'Operating our commercial coffee machines', 'Complete guide to using and maintaining our espresso machines, including grinding, tamping, steaming milk, and daily cleaning routines.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', 'equipment', '["coffee","equipment","maintenance"]', 'published', false, 60, NULL, 'user_007', '2023-01-15T10:00:00Z', '2023-01-15T10:00:00Z'),
('course_005', 'Allergen Awareness & Management', 'Understanding and managing food allergens', 'Critical training on the 14 major allergens, cross-contamination prevention, proper labeling, and how to handle customer allergen enquiries safely and confidently.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae', 'safety', '["required","allergens","safety","compliance"]', 'published', true, 90, '["course_001"]', 'user_006', '2023-01-10T09:00:00Z', '2023-01-10T09:00:00Z');

-- SEED TRAINING LESSONS
INSERT INTO training_lessons (lesson_id, course_id, lesson_title, lesson_type, content_url, content_text, duration_minutes, additional_notes, lesson_order, created_at, updated_at) VALUES
('lesson_001', 'course_001', 'Introduction to Food Safety', 'video', 'https://training.videos.example.com/food-safety-intro', 'Overview of food safety principles and why they matter in a commercial bakery environment.', 15, 'Watch video and take notes', 1, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_002', 'course_001', 'Personal Hygiene Standards', 'video', 'https://training.videos.example.com/personal-hygiene', 'Detailed guide on maintaining proper personal hygiene including handwashing techniques, uniform standards, and illness reporting.', 25, 'Practice handwashing technique demonstrated in video', 2, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_003', 'course_001', 'Temperature Control', 'document', 'https://training.docs.example.com/temperature-control.pdf', 'Understanding critical temperatures for food safety including cooking, cooling, and storage temperatures. Includes temperature monitoring logs.', 30, 'Familiarize yourself with our temperature log sheets', 3, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_004', 'course_001', 'Cross-Contamination Prevention', 'video', 'https://training.videos.example.com/cross-contamination', 'How to prevent cross-contamination through proper food handling, storage, and equipment use.', 20, NULL, 4, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_005', 'course_001', 'Cleaning & Sanitization', 'document', 'https://training.docs.example.com/cleaning-procedures.pdf', 'Proper cleaning and sanitization procedures for equipment, surfaces, and facilities.', 30, 'Review our cleaning schedules and checklists', 5, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_006', 'course_001', 'Food Safety Quiz', 'quiz', NULL, '20-question assessment covering all aspects of food safety training.', 30, 'Must score 80% or above to pass. Can retake if needed.', 6, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_007', 'course_002', 'The Customer Experience', 'video', 'https://training.videos.example.com/customer-experience', 'Understanding what makes a great customer experience and why it matters for our business.', 20, NULL, 1, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_008', 'course_002', 'Effective Communication Skills', 'video', 'https://training.videos.example.com/communication-skills', 'Verbal and non-verbal communication techniques for interacting with customers.', 25, 'Practice the greeting examples shown', 2, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_009', 'course_002', 'Handling Complaints', 'document', 'https://training.docs.example.com/complaint-handling.pdf', 'Step-by-step guide to handling customer complaints professionally and turning negative situations into positive outcomes.', 30, 'Review case studies at the end of document', 3, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_010', 'course_002', 'Product Knowledge', 'document', 'https://training.docs.example.com/product-guide.pdf', 'Complete guide to our products including ingredients, dietary information, and selling points for each item.', 45, 'Try to memorize key details about our top 10 bestsellers', 4, '2023-01-01T08:00:00Z', '2023-01-01T08:00:00Z'),
('lesson_011', 'course_003', 'Understanding Sourdough Starters', 'video', 'https://training.videos.example.com/sourdough-starters', 'The science and art of maintaining sourdough starter cultures.', 40, NULL, 1, '2023-02-01T09:00:00Z', '2023-02-01T09:00:00Z'),
('lesson_012', 'course_003', 'Lamination Techniques', 'video', 'https://training.videos.example.com/lamination', 'Mastering the art of creating layers in pastry dough through folding and rolling.', 60, 'Hands-on practice required after watching', 2, '2023-02-01T09:00:00Z', '2023-02-01T09:00:00Z'),
('lesson_013', 'course_005', 'The 14 Major Allergens', 'document', 'https://training.docs.example.com/allergens-guide.pdf', 'Detailed information about the 14 major food allergens and products that contain them.', 30, 'Memorize the 14 allergens', 1, '2023-01-10T09:00:00Z', '2023-01-10T09:00:00Z'),
('lesson_014', 'course_005', 'Allergen Management in Our Bakery', 'video', 'https://training.videos.example.com/allergen-management', 'How we manage allergens in our production and what staff need to know.', 25, NULL, 2, '2023-01-10T09:00:00Z', '2023-01-10T09:00:00Z'),
('lesson_015', 'course_005', 'Customer Allergen Enquiries', 'document', 'https://training.docs.example.com/allergen-enquiries.pdf', 'How to respond to customer questions about allergens safely and accurately.', 20, 'Role-play scenarios with colleagues', 3, '2023-01-10T09:00:00Z', '2023-01-10T09:00:00Z');

-- SEED STAFF COURSE PROGRESS
INSERT INTO staff_course_progress (progress_id, user_id, course_id, status, progress_percentage, started_at, completed_at, last_accessed_at) VALUES
('prog_001', 'user_008', 'course_001', 'completed', 100, '2023-03-15T10:00:00Z', '2023-03-16T14:30:00Z', '2023-03-16T14:30:00Z'),
('prog_002', 'user_008', 'course_002', 'completed', 100, '2023-03-17T09:00:00Z', '2023-03-17T16:00:00Z', '2023-03-17T16:00:00Z'),
('prog_003', 'user_008', 'course_003', 'in_progress', 45, '2023-04-01T10:00:00Z', NULL, '2024-01-10T15:00:00Z'),
('prog_004', 'user_009', 'course_001', 'completed', 100, '2023-04-01T11:00:00Z', '2023-04-02T15:00:00Z', '2023-04-02T15:00:00Z'),
('prog_005', 'user_009', 'course_002', 'completed', 100, '2023-04-03T10:00:00Z', '2023-04-03T17:00:00Z', '2023-04-03T17:00:00Z'),
('prog_006', 'user_009', 'course_005', 'in_progress', 66, '2023-04-10T09:00:00Z', NULL, '2024-01-12T14:00:00Z'),
('prog_007', 'user_014', 'course_001', 'completed', 100, '2023-04-15T10:30:00Z', '2023-04-16T14:00:00Z', '2023-04-16T14:00:00Z'),
('prog_008', 'user_014', 'course_002', 'in_progress', 75, '2023-04-20T09:00:00Z', NULL, '2024-01-11T13:00:00Z'),
('prog_009', 'user_007', 'course_001', 'completed', 100, '2023-02-01T09:00:00Z', '2023-02-01T15:00:00Z', '2023-02-01T15:00:00Z'),
('prog_010', 'user_007', 'course_003', 'completed', 100, '2023-02-15T10:00:00Z', '2023-02-20T16:00:00Z', '2023-02-20T16:00:00Z');

-- SEED STAFF LESSON COMPLETION
INSERT INTO staff_lesson_completion (completion_id, user_id, lesson_id, is_completed, personal_notes, completed_at) VALUES
('comp_001', 'user_008', 'lesson_001', true, 'Good overview. Makes sense why we follow these procedures.', '2023-03-15T10:30:00Z'),
('comp_002', 'user_008', 'lesson_002', true, 'Handwashing technique was helpful. Need to remember the 20 second rule.', '2023-03-15T11:00:00Z'),
('comp_003', 'user_008', 'lesson_003', true, 'Temperature zones are critical. Will be more careful with monitoring.', '2023-03-15T12:00:00Z'),
('comp_004', 'user_008', 'lesson_004', true, NULL, '2023-03-16T10:00:00Z'),
('comp_005', 'user_008', 'lesson_005', true, 'Our cleaning schedule makes more sense now.', '2023-03-16T13:00:00Z'),
('comp_006', 'user_008', 'lesson_006', true, 'Passed with 95%!', '2023-03-16T14:30:00Z'),
('comp_007', 'user_009', 'lesson_001', true, 'Clear and well structured introduction.', '2023-04-01T11:30:00Z'),
('comp_008', 'user_009', 'lesson_002', true, NULL, '2023-04-01T12:00:00Z'),
('comp_009', 'user_009', 'lesson_003', true, 'Temperature control is more important than I thought.', '2023-04-02T10:00:00Z'),
('comp_010', 'user_009', 'lesson_004', true, NULL, '2023-04-02T11:00:00Z'),
('comp_011', 'user_008', 'lesson_007', true, 'Really enjoyed this one. Customer experience is everything.', '2023-03-17T09:30:00Z'),
('comp_012', 'user_008', 'lesson_008', true, 'The greeting examples were very practical.', '2023-03-17T11:00:00Z'),
('comp_013', 'user_014', 'lesson_001', true, 'Comprehensive introduction to food safety.', '2023-04-15T11:00:00Z'),
('comp_014', 'user_014', 'lesson_002', true, 'Handwashing demonstration was excellent.', '2023-04-15T12:00:00Z');

-- SEED STAFF LESSON NOTES
INSERT INTO staff_lesson_notes (note_id, user_id, lesson_id, note_text, created_at, updated_at) VALUES
('note_001', 'user_008', 'lesson_003', 'Key temperatures to remember: Fridge 0-5°C, Freezer -18°C or below, Hot holding 63°C or above, Danger zone 5-63°C', '2023-03-15T12:05:00Z', '2023-03-15T12:05:00Z'),
('note_002', 'user_008', 'lesson_010', 'Bestsellers: Classic Croissant (butter lamination, 24hr process), Chocolate Éclair (choux pastry, vanilla cream), Sourdough (50yr starter, 48hr ferment)', '2023-03-17T13:00:00Z', '2023-03-17T13:00:00Z'),
('note_003', 'user_009', 'lesson_004', 'Cross-contamination prevention: Separate boards (red=raw meat, blue=fish, green=veg, yellow=cooked), wash hands between tasks, clean equipment between uses', '2023-04-02T11:15:00Z', '2023-04-02T11:15:00Z'),
('note_004', 'user_014', 'lesson_009', 'HEAT method for complaints: Hear (listen fully), Empathize (show understanding), Apologize (sincerely), Take action (solve it)', '2023-04-22T11:00:00Z', '2023-04-22T11:00:00Z');

-- SEED PROMO CODES
INSERT INTO promo_codes (code_id, code, discount_type, discount_value, minimum_order_value, valid_from, valid_until, usage_limit, is_single_use, times_used, applicable_locations, applicable_products, is_active, created_at, updated_at) VALUES
('promo_001', 'WELCOME10', 'percentage', 10, 0, '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', NULL, false, 45, NULL, NULL, true, '2024-01-01T08:00:00Z', '2025-12-09T23:59:00Z'),
('promo_002', 'CORPORATE10', 'percentage', 10, 50, '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', NULL, false, 12, NULL, '["prod_017","prod_018"]', true, '2024-01-01T08:00:00Z', '2025-12-09T23:59:00Z'),
('promo_003', 'SAVE10', 'fixed', 10, 20, '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 100, false, 1, NULL, NULL, true, '2024-01-01T08:00:00Z', '2025-12-09T23:59:00Z'),
('promo_004', 'FREEDELIV', 'delivery', 0, 15, '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 200, false, 67, NULL, NULL, true, '2024-01-10T08:00:00Z', '2025-12-09T23:59:00Z'),
('promo_005', 'NEWYEAR25', 'percentage', 25, 30, '2024-01-01T00:00:00Z', '2024-01-07T23:59:59Z', 50, false, 50, '["London Flagship","Manchester Store"]', NULL, false, '2023-12-28T08:00:00Z', '2024-01-07T23:59:59Z'),
('promo_006', 'LOYALTY15', 'percentage', 15, 25, '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', NULL, false, 89, NULL, NULL, true, '2024-01-01T08:00:00Z', '2025-12-09T23:59:00Z');

-- SEED PROMO CODE USAGE
INSERT INTO promo_code_usage (usage_id, code_id, order_id, user_id, discount_applied, used_at) VALUES
('usage_001', 'promo_002', 'order_004', 'user_004', 8.50, '2024-01-12T17:00:00Z'),
('usage_002', 'promo_003', 'order_010', 'user_011', 1.25, '2024-01-14T16:45:00Z');

-- SEED DROP OF THE MONTH
INSERT INTO drop_of_the_month (drop_id, product_name, description, price, product_image_url, available_from, available_until, is_active, created_at, updated_at) VALUES
('drop_001', 'Valentine''s Heart Croissant', 'Limited edition heart-shaped croissant with strawberry cream filling and pink glaze. Only available for Valentine''s week!', 5.50, 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907', '2024-02-10T00:00:00Z', '2024-02-14T23:59:59Z', false, '2024-01-15T10:00:00Z', '2024-01-15T10:00:00Z'),
('drop_002', 'Winter Spice Loaf', 'Artisan sourdough infused with cinnamon, nutmeg, and cranberries. Perfect for the cold January days. Available all month!', 6.50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff', '2024-01-01T00:00:00Z', '2024-01-31T23:59:59Z', true, '2023-12-28T10:00:00Z', '2024-01-01T08:00:00Z');

-- SEED STALL EVENTS
INSERT INTO stall_events (event_id, event_name, venue_location, event_date, event_time, description, event_image_url, cta_button_text, cta_button_action, cta_button_url, is_visible, created_at, updated_at) VALUES
('event_001', 'Borough Market Saturday', 'Borough Market, London', '2024-01-20', '09:00-17:00', 'Find us at Borough Market this Saturday! Fresh croissants, pastries, and bread all day. Cash and card accepted.', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 'Get Directions', 'external_link', 'https://maps.google.com/?q=Borough+Market+London', true, '2024-01-10T10:00:00Z', '2024-01-10T10:00:00Z'),
('event_002', 'Manchester Food Festival', 'Piccadilly Gardens, Manchester', '2024-02-03', '10:00-18:00', 'We''re bringing our bestsellers to Manchester Food Festival! Special festival exclusive items available. Don''t miss out!', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 'Festival Info', 'external_link', 'https://www.manchesterfoodfestival.com', true, '2024-01-12T10:00:00Z', '2024-01-12T10:00:00Z'),
('event_003', 'Birmingham Christmas Market', 'Birmingham City Centre', '2023-12-20', '10:00-20:00', 'Join us at Birmingham Christmas Market for festive treats and hot drinks!', 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be', 'View Map', 'external_link', 'https://maps.google.com/?q=Birmingham+Christmas+Market', false, '2023-12-01T10:00:00Z', '2023-12-01T10:00:00Z');

-- SEED FAVORITES
INSERT INTO favorites (favorite_id, user_id, product_id, created_at) VALUES
('fav_001', 'user_001', 'prod_001', '2023-06-15T10:00:00Z'),
('fav_002', 'user_001', 'prod_008', '2023-07-20T11:30:00Z'),
('fav_003', 'user_001', 'prod_002', '2023-08-10T14:00:00Z'),
('fav_004', 'user_002', 'prod_001', '2023-07-20T12:00:00Z'),
('fav_005', 'user_002', 'prod_011', '2023-08-01T13:00:00Z'),
('fav_006', 'user_004', 'prod_015', '2023-06-01T09:30:00Z'),
('fav_007', 'user_004', 'prod_006', '2023-06-15T10:45:00Z'),
('fav_008', 'user_004', 'prod_017', '2023-07-01T11:00:00Z'),
('fav_009', 'user_010', 'prod_015', '2023-07-10T14:30:00Z'),
('fav_010', 'user_012', 'prod_008', '2023-06-20T15:00:00Z'),
('fav_011', 'user_015', 'prod_001', '2023-05-01T10:00:00Z'),
('fav_012', 'user_015', 'prod_002', '2023-05-15T11:00:00Z');

-- SEED PASSWORD RESET TOKENS
INSERT INTO password_reset_tokens (token_id, user_id, token, expires_at, is_used, created_at) VALUES
('token_001', 'user_003', 'reset_abc123def456ghi789', '2024-01-10T12:00:00Z', true, '2024-01-10T10:00:00Z'),
('token_002', 'user_005', 'reset_jkl012mno345pqr678', '2024-01-12T15:00:00Z', false, '2024-01-12T13:00:00Z'),
('token_003', 'user_011', 'reset_stu901vwx234yza567', '2024-01-15T20:00:00Z', false, '2024-01-15T18:00:00Z');

-- SEED SYSTEM SETTINGS
INSERT INTO system_settings (setting_id, setting_key, setting_value, setting_type, setting_group, updated_at) VALUES
('setting_001', 'loyalty_points_per_pound', '1', 'number', 'loyalty', '2024-01-01T08:00:00Z'),
('setting_002', 'loyalty_points_redemption_rate', '100', 'number', 'loyalty', '2024-01-01T08:00:00Z'),
('setting_003', 'minimum_order_for_delivery', '15', 'number', 'delivery', '2024-01-01T08:00:00Z'),
('setting_004', 'default_preparation_time_minutes', '20', 'number', 'orders', '2024-01-01T08:00:00Z'),
('setting_005', 'tax_rate_percentage', '20', 'number', 'financial', '2024-01-01T08:00:00Z'),
('setting_006', 'max_failed_login_attempts', '5', 'number', 'security', '2024-01-01T08:00:00Z'),
('setting_007', 'account_lockout_duration_minutes', '30', 'number', 'security', '2024-01-01T08:00:00Z'),
('setting_008', 'password_reset_token_validity_hours', '2', 'number', 'security', '2024-01-01T08:00:00Z'),
('setting_009', 'company_email', 'info@bakery.com', 'string', 'general', '2024-01-01T08:00:00Z'),
('setting_010', 'company_phone', '+442071234567', 'string', 'general', '2024-01-01T08:00:00Z'),
('setting_011', 'enable_loyalty_program', 'true', 'boolean', 'loyalty', '2024-01-01T08:00:00Z'),
('setting_012', 'enable_corporate_orders', 'true', 'boolean', 'orders', '2024-01-01T08:00:00Z');

-- SEED AUDIT LOGS
INSERT INTO audit_logs (log_id, user_id, action_type, entity_type, entity_id, old_value, new_value, ip_address, user_agent, created_at) VALUES
('audit_001', 'user_006', 'update', 'product', 'prod_001', '{"price":3.75}', '{"price":3.50}', '192.168.1.100', 'Mozilla/5.0', '2024-01-15T09:00:00Z'),
('audit_002', 'user_007', 'create', 'promo_code', 'promo_004', NULL, '{"code":"FREEDELIV","discount_type":"delivery","discount_value":0}', '192.168.1.101', 'Mozilla/5.0', '2024-01-10T08:00:00Z'),
('audit_003', 'user_006', 'update', 'system_settings', 'setting_001', '{"setting_value":"0.5"}', '{"setting_value":"1"}', '192.168.1.100', 'Mozilla/5.0', '2024-01-01T08:00:00Z'),
('audit_004', 'user_007', 'update', 'order', 'order_001', '{"order_status":"preparing"}', '{"order_status":"out_for_delivery"}', '192.168.1.102', 'Mozilla/5.0', '2024-01-10T11:30:00Z'),
('audit_005', 'user_006', 'create', 'training_course', 'course_005', NULL, '{"course_title":"Allergen Awareness & Management","status":"published"}', '192.168.1.100', 'Mozilla/5.0', '2023-01-10T09:00:00Z');

-- SEED SESSIONS
INSERT INTO sessions (session_id, user_id, token, remember_me, expires_at, last_activity_at, ip_address, user_agent, created_at) VALUES
('session_001', 'user_001', 'sess_abc123def456ghi789jkl012', false, '2024-01-16T10:30:00Z', '2024-01-15T10:30:00Z', '192.168.1.50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-01-15T10:30:00Z'),
('session_002', 'user_006', 'sess_mno345pqr678stu901vwx234', true, '2024-02-14T07:00:00Z', '2024-01-15T07:00:00Z', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', '2024-01-15T07:00:00Z'),
('session_003', 'user_007', 'sess_yza567bcd890efg123hij456', false, '2024-01-16T07:30:00Z', '2024-01-15T07:30:00Z', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2024-01-15T07:30:00Z'),
('session_004', 'user_002', 'sess_klm789nop012qrs345tuv678', false, '2024-01-16T14:20:00Z', '2024-01-15T14:20:00Z', '192.168.1.55', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)', '2024-01-14T14:20:00Z');

-- SEED NOTIFICATIONS
INSERT INTO notifications (notification_id, user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, read_at, created_at) VALUES
('notif_001', 'user_001', 'order_update', 'Order Delivered', 'Your order ORD-2024-0001 has been delivered successfully!', 'order', 'order_001', true, '2024-01-10T13:00:00Z', '2024-01-10T12:45:00Z'),
('notif_002', 'user_002', 'order_update', 'Order Ready', 'Your order ORD-2024-0002 is ready for collection!', 'order', 'order_002', true, '2024-01-11T14:05:00Z', '2024-01-11T14:00:00Z'),
('notif_003', 'user_004', 'loyalty_points', 'Points Earned', 'You earned 77 loyalty points from your recent order!', 'order', 'order_004', true, '2024-01-13T11:00:00Z', '2024-01-13T10:00:00Z'),
('notif_004', 'user_001', 'promo_code', 'New Promo Code', 'Use code WELCOME10 for 10% off your next order!', 'promo', 'promo_001', false, NULL, '2024-01-14T10:00:00Z'),
('notif_005', 'user_015', 'order_update', 'Order Ready for Collection', 'Your celebration cake is ready! Collection code: 1009', 'order', 'order_009', true, '2024-01-15T14:10:00Z', '2024-01-15T14:00:00Z'),
('notif_006', 'user_008', 'staff', 'New Feedback Submitted', 'Equipment issue reported - check staff feedback SF-2024-0001', 'staff_feedback', 'sf_001', true, '2024-01-10T09:30:00Z', '2024-01-10T09:00:00Z'),
('notif_007', 'user_006', 'staff', 'Inventory Alert', 'Low stock alert for Premium French Butter at London Flagship', 'inventory', 'ia_001', true, '2024-01-12T09:00:00Z', '2024-01-12T08:30:00Z'),
('notif_008', 'user_012', 'order_update', 'Order In Progress', 'Your order ORD-2024-0008 is being prepared', 'order', 'order_008', false, NULL, '2024-01-15T12:15:00Z');

-- SEED EMAIL LOGS
INSERT INTO email_logs (email_id, recipient_email, email_type, subject, template_used, related_order_id, status, sent_at, error_message, created_at) VALUES
('email_001', 'john.smith@example.com', 'order_confirmation', 'Order Confirmation - ORD-2024-0001', 'order_confirmation_v2', 'order_001', 'sent', '2024-01-10T10:16:00Z', NULL, '2024-01-10T10:16:00Z'),
('email_002', 'john.smith@example.com', 'order_delivery', 'Your Order Has Been Delivered', 'delivery_confirmation_v1', 'order_001', 'sent', '2024-01-10T12:46:00Z', NULL, '2024-01-10T12:46:00Z'),
('email_003', 'sarah.jones@example.com', 'order_confirmation', 'Order Confirmation - ORD-2024-0002', 'order_confirmation_v2', 'order_002', 'sent', '2024-01-11T13:31:00Z', NULL, '2024-01-11T13:31:00Z'),
('email_004', 'sarah.jones@example.com', 'order_ready', 'Your Order is Ready for Collection', 'collection_ready_v1', 'order_002', 'sent', '2024-01-11T14:01:00Z', NULL, '2024-01-11T14:01:00Z'),
('email_005', 'emma.brown@example.com', 'order_confirmation', 'Corporate Order Confirmation - ORD-2024-0004', 'corporate_order_confirmation_v1', 'order_004', 'sent', '2024-01-12T17:01:00Z', NULL, '2024-01-12T17:01:00Z'),
('email_006', 'emma.brown@example.com', 'feedback_request', 'How was your recent order?', 'feedback_request_v2', 'order_004', 'sent', '2024-01-13T12:00:00Z', NULL, '2024-01-13T12:00:00Z'),
('email_007', 'charlotte.thomas@example.com', 'order_confirmation', 'Celebration Cake Order Confirmation', 'celebration_order_v1', 'order_009', 'sent', '2024-01-13T10:01:00Z', NULL, '2024-01-13T10:01:00Z'),
('email_008', 'jessica.white@example.com', 'order_confirmation', 'Order Confirmation - ORD-2024-0008', 'order_confirmation_v2', 'order_008', 'sent', '2024-01-15T12:11:00Z', NULL, '2024-01-15T12:11:00Z'),
('email_009', 'mike.williams@example.com', 'password_reset', 'Reset Your Password', 'password_reset_v1', NULL, 'sent', '2024-01-10T10:05:00Z', NULL, '2024-01-10T10:05:00Z'),
('email_010', 'newsletter@bakery.com', 'marketing', 'January Newsletter - Winter Specials', 'newsletter_v1', NULL, 'failed', NULL, 'Invalid recipient address', '2024-01-15T08:00:00Z');

-- SEED REFUNDS
INSERT INTO refunds (refund_id, order_id, refund_amount, refund_type, refund_reason, refund_items, payment_transaction_id, processed_by_user_id, status, processed_at, created_at) VALUES
('refund_001', 'order_003', 4.25, 'partial', 'Item out of stock', '["prod_002"]', 'txn_mno345pqr678', 'user_007', 'completed', '2024-01-12T17:00:00Z', '2024-01-12T16:45:00Z'),
('refund_002', 'order_012', 25.99, 'full', 'Customer cancelled within timeframe', NULL, 'txn_cde567fgh890', 'user_007', 'completed', '2024-01-13T10:30:00Z', '2024-01-13T10:15:00Z');

-- SEED ANALYTICS SNAPSHOTS
INSERT INTO analytics_snapshots (snapshot_id, snapshot_date, snapshot_type, location_name, metrics, created_at) VALUES
('snap_001', '2024-01-14', 'daily_sales', 'London Flagship', '{"total_orders":28,"total_revenue":456.75,"avg_order_value":16.31,"top_product":"prod_001","top_category":"pastries"}', '2024-01-15T00:05:00Z'),
('snap_002', '2024-01-14', 'daily_sales', 'Manchester Store', '{"total_orders":15,"total_revenue":234.50,"avg_order_value":15.63,"top_product":"prod_003","top_category":"breads"}', '2024-01-15T00:05:00Z'),
('snap_003', '2024-01-14', 'daily_sales', 'Birmingham Store', '{"total_orders":12,"total_revenue":189.25,"avg_order_value":15.77,"top_product":"prod_001","top_category":"pastries"}', '2024-01-15T00:05:00Z'),
('snap_004', '2024-01-14', 'inventory', 'London Flagship', '{"low_stock_items":["prod_010","prod_015"],"out_of_stock_items":[],"total_products":20}', '2024-01-15T00:10:00Z'),
('snap_005', '2024-01-13', 'daily_sales', 'London Flagship', '{"total_orders":32,"total_revenue":523.40,"avg_order_value":16.36,"top_product":"prod_001","top_category":"pastries"}', '2024-01-14T00:05:00Z'),
('snap_006', '2024-01-13', 'customer_satisfaction', NULL, '{"avg_rating":4.6,"total_feedback":5,"positive_feedback":4,"negative_feedback":0}', '2024-01-14T00:15:00Z'),
('snap_007', '2024-01-12', 'daily_sales', 'London Flagship', '{"total_orders":25,"total_revenue":398.60,"avg_order_value":15.94,"top_product":"prod_006","top_category":"pastries"}', '2024-01-13T00:05:00Z'),
('snap_008', '2024-01-12', 'staff_training', NULL, '{"courses_completed":2,"staff_in_training":3,"avg_completion_rate":75}', '2024-01-13T00:20:00Z');

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_staff_assignments_user_id ON staff_assignments(user_id);
CREATE INDEX idx_staff_assignments_location ON staff_assignments(location_name);
CREATE INDEX idx_locations_name ON locations(location_name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_product_locations_product_id ON product_locations(product_id);
CREATE INDEX idx_product_locations_location ON product_locations(location_name);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_location ON orders(location_name);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_points_transactions(user_id);
CREATE INDEX idx_customer_feedback_order_id ON customer_feedback(order_id);
CREATE INDEX idx_customer_feedback_user_id ON customer_feedback(user_id);
CREATE INDEX idx_staff_feedback_location ON staff_feedback(location_name);
CREATE INDEX idx_staff_feedback_status ON staff_feedback(status);
CREATE INDEX idx_inventory_alerts_location ON inventory_alerts(location_name);
CREATE INDEX idx_inventory_alerts_status ON inventory_alerts(status);
CREATE INDEX idx_training_lessons_course_id ON training_lessons(course_id);
CREATE INDEX idx_staff_course_progress_user_id ON staff_course_progress(user_id);
CREATE INDEX idx_staff_course_progress_course_id ON staff_course_progress(course_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_code_usage_code_id ON promo_code_usage(code_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_email_logs_order_id ON email_logs(related_order_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);