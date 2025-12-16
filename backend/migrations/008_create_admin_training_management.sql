-- Migration: Admin Training Management System
-- Creates tables for training courses and staff assignments with progress tracking

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS staff_training_assignments CASCADE;
DROP TABLE IF EXISTS admin_training_courses CASCADE;

-- Create training_courses table for admin-managed training
CREATE TABLE IF NOT EXISTS admin_training_courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    duration_minutes INTEGER,
    is_required_global BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    content_type TEXT DEFAULT 'text',
    content_url TEXT,
    content_body TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create indexes for training_courses
CREATE INDEX IF NOT EXISTS idx_admin_training_courses_category ON admin_training_courses(category);
CREATE INDEX IF NOT EXISTS idx_admin_training_courses_is_active ON admin_training_courses(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_training_courses_is_required_global ON admin_training_courses(is_required_global);

-- Create staff_training_assignments table
CREATE TABLE IF NOT EXISTS staff_training_assignments (
    id TEXT PRIMARY KEY,
    staff_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES admin_training_courses(id) ON DELETE CASCADE,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    started_at TEXT,
    completed_at TEXT,
    last_viewed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(staff_user_id, course_id)
);

-- Create indexes for staff_training_assignments
CREATE INDEX IF NOT EXISTS idx_staff_training_assignments_staff ON staff_training_assignments(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_training_assignments_course ON staff_training_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_staff_training_assignments_status ON staff_training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_staff_training_assignments_is_required ON staff_training_assignments(is_required);

-- Insert some sample training courses
INSERT INTO admin_training_courses (id, title, description, category, duration_minutes, is_required_global, is_active, content_type, content_body, created_at, updated_at)
VALUES 
    ('tc_001', 'Food Safety Fundamentals', 'Learn the basics of food safety and hygiene in a commercial kitchen environment. This course covers essential practices for handling, storing, and preparing food safely.', 'safety', 60, true, true, 'text', 'Welcome to Food Safety Fundamentals!\n\nThis course covers:\n1. Personal Hygiene\n2. Food Storage Guidelines\n3. Temperature Control\n4. Cross-contamination Prevention\n5. Cleaning and Sanitizing\n\nBy the end of this course, you will understand the key principles of food safety that are essential for working in our bakery.', NOW()::TEXT, NOW()::TEXT),
    
    ('tc_002', 'Customer Service Excellence', 'Master the art of providing exceptional customer service at Kake. Learn how to handle customer inquiries, complaints, and create memorable experiences.', 'customer_service', 45, true, true, 'text', 'Customer Service Excellence Training\n\nTopics covered:\n1. Greeting customers warmly\n2. Product knowledge and recommendations\n3. Handling special requests\n4. Managing complaints professionally\n5. Creating memorable experiences\n\nRemember: Every customer interaction is an opportunity to make someone''s day better!', NOW()::TEXT, NOW()::TEXT),
    
    ('tc_003', 'Cake Decorating Basics', 'Introduction to basic cake decorating techniques used at Kake. Perfect for new team members working in production.', 'baking', 90, false, true, 'text', 'Cake Decorating Basics\n\nIn this module, you will learn:\n1. Basic icing techniques\n2. Using a piping bag\n3. Simple decorative elements\n4. Color mixing for icings\n5. Presentation standards\n\nPractice makes perfect - don''t be afraid to experiment!', NOW()::TEXT, NOW()::TEXT),
    
    ('tc_004', 'Health & Safety in the Workplace', 'Essential health and safety guidelines for working at Kake. Covers workplace hazards, emergency procedures, and safety protocols.', 'safety', 30, true, true, 'text', 'Health & Safety Guidelines\n\nKey areas:\n1. Identifying workplace hazards\n2. Proper lifting techniques\n3. Emergency evacuation procedures\n4. First aid basics\n5. Reporting incidents\n\nYour safety is our priority!', NOW()::TEXT, NOW()::TEXT),
    
    ('tc_005', 'Till Operations', 'Learn how to operate the point of sale system, process payments, and handle cash responsibly.', 'equipment', 30, false, true, 'text', 'Till Operations Training\n\nYou will learn:\n1. POS system navigation\n2. Processing different payment types\n3. Applying discounts and promo codes\n4. Handling cash and giving change\n5. End of day reconciliation\n\nAccuracy and attention to detail are key!', NOW()::TEXT, NOW()::TEXT);

-- Function to auto-assign global required courses to new staff
-- Note: This would typically be triggered via application logic when a staff user is created
