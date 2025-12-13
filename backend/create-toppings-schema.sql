-- ============================================
-- TOPPINGS AND SAUCES SCHEMA
-- ============================================

-- Create toppings table
CREATE TABLE IF NOT EXISTS toppings (
  topping_id VARCHAR(255) PRIMARY KEY,
  topping_name VARCHAR(255) NOT NULL,
  topping_type VARCHAR(50) NOT NULL CHECK (topping_type IN ('topping', 'sauce')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  is_available BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create product_toppings junction table (which toppings are available for which products)
CREATE TABLE IF NOT EXISTS product_toppings (
  assignment_id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  topping_id VARCHAR(255) NOT NULL REFERENCES toppings(topping_id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, topping_id)
);

-- Create order_item_toppings table (which toppings were selected for order items)
CREATE TABLE IF NOT EXISTS order_item_toppings (
  order_item_topping_id VARCHAR(255) PRIMARY KEY,
  item_id VARCHAR(255) NOT NULL REFERENCES order_items(item_id) ON DELETE CASCADE,
  topping_id VARCHAR(255) NOT NULL REFERENCES toppings(topping_id) ON DELETE RESTRICT,
  topping_name VARCHAR(255) NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_toppings_type ON toppings(topping_type);
CREATE INDEX IF NOT EXISTS idx_toppings_available ON toppings(is_available);
CREATE INDEX IF NOT EXISTS idx_product_toppings_product ON product_toppings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_toppings_topping ON product_toppings(topping_id);
CREATE INDEX IF NOT EXISTS idx_order_item_toppings_item ON order_item_toppings(item_id);

-- Insert default toppings
INSERT INTO toppings (topping_id, topping_name, topping_type, price, is_available, display_order) VALUES
  ('top_001', 'Kinder Bueno', 'topping', 0.00, true, 1),
  ('top_002', 'White Kinder Bueno', 'topping', 0.00, true, 2),
  ('top_003', 'Kinder Bar', 'topping', 0.00, true, 3),
  ('top_004', 'Kinder Hippo', 'topping', 0.00, true, 4),
  ('top_005', 'Milky Bar', 'topping', 0.00, true, 5),
  ('top_006', 'Crushed Smarties', 'topping', 0.00, true, 6),
  ('top_007', 'Crunchie', 'topping', 0.00, true, 7),
  ('top_008', 'Maltesers', 'topping', 0.00, true, 8),
  ('top_009', 'Oreo Crumbs', 'topping', 0.00, true, 9),
  ('top_010', 'Biscoff Crumbs', 'topping', 0.00, true, 10),
  ('top_011', 'Caramel Fredo', 'topping', 0.00, true, 11),
  ('top_012', 'Flake', 'topping', 0.00, true, 12)
ON CONFLICT (topping_id) DO NOTHING;

INSERT INTO toppings (topping_id, topping_name, topping_type, price, is_available, display_order) VALUES
  ('sau_001', 'Bueno Sauce', 'sauce', 0.00, true, 1),
  ('sau_002', 'White Chocolate Sauce', 'sauce', 0.00, true, 2),
  ('sau_003', 'Chocolate Sauce', 'sauce', 0.00, true, 3),
  ('sau_004', 'Caramel Biscoff', 'sauce', 0.00, true, 4),
  ('sau_005', 'Dubai Pistachio', 'sauce', 2.00, true, 5)
ON CONFLICT (topping_id) DO NOTHING;
