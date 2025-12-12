-- ============================================
-- KAKE MENU SYSTEM MIGRATION
-- This adds comprehensive menu management to the existing system
-- ============================================

-- ============================================
-- DROP EXISTING MENU TABLES (if they exist)
-- ============================================
DROP TABLE IF EXISTS order_item_modifiers CASCADE;
DROP TABLE IF EXISTS product_modifier_options CASCADE;
DROP TABLE IF EXISTS modifier_options CASCADE;
DROP TABLE IF EXISTS product_modifier_groups CASCADE;
DROP TABLE IF EXISTS modifier_groups CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;

-- ============================================
-- MENU CATEGORIES TABLE
-- Manages menu categories (Desserts, Açaí, Hot Drinks, etc.)
-- ============================================
CREATE TABLE menu_categories (
    category_id TEXT PRIMARY KEY,
    category_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    display_order NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    icon_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- ============================================
-- MODIFIER GROUPS TABLE
-- Manages groups of modifiers (e.g., "Dessert Toppings", "Açaí Fruits")
-- ============================================
CREATE TABLE modifier_groups (
    group_id TEXT PRIMARY KEY,
    group_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    selection_type TEXT NOT NULL DEFAULT 'multi', -- 'single' or 'multi'
    min_selections NUMERIC NOT NULL DEFAULT 0,
    max_selections NUMERIC, -- NULL means unlimited
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- ============================================
-- MODIFIER OPTIONS TABLE
-- Individual modifier options (e.g., "Kinder Bueno", "Strawberry")
-- ============================================
CREATE TABLE modifier_options (
    option_id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES modifier_groups(group_id) ON DELETE CASCADE,
    option_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    price_adjustment NUMERIC NOT NULL DEFAULT 0, -- Can be negative for discounts
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order NUMERIC NOT NULL DEFAULT 0,
    dietary_tags TEXT, -- JSON array as string: '["vegetarian", "gluten-free"]'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- ============================================
-- PRODUCT MODIFIER GROUPS TABLE
-- Links products to their applicable modifier groups
-- ============================================
CREATE TABLE product_modifier_groups (
    assignment_id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    group_id TEXT NOT NULL REFERENCES modifier_groups(group_id) ON DELETE CASCADE,
    display_order NUMERIC NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT false,
    min_selections NUMERIC NOT NULL DEFAULT 0,
    max_selections NUMERIC, -- NULL means unlimited
    included_quantity NUMERIC NOT NULL DEFAULT 0, -- Number of selections included in base price
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(product_id, group_id)
);

-- ============================================
-- PRODUCT MODIFIER OPTIONS TABLE
-- Override pricing for specific product-modifier combinations
-- ============================================
CREATE TABLE product_modifier_options (
    override_id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    option_id TEXT NOT NULL REFERENCES modifier_options(option_id) ON DELETE CASCADE,
    price_adjustment NUMERIC NOT NULL, -- Overrides the default price_adjustment from modifier_options
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(product_id, option_id)
);

-- ============================================
-- ORDER ITEM MODIFIERS TABLE
-- Stores selected modifiers for each order item
-- ============================================
CREATE TABLE order_item_modifiers (
    modifier_id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES order_items(item_id) ON DELETE CASCADE,
    option_id TEXT NOT NULL REFERENCES modifier_options(option_id) ON DELETE RESTRICT,
    option_name TEXT NOT NULL, -- Denormalized for history
    quantity NUMERIC NOT NULL DEFAULT 1,
    price_adjustment NUMERIC NOT NULL, -- Price at time of order
    created_at TEXT NOT NULL
);

-- ============================================
-- ADD MENU CATEGORY TO EXISTING PRODUCTS TABLE
-- ============================================
-- We'll add a foreign key to menu_categories after we populate categories
-- ALTER TABLE products ADD COLUMN menu_category_id TEXT REFERENCES menu_categories(category_id);
-- For now, we keep using the existing 'category' TEXT field and will migrate later

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_menu_categories_active ON menu_categories(is_active);
CREATE INDEX idx_menu_categories_order ON menu_categories(display_order);
CREATE INDEX idx_modifier_options_group ON modifier_options(group_id);
CREATE INDEX idx_modifier_options_active ON modifier_options(is_active);
CREATE INDEX idx_product_modifier_groups_product ON product_modifier_groups(product_id);
CREATE INDEX idx_product_modifier_groups_group ON product_modifier_groups(group_id);
CREATE INDEX idx_product_modifier_options_product ON product_modifier_options(product_id);
CREATE INDEX idx_product_modifier_options_option ON product_modifier_options(option_id);
CREATE INDEX idx_order_item_modifiers_item ON order_item_modifiers(item_id);
CREATE INDEX idx_order_item_modifiers_option ON order_item_modifiers(option_id);

-- ============================================
-- SEED MENU CATEGORIES
-- ============================================
INSERT INTO menu_categories (category_id, category_name, display_name, description, display_order, is_active, created_at, updated_at) VALUES
('cat_desserts', 'desserts', 'Desserts', 'Indulgent desserts with customizable toppings and sauces', 1, true, datetime('now'), datetime('now')),
('cat_acai', 'acai', 'Açaí Bowls', 'Build your own açaí bowl with fresh fruits and toppings', 2, true, datetime('now'), datetime('now')),
('cat_hot_drinks', 'hot_drinks', 'Hot Drinks', 'Freshly brewed coffee and tea', 3, true, datetime('now'), datetime('now')),
('cat_hot_chocolates', 'hot_chocolates', 'Hot Chocolates', 'Rich and creamy hot chocolate variations', 4, true, datetime('now'), datetime('now')),
('cat_lemonades', 'lemonades', 'Lemonades', 'Refreshing lemonade varieties', 5, true, datetime('now'), datetime('now')),
('cat_drinks', 'drinks', 'Drinks', 'Cold beverages and waters', 6, true, datetime('now'), datetime('now')),
('cat_specials', 'specials', 'Specials', 'Limited time special items', 7, true, datetime('now'), datetime('now'));

-- ============================================
-- SEED MODIFIER GROUPS
-- ============================================

-- Dessert Toppings (1 included, extras +€1)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_dessert_toppings', 'dessert_toppings', 'Toppings', 'Choose your toppings (1 included)', 'multi', 1, NULL, true, datetime('now'), datetime('now'));

-- Dessert Sauces (1 included, extras +€1 or +€2 for Dubai pistachio)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_dessert_sauces', 'dessert_sauces', 'Sauces', 'Choose your sauces (1 included)', 'multi', 1, NULL, true, datetime('now'), datetime('now'));

-- Açaí Base (exactly 1 required)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_acai_base', 'acai_base', 'Choose Your Base', 'Select the base for your bowl', 'single', 1, 1, true, datetime('now'), datetime('now'));

-- Açaí Granola (optional)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_acai_granola', 'acai_granola', 'Granola', 'Add granola to your bowl', 'single', 0, 1, false, datetime('now'), datetime('now'));

-- Açaí Fruits (up to 3 included)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_acai_fruits', 'acai_fruits', 'Choose Fruits', 'Select up to 3 fruits (included)', 'multi', 0, 3, false, datetime('now'), datetime('now'));

-- Açaí Toppings (1 included, extras +€1)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_acai_toppings', 'acai_toppings', 'Choose Topping', 'Select your topping (1 included)', 'multi', 1, NULL, true, datetime('now'), datetime('now'));

-- Açaí Sauces (1 included, extras +€1)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_acai_sauces', 'acai_sauces', 'Choose Sauce', 'Select your sauce (1 included)', 'multi', 1, NULL, true, datetime('now'), datetime('now'));

-- Hot Drink Syrups (optional, +€0.50 each)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_drink_syrups', 'drink_syrups', 'Add Syrup', 'Add flavored syrup (+€0.50 each)', 'multi', 0, NULL, false, datetime('now'), datetime('now'));

-- Alternative Milks (optional, +€0.50)
INSERT INTO modifier_groups (group_id, group_name, display_name, description, selection_type, min_selections, max_selections, is_required, created_at, updated_at) VALUES
('mg_alternative_milks', 'alternative_milks', 'Milk Option', 'Choose alternative milk (+€0.50)', 'single', 0, 1, false, datetime('now'), datetime('now'));

-- ============================================
-- SEED MODIFIER OPTIONS
-- ============================================

-- Dessert Toppings (€1 for extras beyond the first)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_topping_kinder_bueno', 'mg_dessert_toppings', 'kinder_bueno', 'Kinder Bueno', NULL, 1.00, true, 1, datetime('now'), datetime('now')),
('opt_topping_white_kinder_bueno', 'mg_dessert_toppings', 'white_kinder_bueno', 'White Kinder Bueno', NULL, 1.00, true, 2, datetime('now'), datetime('now')),
('opt_topping_kinder_bar', 'mg_dessert_toppings', 'kinder_bar', 'Kinder Bar', NULL, 1.00, true, 3, datetime('now'), datetime('now')),
('opt_topping_kinder_hippo', 'mg_dessert_toppings', 'kinder_hippo', 'Kinder Hippo', NULL, 1.00, true, 4, datetime('now'), datetime('now')),
('opt_topping_milky_bar', 'mg_dessert_toppings', 'milky_bar', 'Milky Bar', NULL, 1.00, true, 5, datetime('now'), datetime('now')),
('opt_topping_crushed_smarties', 'mg_dessert_toppings', 'crushed_smarties', 'Crushed Smarties', NULL, 1.00, true, 6, datetime('now'), datetime('now')),
('opt_topping_crunchie', 'mg_dessert_toppings', 'crunchie', 'Crunchie', NULL, 1.00, true, 7, datetime('now'), datetime('now')),
('opt_topping_maltesers', 'mg_dessert_toppings', 'maltesers', 'Maltesers', NULL, 1.00, true, 8, datetime('now'), datetime('now')),
('opt_topping_oreo_crumbs', 'mg_dessert_toppings', 'oreo_crumbs', 'Oreo Crumbs', NULL, 1.00, true, 9, datetime('now'), datetime('now')),
('opt_topping_biscoff_crumbs', 'mg_dessert_toppings', 'biscoff_crumbs', 'Biscoff Crumbs', NULL, 1.00, true, 10, datetime('now'), datetime('now')),
('opt_topping_caramel_freddo', 'mg_dessert_toppings', 'caramel_freddo', 'Caramel Freddo', NULL, 1.00, true, 11, datetime('now'), datetime('now')),
('opt_topping_flake', 'mg_dessert_toppings', 'flake', 'Flake', NULL, 1.00, true, 12, datetime('now'), datetime('now'));

-- Dessert Sauces (€1 for extras, €2 for Dubai pistachio)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_sauce_bueno', 'mg_dessert_sauces', 'bueno_sauce', 'Bueno Sauce', NULL, 1.00, true, 1, datetime('now'), datetime('now')),
('opt_sauce_white_chocolate', 'mg_dessert_sauces', 'white_chocolate_sauce', 'White Chocolate Sauce', NULL, 1.00, true, 2, datetime('now'), datetime('now')),
('opt_sauce_chocolate', 'mg_dessert_sauces', 'chocolate_sauce', 'Chocolate Sauce', NULL, 1.00, true, 3, datetime('now'), datetime('now')),
('opt_sauce_caramel', 'mg_dessert_sauces', 'caramel', 'Caramel', NULL, 1.00, true, 4, datetime('now'), datetime('now')),
('opt_sauce_biscoff', 'mg_dessert_sauces', 'biscoff', 'Biscoff', NULL, 1.00, true, 5, datetime('now'), datetime('now')),
('opt_sauce_dubai_pistachio', 'mg_dessert_sauces', 'dubai_pistachio', 'Dubai Pistachio', 'Premium sauce', 2.00, true, 6, datetime('now'), datetime('now'));

-- Açaí Bases (included in base price)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_base_acai_berry', 'mg_acai_base', 'acai_berry', 'Açaí Berry', 'Traditional açaí base', 0.00, true, 1, datetime('now'), datetime('now')),
('opt_base_dragonfruit', 'mg_acai_base', 'dragonfruit', 'Dragonfruit', 'Pink dragonfruit base', 0.00, true, 2, datetime('now'), datetime('now')),
('opt_base_mango', 'mg_acai_base', 'mango', 'Mango', 'Tropical mango base', 0.00, true, 3, datetime('now'), datetime('now'));

-- Açaí Granola (included)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_granola_yes', 'mg_acai_granola', 'with_granola', 'With Granola', NULL, 0.00, true, 1, datetime('now'), datetime('now')),
('opt_granola_no', 'mg_acai_granola', 'no_granola', 'No Granola', NULL, 0.00, true, 2, datetime('now'), datetime('now'));

-- Açaí Fruits (up to 3 included)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_fruit_strawberry', 'mg_acai_fruits', 'strawberry', 'Strawberry', NULL, 0.00, true, 1, datetime('now'), datetime('now')),
('opt_fruit_banana', 'mg_acai_fruits', 'banana', 'Banana', NULL, 0.00, true, 2, datetime('now'), datetime('now')),
('opt_fruit_blueberry', 'mg_acai_fruits', 'blueberry', 'Blueberry', NULL, 0.00, true, 3, datetime('now'), datetime('now'));

-- Açaí Toppings (1 included, extras +€1)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_acai_topping_coconut_flakes', 'mg_acai_toppings', 'coconut_flakes', 'Coconut Flakes', NULL, 1.00, true, 1, datetime('now'), datetime('now')),
('opt_acai_topping_almond_flakes', 'mg_acai_toppings', 'almond_flakes', 'Almond Flakes', NULL, 1.00, true, 2, datetime('now'), datetime('now')),
('opt_acai_topping_chocolate_flakes', 'mg_acai_toppings', 'chocolate_flakes', 'Chocolate Flakes', NULL, 1.00, true, 3, datetime('now'), datetime('now')),
('opt_acai_topping_oreo', 'mg_acai_toppings', 'oreo', 'Oreo', NULL, 1.00, true, 4, datetime('now'), datetime('now')),
('opt_acai_topping_biscoff_crumbs', 'mg_acai_toppings', 'biscoff_crumbs', 'Biscoff Crumbs', NULL, 1.00, true, 5, datetime('now'), datetime('now'));

-- Açaí Sauces (1 included, extras +€1)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_acai_sauce_bueno', 'mg_acai_sauces', 'bueno_sauce', 'Bueno Sauce', NULL, 1.00, true, 1, datetime('now'), datetime('now')),
('opt_acai_sauce_chocolate', 'mg_acai_sauces', 'chocolate_sauce', 'Chocolate Sauce', NULL, 1.00, true, 2, datetime('now'), datetime('now')),
('opt_acai_sauce_white_chocolate', 'mg_acai_sauces', 'white_chocolate_sauce', 'White Chocolate Sauce', NULL, 1.00, true, 3, datetime('now'), datetime('now')),
('opt_acai_sauce_caramel', 'mg_acai_sauces', 'caramel', 'Caramel', NULL, 1.00, true, 4, datetime('now'), datetime('now')),
('opt_acai_sauce_honey', 'mg_acai_sauces', 'honey', 'Honey', NULL, 1.00, true, 5, datetime('now'), datetime('now')),
('opt_acai_sauce_peanut_butter', 'mg_acai_sauces', 'peanut_butter', 'Peanut Butter', NULL, 1.00, true, 6, datetime('now'), datetime('now'));

-- Hot Drink Syrups (+€0.50 each)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_syrup_vanilla', 'mg_drink_syrups', 'vanilla', 'Vanilla', NULL, 0.50, true, 1, datetime('now'), datetime('now')),
('opt_syrup_caramel', 'mg_drink_syrups', 'caramel', 'Caramel', NULL, 0.50, true, 2, datetime('now'), datetime('now')),
('opt_syrup_hazelnut', 'mg_drink_syrups', 'hazelnut', 'Hazelnut', NULL, 0.50, true, 3, datetime('now'), datetime('now'));

-- Alternative Milks (+€0.50)
INSERT INTO modifier_options (option_id, group_id, option_name, display_name, description, price_adjustment, is_active, display_order, created_at, updated_at) VALUES
('opt_milk_oat', 'mg_alternative_milks', 'oat_milk', 'Oat Milk', NULL, 0.50, true, 1, datetime('now'), datetime('now')),
('opt_milk_coconut', 'mg_alternative_milks', 'coconut_milk', 'Coconut Milk', NULL, 0.50, true, 2, datetime('now'), datetime('now'));

-- ============================================
-- COMPLETE - Schema and seed data created
-- ============================================
