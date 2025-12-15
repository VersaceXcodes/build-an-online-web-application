-- ============================================
-- PHASE 1: Location Details Admin Management
-- Seed Data: Populate slugs and opening hours for existing locations
-- ============================================

-- Update existing locations with slugs (derived from location_name)
UPDATE locations SET slug = 'blanchardstown' WHERE location_name = 'Blanchardstown';
UPDATE locations SET slug = 'tallaght' WHERE location_name = 'Tallaght';
UPDATE locations SET slug = 'glasnevin' WHERE location_name = 'Glasnevin';
UPDATE locations SET slug = 'london-flagship' WHERE location_name = 'London Flagship';

-- Now create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS locations_slug_unique ON locations(slug);

-- Seed opening hours from existing JSON data
-- This is a migration helper - in production, you'd parse the JSON and insert accordingly
-- For now, we'll insert default hours (9:00 AM - 6:00 PM, Monday-Saturday, Closed Sunday)

-- Helper function to generate opening_hours ID
-- Uses format: oh_<location_id>_<day>

-- Blanchardstown hours (example - adjust based on actual data)
DO $$
DECLARE
    loc_id TEXT;
    day_num INTEGER;
BEGIN
    -- Get location IDs
    FOR loc_id IN SELECT location_id FROM locations WHERE slug IN ('blanchardstown', 'tallaght', 'glasnevin', 'london-flagship')
    LOOP
        -- Insert hours for Monday-Saturday (days 1-6)
        FOR day_num IN 1..6
        LOOP
            INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
            VALUES (
                'oh_' || substring(loc_id from 1 for 8) || '_' || day_num::TEXT,
                loc_id,
                day_num,
                '09:00',
                '18:00',
                false,
                NOW()::TEXT,
                NOW()::TEXT
            )
            ON CONFLICT (location_id, day_of_week) DO NOTHING;
        END LOOP;
        
        -- Insert Sunday (day 0) as closed
        INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
        VALUES (
            'oh_' || substring(loc_id from 1 for 8) || '_0',
            loc_id,
            0,
            NULL,
            NULL,
            true,
            NOW()::TEXT,
            NOW()::TEXT
        )
        ON CONFLICT (location_id, day_of_week) DO NOTHING;
    END LOOP;
END $$;

-- Mark all existing locations as active
UPDATE locations SET is_active = true WHERE is_active IS NULL;
