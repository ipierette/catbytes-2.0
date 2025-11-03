-- =====================================================
-- CatBytes Blog Database Schema
-- Automated AI-powered blog system with image generation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  views INTEGER DEFAULT 0,

  -- Metadata
  author TEXT DEFAULT 'CatBytes AI',
  category TEXT DEFAULT 'Tecnologia',
  tags TEXT[] DEFAULT '{}',

  -- AI Generation metadata
  ai_model TEXT DEFAULT 'gpt-4',
  generation_prompt TEXT,

  -- Constraints
  CONSTRAINT title_length CHECK (char_length(title) BETWEEN 10 AND 200),
  CONSTRAINT excerpt_length CHECK (char_length(excerpt) BETWEEN 50 AND 500),
  CONSTRAINT content_min_length CHECK (char_length(content) >= 300)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_keywords ON blog_posts USING GIN(keywords);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-delete old posts when limit is reached
CREATE OR REPLACE FUNCTION manage_blog_posts_limit()
RETURNS TRIGGER AS $$
DECLARE
  post_count INTEGER;
  max_posts INTEGER := 30;
BEGIN
  SELECT COUNT(*) INTO post_count FROM blog_posts;

  IF post_count > max_posts THEN
    DELETE FROM blog_posts
    WHERE id IN (
      SELECT id FROM blog_posts
      ORDER BY created_at ASC
      LIMIT (post_count - max_posts)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to manage post limit
CREATE TRIGGER manage_posts_limit_trigger
  AFTER INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION manage_blog_posts_limit();

-- Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Anyone can read published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Policy: Service role can INSERT posts
CREATE POLICY "Service role can insert posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Service role can UPDATE posts
CREATE POLICY "Service role can update posts"
  ON blog_posts FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Service role can DELETE posts
CREATE POLICY "Service role can delete posts"
  ON blog_posts FOR DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Blog Generation Log (optional, for monitoring)
CREATE TABLE IF NOT EXISTS blog_generation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  error_message TEXT,
  generation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_generation_log_created_at ON blog_generation_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_log_status ON blog_generation_log(status);

-- RLS for generation log
ALTER TABLE blog_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access generation log"
  ON blog_generation_log
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Comments for documentation
COMMENT ON TABLE blog_posts IS 'AI-generated blog posts with automatic lifecycle management';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN blog_posts.keywords IS 'SEO keywords for organic traffic';
COMMENT ON FUNCTION manage_blog_posts_limit() IS 'Automatically maintains max 30 posts by removing oldest';

-- =====================================================
-- Newsletter Subscribers Table
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  verification_token TEXT UNIQUE,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,

  -- Engagement tracking
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  emails_sent_count INTEGER DEFAULT 0,
  emails_opened_count INTEGER DEFAULT 0,
  emails_clicked_count INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscribers(subscribed) WHERE subscribed = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_verified ON newsletter_subscribers(verified) WHERE verified = true;

-- RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can subscribe (INSERT)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Policy: Service role has full access
CREATE POLICY "Service role full access newsletter"
  ON newsletter_subscribers
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Users can unsubscribe themselves via token
CREATE POLICY "Users can unsubscribe via token"
  ON newsletter_subscribers FOR UPDATE
  USING (verification_token IS NOT NULL)
  WITH CHECK (subscribed = false);

-- Newsletter Campaigns (for tracking sent emails)
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  recipients_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_campaigns_post ON newsletter_campaigns(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_sent ON newsletter_campaigns(sent_at DESC);

ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access campaigns"
  ON newsletter_campaigns
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Comments
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers with double opt-in';
COMMENT ON TABLE newsletter_campaigns IS 'Newsletter campaign tracking for sent blog posts';

-- =====================================================
-- RLS Policies Summary
-- =====================================================
-- 
-- blog_posts:
--   - SELECT: Anyone can read published posts
--   - INSERT/UPDATE/DELETE: Service role only (API routes)
--
-- blog_generation_log:
--   - ALL: Service role only
--
-- newsletter_subscribers:
--   - INSERT: Anyone (for subscription form)
--   - UPDATE: Service role OR user with valid token (for unsubscribe)
--   - SELECT/DELETE: Service role only
--
-- newsletter_campaigns:
--   - ALL: Service role only
--
-- Note: Service role authenticated via SUPABASE_SERVICE_ROLE_KEY
-- =====================================================
