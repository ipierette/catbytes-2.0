-- =====================================================
-- CatBytes Database Schema - Current State
-- Exported: 2025-11-06
-- Source: Supabase Production Database
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADMIN & AUTOMATION TABLES
-- =====================================================

-- Table: admin_settings
CREATE TABLE admin_settings (
  id INTEGER NOT NULL DEFAULT nextval('admin_settings_id_seq'::regclass),
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Table: automation_settings
CREATE TABLE automation_settings (
  id INTEGER NOT NULL DEFAULT nextval('automation_settings_id_seq'::regclass),
  auto_generation_enabled BOOLEAN DEFAULT true,
  batch_size INTEGER DEFAULT 10,
  last_generation_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- BLOG TABLES
-- =====================================================

-- Table: blog_posts
CREATE TABLE blog_posts (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}'::text[],
  seo_title TEXT,
  seo_description TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  views INTEGER DEFAULT 0,
  author TEXT DEFAULT 'CatBytes AI'::text,
  category TEXT DEFAULT 'Tecnologia'::text,
  tags TEXT[] DEFAULT '{}'::text[],
  ai_model TEXT DEFAULT 'gpt-4'::text,
  generation_prompt TEXT,
  locale VARCHAR(10) DEFAULT 'pt-BR'::character varying,
  translated_from UUID,
  original_post_id UUID
);

-- Table: blog_generation_log
CREATE TABLE blog_generation_log (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  post_id UUID,
  status TEXT NOT NULL,
  error_message TEXT,
  generation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- INSTAGRAM TABLES
-- =====================================================

-- Table: instagram_posts
CREATE TABLE instagram_posts (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  nicho VARCHAR(50) NOT NULL,
  titulo TEXT NOT NULL,
  texto_imagem VARCHAR(100) NOT NULL,
  caption TEXT NOT NULL,
  image_url TEXT NOT NULL,
  instagram_post_id VARCHAR(100),
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- Table: instagram_settings
CREATE TABLE instagram_settings (
  id INTEGER NOT NULL DEFAULT nextval('instagram_settings_id_seq'::regclass),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- NEWSLETTER TABLES
-- =====================================================

-- Table: newsletter_subscribers
CREATE TABLE newsletter_subscribers (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  verification_token TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'website'::text,
  ip_address TEXT,
  user_agent TEXT,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  emails_sent_count INTEGER DEFAULT 0,
  emails_opened_count INTEGER DEFAULT 0,
  emails_clicked_count INTEGER DEFAULT 0,
  locale TEXT DEFAULT 'pt-BR'::text,
  preferred_language TEXT DEFAULT 'pt-BR'::text
);

-- Table: newsletter_campaigns
CREATE TABLE newsletter_campaigns (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  blog_post_id UUID,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  recipients_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0
);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- Table: analytics_page_views
CREATE TABLE analytics_page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT NOT NULL,
  locale TEXT DEFAULT 'pt-BR'::text,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: analytics_blog_views
CREATE TABLE analytics_blog_views (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  post_slug TEXT NOT NULL,
  post_title TEXT NOT NULL,
  read_time_seconds INTEGER DEFAULT 0,
  scroll_depth_percent INTEGER DEFAULT 0,
  locale TEXT DEFAULT 'pt-BR'::text,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: analytics_events
CREATE TABLE analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: analytics_daily_summary (View/Materialized)
CREATE TABLE analytics_daily_summary (
  date DATE,
  total_page_views BIGINT,
  unique_visitors BIGINT,
  unique_pages BIGINT
);

-- Table: analytics_blog_summary (View/Materialized)
CREATE TABLE analytics_blog_summary (
  date DATE,
  post_slug TEXT,
  post_title TEXT,
  views BIGINT,
  unique_readers BIGINT,
  avg_read_time NUMERIC,
  avg_scroll_depth NUMERIC
);

-- =====================================================
-- INDEXES (Performance)
-- =====================================================

-- Blog Posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale ON blog_posts(locale);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_original ON blog_posts(original_post_id);

-- Instagram Posts
CREATE INDEX IF NOT EXISTS idx_instagram_posts_status ON instagram_posts(status);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_scheduled ON instagram_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_created ON instagram_posts(created_at DESC);

-- Newsletter
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscribers(subscribed);
CREATE INDEX IF NOT EXISTS idx_newsletter_verified ON newsletter_subscribers(verified);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_timestamp ON analytics_page_views(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_blog_views_slug ON analytics_blog_views(post_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_blog_views_timestamp ON analytics_blog_views(timestamp DESC);

-- =====================================================
-- FOREIGN KEYS (Relationships)
-- =====================================================

-- Blog Posts
ALTER TABLE blog_posts 
  ADD CONSTRAINT fk_blog_posts_original 
  FOREIGN KEY (original_post_id) REFERENCES blog_posts(id) ON DELETE SET NULL;

-- Blog Generation Log
ALTER TABLE blog_generation_log 
  ADD CONSTRAINT fk_blog_generation_log_post 
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;

-- Newsletter Campaigns
ALTER TABLE newsletter_campaigns 
  ADD CONSTRAINT fk_newsletter_campaigns_post 
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;

-- =====================================================
-- CONSTRAINTS (Data Integrity)
-- =====================================================

-- Blog Posts
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);
ALTER TABLE blog_posts ADD CONSTRAINT title_length CHECK (char_length(title) BETWEEN 10 AND 200);
ALTER TABLE blog_posts ADD CONSTRAINT excerpt_length CHECK (char_length(excerpt) BETWEEN 50 AND 500);
ALTER TABLE blog_posts ADD CONSTRAINT content_min_length CHECK (char_length(content) >= 300);

-- Newsletter Subscribers
ALTER TABLE newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);
ALTER TABLE newsletter_subscribers ADD CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Instagram Posts
ALTER TABLE instagram_posts ADD CONSTRAINT instagram_posts_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'failed'));

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total Tables: 13
-- 
-- Categories:
-- - Admin/Automation: 2 tables
-- - Blog: 2 tables  
-- - Instagram: 2 tables
-- - Newsletter: 2 tables
-- - Analytics: 5 tables
--
-- Key Features:
-- - UUID primary keys for most tables
-- - Automatic timestamps (created_at, updated_at)
-- - Locale support (pt-BR, en-US)
-- - Translation relationships (original_post_id)
-- - Instagram workflow (pending → approved → published)
-- - Newsletter double opt-in (verification_token)
-- - Analytics tracking (page views, blog views, events)
-- =====================================================
