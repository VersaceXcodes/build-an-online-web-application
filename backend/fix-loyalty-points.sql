-- Fix loyalty points for user_001
-- First, let's recalculate the correct balance based on all transactions

-- Check current state
SELECT user_id, email, loyalty_points_balance FROM users WHERE user_id = 'user_001';

-- Check all transactions for user_001
SELECT 
    transaction_id, 
    transaction_type, 
    points_change, 
    balance_after, 
    order_id, 
    description, 
    created_at 
FROM loyalty_points_transactions 
WHERE user_id = 'user_001' 
ORDER BY created_at ASC;

-- Calculate the correct balance
-- Based on the seed data:
-- lpt_001: earned 15, balance should be 15
-- lpt_008: earned 7, balance should be 22
-- lpt_013: manual_adjustment 428, balance should be 450

-- Update the user's loyalty points balance to match the last transaction
UPDATE users 
SET loyalty_points_balance = 450, 
    updated_at = NOW()::TEXT 
WHERE user_id = 'user_001';

-- Verify the fix
SELECT user_id, email, loyalty_points_balance FROM users WHERE user_id = 'user_001';
