-- =====================================================
-- Migration: Analytics Sync and Optimization
-- Date: 2025-11-07
-- Description: Add triggers, indexes, and views for analytics
-- =====================================================

-- =====================================================
-- PART 1: Sync blog_posts.views with analytics_blog_views
-- =====================================================

-- Function to sync views from analytics to blog_posts
CREATE OR REPLACE FUNCTION sync_blog_post_views()
RETURNS TRIGGER AS $$
BEGIN
  -- Update blog_posts.views with count of unique sessions from analytics
  UPDATE blog_posts
  SET views = (
    SELECT COUNT(DISTINCT session_id)
    FROM analytics_blog_views
    WHERE post_id = NEW.post_id::text
  )
  WHERE id = NEW.post_id::uuid;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update views when new analytics data arrives
DROP TRIGGER IF EXISTS trigger_sync_blog_views ON analytics_blog_views;
CREATE TRIGGER trigger_sync_blog_views
  AFTER INSERT ON analytics_blog_views
  FOR EACH ROW
  EXECUTE FUNCTION sync_blog_post_views();

-- Initial sync: Update all existing posts with current analytics data
UPDATE blog_posts
SET views = COALESCE(
  (
    SELECT COUNT(DISTINCT session_id)
    FROM analytics_blog_views
    WHERE post_id = blog_posts.id::text
  ),
  0
);

-- =====================================================
-- PART 2: Additional Indexes for Performance
-- =====================================================

-- Analytics blog views - composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_blog_views_post_id ON analytics_blog_views(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_blog_views_timestamp_session ON analytics_blog_views(timestamp DESC, session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_blog_views_post_timestamp ON analytics_blog_views(post_id, timestamp DESC);

-- Analytics page views - composite indexes
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_page_timestamp ON analytics_page_views(page, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_locale ON analytics_page_views(locale);

-- Analytics events - for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);

-- Blog posts - for analytics queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_views ON blog_posts(views DESC);

-- =====================================================
-- PART 3: Materialized Views for Performance
-- =====================================================

DROP VIEW IF EXISTS analytics_daily_summary CASCADE;

-- Check if analytics_blog_summary exists as a view or materialized view
DO $$
BEGIN
  -- Drop as regular view if exists
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'analytics_blog_summary'
  ) THEN
    EXECUTE 'DROP VIEW analytics_blog_summary CASCADE';
  END IF;
  
  -- Drop as materialized view if exists
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE matviewname = 'analytics_blog_summary'
  ) THEN
    EXECUTE 'DROP MATERIALIZED VIEW analytics_blog_summary CASCADE';
  END IF;
END $$;

CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_daily_summary AS
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_page_views,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(DISTINCT page) as unique_pages
FROM analytics_page_views
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Após criar a materialized view, execute separadamente:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_daily_summary_date ON analytics_daily_summary(date);

-- Materialized view for daily blog statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_blog_summary AS
SELECT 
  DATE(timestamp) as date,
  post_slug,
  post_title,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_readers,
  AVG(read_time_seconds) as avg_read_time,
  AVG(scroll_depth_percent) as avg_scroll_depth,
  COUNT(*) FILTER (WHERE read_time_seconds > 30) as quality_reads,
  COUNT(*) FILTER (WHERE scroll_depth_percent > 80) as completed_reads
FROM analytics_blog_views
GROUP BY DATE(timestamp), post_slug, post_title
ORDER BY date DESC, views DESC;

-- Indexes for materialized view (crie após a view existir)
-- Execute estes comandos separadamente após a criação da materialized view:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_blog_summary_date_slug ON analytics_blog_summary(date, post_slug);
-- CREATE INDEX IF NOT EXISTS idx_analytics_blog_summary_views ON analytics_blog_summary(views);

-- =====================================================
-- PART 4: Refresh Functions for Materialized Views
-- =====================================================

-- Function to refresh daily analytics
CREATE OR REPLACE FUNCTION refresh_analytics_daily()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_blog_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 5: Cleanup Functions
-- =====================================================

