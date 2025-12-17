-- Migration 009: Add external_providers JSON field to locations table
-- This allows storing multiple external delivery service providers per location

-- Add the external_providers column as a JSON text field
ALTER TABLE locations ADD COLUMN IF NOT EXISTS external_providers TEXT;

-- Migrate existing just_eat_url and deliveroo_url to the new external_providers format
-- for locations that have them configured
UPDATE locations 
SET external_providers = (
  SELECT json_agg(provider ORDER BY provider->>'display_order')
  FROM (
    SELECT json_build_object(
      'name', 'Just Eat',
      'url', just_eat_url,
      'display_order', 1,
      'is_active', true
    ) AS provider
    WHERE just_eat_url IS NOT NULL AND just_eat_url != ''
    UNION ALL
    SELECT json_build_object(
      'name', 'Deliveroo',
      'url', deliveroo_url,
      'display_order', 2,
      'is_active', true
    ) AS provider
    WHERE deliveroo_url IS NOT NULL AND deliveroo_url != ''
  ) providers
)
WHERE (just_eat_url IS NOT NULL AND just_eat_url != '') 
   OR (deliveroo_url IS NOT NULL AND deliveroo_url != '');
