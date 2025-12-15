-- Add Drop of the Month fields to stall_events table
ALTER TABLE stall_events 
ADD COLUMN IF NOT EXISTS is_drop_of_the_month BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS special_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS available_until TEXT,
ADD COLUMN IF NOT EXISTS preorder_button_label TEXT,
ADD COLUMN IF NOT EXISTS preorder_button_url TEXT;
