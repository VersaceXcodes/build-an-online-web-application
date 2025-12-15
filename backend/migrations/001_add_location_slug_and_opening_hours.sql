-- ============================================
-- PHASE 1: Location Details Admin Management
-- Migration: Add slug field and opening_hours table
-- ============================================

-- Add slug field to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug (after we populate it)
-- CREATE UNIQUE INDEX IF NOT EXISTS locations_slug_unique ON locations(slug);

-- Create opening_hours table for structured storage
CREATE TABLE IF NOT EXISTS opening_hours (
    id TEXT PRIMARY KEY,
    location_id TEXT NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    opens_at TEXT,
    closes_at TEXT,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(location_id, day_of_week)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS opening_hours_location_idx ON opening_hours(location_id);

-- Add active flag to locations if it doesn't exist
ALTER TABLE locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Comments for documentation
COMMENT ON COLUMN locations.slug IS 'URL-friendly slug for location (e.g., "blanchardstown")';
COMMENT ON TABLE opening_hours IS 'Structured opening hours for locations by day of week (0=Sunday, 6=Saturday)';
COMMENT ON COLUMN opening_hours.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
COMMENT ON COLUMN opening_hours.is_closed IS 'True if location is closed on this day';
