-- Migration 010: Add ordering_mode field to locations table
-- This allows configuring whether a location uses internal (Kake) ordering or external-only (3rd party) ordering

-- Add the ordering_mode column with default 'internal' for existing locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS ordering_mode TEXT NOT NULL DEFAULT 'internal';

-- Set Glasnevin to external_only mode since it already uses external providers
UPDATE locations 
SET ordering_mode = 'external_only'
WHERE location_name = 'Glasnevin';
