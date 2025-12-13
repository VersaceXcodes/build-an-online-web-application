-- ============================================================================
-- ABOUT PAGE CONTENT MANAGEMENT SCHEMA
-- ============================================================================

-- Main About Page Content Table
CREATE TABLE IF NOT EXISTS about_page_content (
  content_id VARCHAR(36) PRIMARY KEY,
  hero_image_url TEXT NOT NULL,
  page_title VARCHAR(255) NOT NULL DEFAULT 'Our Story',
  story_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- About Page Milestones
CREATE TABLE IF NOT EXISTS about_page_milestones (
  milestone_id VARCHAR(36) PRIMARY KEY,
  content_id VARCHAR(36) NOT NULL REFERENCES about_page_content(content_id) ON DELETE CASCADE,
  year VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- About Page Values
CREATE TABLE IF NOT EXISTS about_page_values (
  value_id VARCHAR(36) PRIMARY KEY,
  content_id VARCHAR(36) NOT NULL REFERENCES about_page_content(content_id) ON DELETE CASCADE,
  icon_name VARCHAR(50) NOT NULL,
  value_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- About Page Team Members
CREATE TABLE IF NOT EXISTS about_page_team_members (
  member_id VARCHAR(36) PRIMARY KEY,
  content_id VARCHAR(36) NOT NULL REFERENCES about_page_content(content_id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_about_milestones_content_id ON about_page_milestones(content_id);
CREATE INDEX IF NOT EXISTS idx_about_milestones_display_order ON about_page_milestones(display_order);
CREATE INDEX IF NOT EXISTS idx_about_values_content_id ON about_page_values(content_id);
CREATE INDEX IF NOT EXISTS idx_about_values_display_order ON about_page_values(display_order);
CREATE INDEX IF NOT EXISTS idx_about_team_members_content_id ON about_page_team_members(content_id);
CREATE INDEX IF NOT EXISTS idx_about_team_members_display_order ON about_page_team_members(display_order);

-- ============================================================================
-- SEED DATA - Migrate existing static content to database
-- ============================================================================

-- Insert main content (using a fixed ID for easy reference)
INSERT INTO about_page_content (content_id, hero_image_url, page_title, story_content, created_at, updated_at) VALUES 
(
  'apc_default001',
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=2070',
  'Our Story',
  '<p>Kake was founded in 2020 with a simple mission: to bring artisan-quality desserts to every corner of Dublin. What started as a small bakery in Blanchardstown has grown into a beloved local brand serving three vibrant communities.</p><p>Our journey began with a passion for traditional baking methods combined with innovative flavors. We believe that every dessert tells a story, and we''re honored to be part of yours—whether it''s a birthday celebration, a corporate event, or simply a well-deserved treat after a long day.</p><p>Today, we continue to handcraft each dessert with the same care and attention that defined our first day. From our signature croissants to our seasonal specials, every item reflects our commitment to quality, community, and the joy of sharing delicious food.</p>',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (content_id) DO NOTHING;

-- Insert milestones
INSERT INTO about_page_milestones (milestone_id, content_id, year, title, description, display_order, created_at, updated_at) VALUES
('mlst_001', 'apc_default001', '2020', 'Kake Founded', 'Started our journey in Blanchardstown with a small team and big dreams', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mlst_002', 'apc_default001', '2021', 'Tallaght Opening', 'Expanded to our second location, bringing Kake to South Dublin', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mlst_003', 'apc_default001', '2022', 'Community Impact', 'Served over 50,000 customers and launched our loyalty program', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mlst_004', 'apc_default001', '2023', 'Glasnevin Partnership', 'Partnered with Just Eat and Deliveroo to reach even more dessert lovers', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mlst_005', 'apc_default001', '2024', 'Growing Strong', 'Continuing to innovate with new flavors and sustainable practices', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (milestone_id) DO NOTHING;

-- Insert values
INSERT INTO about_page_values (value_id, content_id, icon_name, value_name, description, display_order, created_at, updated_at) VALUES
('val_001', 'apc_default001', 'quality', 'Quality Craftsmanship', 'We use only the finest ingredients and traditional baking methods to create desserts that exceed expectations', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('val_002', 'apc_default001', 'community', 'Community First', 'Supporting local suppliers and giving back to our Dublin communities through partnerships and events', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('val_003', 'apc_default001', 'innovation', 'Creative Innovation', 'Blending classic techniques with modern flavors to create unique seasonal offerings and signature items', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('val_004', 'apc_default001', 'sustainability', 'Sustainability', 'Committed to reducing waste, sourcing responsibly, and making choices that benefit our planet', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (value_id) DO NOTHING;

-- Insert team members
INSERT INTO about_page_team_members (member_id, content_id, photo_url, name, role, bio, display_order, is_active, created_at, updated_at) VALUES
('team_001', 'apc_default001', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400', 'Sarah O''Brien', 'Co-Founder & Head Baker', 'Sarah brings 15 years of artisan baking experience and a passion for creating memorable dessert experiences', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('team_002', 'apc_default001', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400', 'Michael Chen', 'Co-Founder & Operations', 'Michael''s expertise in hospitality and operations ensures Kake delivers excellence at every touchpoint', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('team_003', 'apc_default001', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400', 'Emma Walsh', 'Pastry Chef', 'Emma''s creative flair and attention to detail bring our seasonal specials and signature items to life', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (member_id) DO NOTHING;