-- Function to archive old analytics (older than 1 year)
CREATE TABLE IF NOT EXISTS analytics_blog_views_archive (
  LIKE analytics_blog_views INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS analytics_page_views_archive (
  LIKE analytics_page_views INCLUDING ALL
);

CREATE OR REPLACE FUNCTION archive_old_analytics()
RETURNS void AS $$
DECLARE
  archive_date TIMESTAMP WITH TIME ZONE;
  rows_moved INTEGER;
BEGIN
  archive_date := NOW() - INTERVAL '1 year';
  
  -- Archive blog views
  WITH moved_rows AS (
    INSERT INTO analytics_blog_views_archive
    SELECT * FROM analytics_blog_views
    WHERE timestamp < archive_date
    RETURNING *
  )
  SELECT COUNT(*) INTO rows_moved FROM moved_rows;
  
  -- Delete archived blog views
  DELETE FROM analytics_blog_views
  WHERE timestamp < archive_date;
  
  RAISE NOTICE 'Archived % blog view records', rows_moved;
  
  -- Archive page views
  WITH moved_rows AS (
    INSERT INTO analytics_page_views_archive
    SELECT * FROM analytics_page_views
    WHERE timestamp < archive_date
    RETURNING *
  )
  SELECT COUNT(*) INTO rows_moved FROM moved_rows;
  
  -- Delete archived page views
  DELETE FROM analytics_page_views
  WHERE timestamp < archive_date;
  
  RAISE NOTICE 'Archived % page view records', rows_moved;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 6: Helper Views for Common Queries
-- =====================================================

-- View for top posts by views (last 30 days)
CREATE OR REPLACE VIEW analytics_top_posts_30d AS
SELECT 
  abv.post_id,
  abv.post_slug,
  abv.post_title,
  COUNT(DISTINCT abv.session_id) as unique_readers,
  COUNT(*) as total_views,
  AVG(abv.read_time_seconds)::INTEGER as avg_read_time,
  AVG(abv.scroll_depth_percent)::INTEGER as avg_scroll_depth,
  COUNT(*) FILTER (WHERE abv.read_time_seconds > 30) as quality_reads,
  bp.views as total_lifetime_views
FROM analytics_blog_views abv
LEFT JOIN blog_posts bp ON bp.id = abv.post_id::uuid
WHERE abv.timestamp > NOW() - INTERVAL '30 days'
GROUP BY abv.post_id, abv.post_slug, abv.post_title, bp.views
ORDER BY unique_readers DESC
LIMIT 10;

-- View for real-time stats (last 5 minutes)
CREATE OR REPLACE VIEW analytics_realtime AS
SELECT 
  COUNT(DISTINCT session_id) as active_users,
  COUNT(*) as recent_page_views
FROM analytics_page_views
WHERE timestamp > NOW() - INTERVAL '5 minutes';

-- View for engagement metrics by post
CREATE OR REPLACE VIEW analytics_engagement_by_post AS
SELECT 
  post_id,
  post_slug,
  post_title,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_readers,
  AVG(read_time_seconds)::INTEGER as avg_read_time_seconds,
  AVG(scroll_depth_percent)::INTEGER as avg_scroll_depth_percent,
  COUNT(*) FILTER (WHERE read_time_seconds > 30)::FLOAT / NULLIF(COUNT(*), 0) * 100 as quality_read_rate,
  COUNT(*) FILTER (WHERE scroll_depth_percent > 80)::FLOAT / NULLIF(COUNT(*), 0) * 100 as completion_rate,
  COUNT(*) FILTER (WHERE read_time_seconds < 30)::FLOAT / NULLIF(COUNT(*), 0) * 100 as bounce_rate
FROM analytics_blog_views
GROUP BY post_id, post_slug, post_title
ORDER BY unique_readers DESC;

-- =====================================================
-- PART 7: Comments for Documentation
-- =====================================================

COMMENT ON FUNCTION sync_blog_post_views() IS 'Automatically syncs blog_posts.views with count from analytics_blog_views';
COMMENT ON FUNCTION refresh_analytics_daily() IS 'Refreshes materialized views for daily analytics (run via cron)';
COMMENT ON FUNCTION archive_old_analytics() IS 'Archives analytics data older than 1 year';

COMMENT ON MATERIALIZED VIEW analytics_daily_summary IS 'Daily summary of page views (refresh daily)';
COMMENT ON MATERIALIZED VIEW analytics_blog_summary IS 'Daily summary of blog post views (refresh daily)';

COMMENT ON VIEW analytics_top_posts_30d IS 'Top 10 posts by unique readers in last 30 days';
COMMENT ON VIEW analytics_realtime IS 'Real-time active users (last 5 minutes)';
COMMENT ON VIEW analytics_engagement_by_post IS 'Engagement metrics by post (read time, scroll depth, bounce rate)';

-- =====================================================
-- Migration Complete
-- =====================================================
-- 
-- What was added:
-- ✅ Trigger to sync blog_posts.views from analytics_blog_views
-- ✅ Additional indexes for performance (8 new indexes)
-- ✅ Materialized views for daily/blog summaries
-- ✅ Refresh function for materialized views
-- ✅ Archive function for old data cleanup
-- ✅ Helper views for common queries (top posts, realtime, engagement)
-- 
-- Next steps:
-- 1. Run this migration: supabase db push
-- 2. Set up cron job to refresh views: SELECT cron.schedule('refresh-analytics', '0 1 * * *', 'SELECT refresh_analytics_daily();');
-- 3. Set up archive job: SELECT cron.schedule('archive-analytics', '0 2 1 * *', 'SELECT archive_old_analytics();');
-- =====================================================
