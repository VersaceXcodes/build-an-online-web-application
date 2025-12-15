-- Migration: Create homepage_corporate_section table
-- This table manages the "Corporate & Event Orders" section on the landing page

CREATE TABLE IF NOT EXISTS homepage_corporate_section (
  id SERIAL PRIMARY KEY DEFAULT 1,
  section_title VARCHAR(255) NOT NULL DEFAULT 'Corporate & Event Orders',
  section_subtitle TEXT,
  card_title VARCHAR(255) NOT NULL,
  card_description TEXT NOT NULL,
  card_image_url TEXT NOT NULL,
  special_price VARCHAR(50),
  available_until VARCHAR(100),
  cta_text VARCHAR(100) NOT NULL DEFAULT 'Pre-order Now',
  cta_link VARCHAR(500) NOT NULL DEFAULT '/corporate-order',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure only one record exists
  CONSTRAINT single_record CHECK (id = 1)
);

-- Seed with default content (matching current hard-coded values from UV_Landing.tsx)
INSERT INTO homepage_corporate_section (
  id,
  section_title,
  section_subtitle,
  card_title,
  card_description,
  card_image_url,
  special_price,
  available_until,
  cta_text,
  cta_link,
  is_enabled
) VALUES (
  1,
  'Corporate & Event Orders',
  'Make your special occasions unforgettable with our bespoke dessert offerings',
  'Winter Spice Loaf',
  'Elevate your corporate events, celebrations, and special occasions with our custom dessert solutions. From intimate meetings to large gatherings, we create memorable sweet moments.',
  'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
  '€24.99',
  'Dec 31',
  'Pre-order Now',
  '/corporate-order',
  true
)
ON CONFLICT (id) DO NOTHING;
