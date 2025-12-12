-- Create social_media_links table
CREATE TABLE IF NOT EXISTS social_media_links (
    link_id TEXT PRIMARY KEY,
    platform_name TEXT NOT NULL,
    platform_url TEXT NOT NULL,
    icon_type TEXT NOT NULL, -- 'lucide' for Lucide icons, 'custom' for custom images
    icon_name TEXT, -- For Lucide icons: 'Instagram', 'Facebook', etc.
    icon_url TEXT, -- For custom icons: URL to the icon image
    hover_color TEXT NOT NULL DEFAULT '#3b82f6', -- Tailwind color class or hex color
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Insert default social media links
INSERT INTO social_media_links (link_id, platform_name, platform_url, icon_type, icon_name, icon_url, hover_color, display_order, is_active, created_at, updated_at) VALUES
    ('sml_001', 'Instagram', 'https://www.instagram.com/kakedesserts/?igsh=MXNyc2lhOTI1ZWliMQ%3D%3D', 'lucide', 'Instagram', NULL, '#a855f7', 1, TRUE, NOW(), NOW()),
    ('sml_002', 'Facebook', 'https://facebook.com/kake', 'lucide', 'Facebook', NULL, '#3b82f6', 2, TRUE, NOW(), NOW()),
    ('sml_003', 'TikTok', 'https://www.tiktok.com/@kakedesserts?lang=en', 'custom', NULL, '/assets/images/tiktok-logo.png', '#ec4899', 3, TRUE, NOW(), NOW())
ON CONFLICT (link_id) DO NOTHING;
