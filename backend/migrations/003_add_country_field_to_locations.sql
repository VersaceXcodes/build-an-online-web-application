-- Migration: Add country field to locations table
-- Created: 2025-12-15
-- Description: Adds a country field to the locations table for complete address information

-- Add country column to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Ireland';

-- Update existing locations to have Ireland as country
UPDATE locations SET country = 'Ireland' WHERE country IS NULL;

-- Make country NOT NULL after setting default values
ALTER TABLE locations ALTER COLUMN country SET NOT NULL;
