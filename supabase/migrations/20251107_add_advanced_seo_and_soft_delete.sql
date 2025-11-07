-- =====================================================
-- Migration: Add Advanced SEO and Soft Delete
-- Date: 2025-11-07
-- Description: Adds meta_description, canonical_url, status, deleted_at
-- =====================================================

-- Add new columns to blog_posts
ALTER TABLE blog_posts 
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- Update existing posts to have 'published' status
UPDATE blog_posts 
SET status = CASE 
  WHEN published = true THEN 'published' 
  ELSE 'draft' 
END
WHERE status IS NULL;

-- Add constraint for status field
ALTER TABLE blog_posts 
  ADD CONSTRAINT blog_posts_status_check 
  CHECK (status IN ('draft', 'published', 'scheduled', 'archived'));

-- Add index for soft delete and status queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at ON blog_posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_at ON blog_posts(scheduled_at);

-- Add constraint for meta_description length
ALTER TABLE blog_posts 
  ADD CONSTRAINT meta_description_length 
  CHECK (meta_description IS NULL OR char_length(meta_description) BETWEEN 50 AND 160);

-- Add constraint for canonical_url format
ALTER TABLE blog_posts 
  ADD CONSTRAINT canonical_url_format 
  CHECK (canonical_url IS NULL OR canonical_url ~* '^https?://');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on blog_posts
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for non-deleted posts
CREATE OR REPLACE VIEW blog_posts_active AS
SELECT * FROM blog_posts
WHERE deleted_at IS NULL;

-- Create view for published posts only
CREATE OR REPLACE VIEW blog_posts_published AS
SELECT * FROM blog_posts
WHERE deleted_at IS NULL 
  AND status = 'published'
  AND (scheduled_at IS NULL OR scheduled_at <= NOW());

-- Comments for documentation
COMMENT ON COLUMN blog_posts.meta_description IS 'SEO meta description (50-160 characters)';
COMMENT ON COLUMN blog_posts.canonical_url IS 'Canonical URL for SEO (prevents duplicate content)';
COMMENT ON COLUMN blog_posts.status IS 'Post status: draft, published, scheduled, archived';
COMMENT ON COLUMN blog_posts.deleted_at IS 'Soft delete timestamp (NULL = not deleted)';
COMMENT ON COLUMN blog_posts.scheduled_at IS 'Scheduled publication date (NULL = publish immediately)';

-- =====================================================
-- Migration Complete
-- =====================================================
