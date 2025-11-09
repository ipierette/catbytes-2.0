-- Add highlight column to blog_posts table
-- This column stores custom highlight text for article sidebars (max 300 chars)

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS highlight TEXT;

COMMENT ON COLUMN blog_posts.highlight IS 'Custom highlight text for sidebar boxes (max 300 chars)';
