-- Fix promo code expiry dates for testing
-- Update WELCOME10 to be valid until end of 2025
UPDATE promo_codes 
SET valid_until = '2025-12-31T23:59:59Z',
    updated_at = '2025-12-09T23:59:00Z'
WHERE code = 'WELCOME10';

-- Update other promo codes to have valid dates in 2025
UPDATE promo_codes 
SET valid_from = '2025-01-01T00:00:00Z',
    valid_until = '2025-12-31T23:59:59Z',
    updated_at = '2025-12-09T23:59:00Z'
WHERE code IN ('CORPORATE10', 'LOYALTY15');

-- Update SAVE10 to be valid for all of 2025
UPDATE promo_codes 
SET valid_from = '2025-01-01T00:00:00Z',
    valid_until = '2025-12-31T23:59:59Z',
    updated_at = '2025-12-09T23:59:00Z'
WHERE code = 'SAVE10';

-- Update FREEDELIV to be valid through December 2025
UPDATE promo_codes 
SET valid_from = '2025-01-01T00:00:00Z',
    valid_until = '2025-12-31T23:59:59Z',
    updated_at = '2025-12-09T23:59:00Z'
WHERE code = 'FREEDELIV';

-- Display updated promo codes to verify
SELECT code, valid_from, valid_until, is_active 
FROM promo_codes 
WHERE is_active = true
ORDER BY code;
