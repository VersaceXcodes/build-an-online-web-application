-- Update WELCOME10 promo code to remove minimum order requirement for testing
UPDATE promo_codes 
SET minimum_order_value = 0, 
    updated_at = NOW() 
WHERE code = 'WELCOME10';

-- Verify the update
SELECT code, discount_type, discount_value, minimum_order_value, is_active 
FROM promo_codes 
WHERE code = 'WELCOME10';
