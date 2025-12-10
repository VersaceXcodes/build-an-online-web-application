-- ============================================
-- UNIFIED FEEDBACK SYSTEM
-- ============================================

-- Drop existing unified feedback table if exists
DROP TABLE IF EXISTS feedback_timeline CASCADE;
DROP TABLE IF EXISTS unified_feedback CASCADE;

-- Create unified feedback table
CREATE TABLE unified_feedback (
    feedback_id TEXT PRIMARY KEY,
    created_by_user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_by_role TEXT NOT NULL CHECK (created_by_role IN ('customer', 'staff', 'manager')),
    location TEXT NOT NULL CHECK (location IN ('Blanchardstown', 'Tallaght', 'Glasnevin', 'All')),
    order_id TEXT REFERENCES orders(order_id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('Complaint', 'Suggestion', 'Compliment', 'Operations', 'Product', 'Delivery', 'Other')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Low' CHECK (priority IN ('Low', 'Medium', 'High')),
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Review', 'Resolved', 'Closed')),
    assigned_to_user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    internal_notes TEXT,
    public_response TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    resolved_at TEXT
);

-- Create feedback timeline table for tracking changes
CREATE TABLE feedback_timeline (
    timeline_id TEXT PRIMARY KEY,
    feedback_id TEXT NOT NULL REFERENCES unified_feedback(feedback_id) ON DELETE CASCADE,
    changed_by_user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('status_change', 'priority_change', 'assignment', 'note_added', 'response_added')),
    old_value TEXT,
    new_value TEXT,
    notes TEXT,
    changed_at TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_unified_feedback_created_by ON unified_feedback(created_by_user_id);
CREATE INDEX idx_unified_feedback_role ON unified_feedback(created_by_role);
CREATE INDEX idx_unified_feedback_location ON unified_feedback(location);
CREATE INDEX idx_unified_feedback_category ON unified_feedback(category);
CREATE INDEX idx_unified_feedback_status ON unified_feedback(status);
CREATE INDEX idx_unified_feedback_priority ON unified_feedback(priority);
CREATE INDEX idx_unified_feedback_assigned_to ON unified_feedback(assigned_to_user_id);
CREATE INDEX idx_unified_feedback_created_at ON unified_feedback(created_at);
CREATE INDEX idx_feedback_timeline_feedback_id ON feedback_timeline(feedback_id);
CREATE INDEX idx_feedback_timeline_changed_at ON feedback_timeline(changed_at);
