-- Migration: Update all location details with proper addresses and opening hours
-- Created: 2025-12-15
-- Description: Sets proper address details and opening hours for all three Irish locations

-- Update Blanchardstown location details
UPDATE locations 
SET 
  address_line1 = 'Unit 12, Blanchardstown Shopping Centre',
  address_line2 = 'Blanchardstown',
  city = 'Dublin 15',
  postal_code = 'D15 X20F',
  country = 'Ireland',
  phone_number = '+353 1 820 3456',
  email = 'blanchardstown@kake.ie'
WHERE location_name = 'Blanchardstown';

-- Update Tallaght location details
UPDATE locations 
SET 
  address_line1 = 'Unit 45, The Square Shopping Centre',
  address_line2 = 'Tallaght',
  city = 'Dublin 24',
  postal_code = 'D24 FP89',
  country = 'Ireland',
  phone_number = '+353 1 462 8970',
  email = 'tallaght@kake.ie'
WHERE location_name = 'Tallaght';

-- Update Glasnevin location details
UPDATE locations 
SET 
  address_line1 = '156 Botanic Road',
  address_line2 = 'Glasnevin',
  city = 'Dublin 9',
  postal_code = 'D09 C2R8',
  country = 'Ireland',
  phone_number = '+353 1 830 5421',
  email = 'glasnevin@kake.ie'
WHERE location_name = 'Glasnevin';

-- Function to insert opening hours for a location
DO $$
DECLARE
  loc_id TEXT;
  hour_id TEXT;
  v_now TEXT;
BEGIN
  v_now := NOW()::TEXT;
  
  -- Blanchardstown opening hours (Monday-Saturday 9:00-18:00, Sunday closed)
  SELECT location_id INTO loc_id FROM locations WHERE location_name = 'Blanchardstown';
  IF loc_id IS NOT NULL THEN
    -- Delete existing opening hours
    DELETE FROM opening_hours WHERE location_id = loc_id;
    
    -- Sunday - Closed
    INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
    VALUES ('oh_blanch_sun_' || SUBSTR(MD5(RANDOM()::text), 1, 8), loc_id, 0, NULL, NULL, true, v_now, v_now);
    
    -- Monday to Saturday - 9:00-18:00
    FOR i IN 1..6 LOOP
      INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
      VALUES ('oh_blanch_' || i || '_' || SUBSTR(MD5(RANDOM()::text), 1, 8), loc_id, i, '09:00', '18:00', false, v_now, v_now);
    END LOOP;
  END IF;
  
  -- Tallaght opening hours (Monday-Saturday 9:00-19:00, Sunday 11:00-17:00)
  SELECT location_id INTO loc_id FROM locations WHERE location_name = 'Tallaght';
  IF loc_id IS NOT NULL THEN
    -- Delete existing opening hours
    DELETE FROM opening_hours WHERE location_id = loc_id;
    
    -- Sunday - 11:00-17:00
    INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
    VALUES ('oh_tallaght_sun_' || SUBSTR(MD5(RANDOM()::text), 1, 8), loc_id, 0, '11:00', '17:00', false, v_now, v_now);
    
    -- Monday to Saturday - 9:00-19:00
    FOR i IN 1..6 LOOP
      INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
      VALUES ('oh_tallaght_' || i || '_' || SUBSTR(MD5(RANDOM()::text), 1, 8), loc_id, i, '09:00', '19:00', false, v_now, v_now);
    END LOOP;
  END IF;
  
  -- Glasnevin opening hours (Tuesday-Saturday 10:00-18:00, Sunday-Monday closed)
  SELECT location_id INTO loc_id FROM locations WHERE location_name = 'Glasnevin';
  IF loc_id IS NOT NULL THEN
    -- Delete existing opening hours
    DELETE FROM opening_hours WHERE location_id = loc_id;
    
    -- Sunday - Closed
    INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
    VALUES ('oh_glasnevin_sun_' || SUBSTR(MD5(RANDOM()::text), 1, 8), loc_id, 0, NULL, NULL, true, v_now, v_now);
    
    -- Monday - Closed
    INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
    VALUES ('oh_glasnevin_mon_' || SUBSTR(MD5(RANDOM()::text), 1, 8), loc_id, 1, NULL, NULL, true, v_now, v_now);
    
    -- Tuesday to Saturday - 10:00-18:00
    FOR i IN 2..6 LOOP
      INSERT INTO opening_hours (id, location_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at)
      VALUES ('oh_glasnevin_' || i || '_' || SUBSTR(MD5(RANDOM()::text), 1, 8), loc_id, i, '10:00', '18:00', false, v_now, v_now);
    END LOOP;
  END IF;
END $$;
