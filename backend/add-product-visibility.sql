-- Add is_visible column to products table
ALTER TABLE products ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;

-- Update existing products to be visible by default
UPDATE products SET is_visible = true WHERE is_visible IS NULL;
