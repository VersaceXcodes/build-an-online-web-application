-- Migration: Add ticket system fields to orders table
-- Date: 2025-12-17
-- Description: Adds ticket_number, ticket_token, and confirmation_viewed_at for the order confirmation ticket system

-- Add ticket_number column (unique human-readable ticket ID like KK-54759)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE;

-- Add ticket_token column (secure random token for QR code scanning)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ticket_token TEXT UNIQUE;

-- Add confirmation_viewed_at column (timestamp when customer first viewed confirmation)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_viewed_at TEXT;

-- Create index on ticket_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_ticket_number ON orders(ticket_number);

-- Create index on ticket_token for fast QR code scan lookups
CREATE INDEX IF NOT EXISTS idx_orders_ticket_token ON orders(ticket_token);

-- Generate ticket numbers and tokens for existing orders that don't have them
-- This uses a combination of order prefix and a random number
DO $$
DECLARE
    order_record RECORD;
    new_ticket_number TEXT;
    new_ticket_token TEXT;
    counter INTEGER := 0;
BEGIN
    FOR order_record IN SELECT order_id FROM orders WHERE ticket_number IS NULL LOOP
        -- Generate ticket number: KK-XXXXX (5 random digits)
        LOOP
            new_ticket_number := 'KK-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
            EXIT WHEN NOT EXISTS (SELECT 1 FROM orders WHERE ticket_number = new_ticket_number);
        END LOOP;
        
        -- Generate ticket token: 32 character random hex string
        new_ticket_token := encode(gen_random_bytes(16), 'hex');
        
        UPDATE orders 
        SET ticket_number = new_ticket_number, ticket_token = new_ticket_token 
        WHERE order_id = order_record.order_id;
        
        counter := counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Updated % existing orders with ticket numbers and tokens', counter;
END $$;
