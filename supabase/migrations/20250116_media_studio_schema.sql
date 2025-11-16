-- ==========================================
-- 🎬 CATBYTES MEDIA STUDIO - DATABASE SCHEMA
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- VIDEO PROJECTS
-- ==========================================

CREATE TABLE video_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  script TEXT,
  narration_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  -- 'draft' | 'rendering' | 'rendered' | 'published'
  platform_targets TEXT[] NOT NULL,
  -- ['youtube', 'tiktok', 'instagram', 'linkedin']
  aspect_ratio TEXT NOT NULL,
  -- '16:9' | '9:16' | '1:1' | '4:5'
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  duration INTEGER NOT NULL DEFAULT 60, -- segundos
  timeline JSONB NOT NULL DEFAULT '{"duration": 60, "tracks": []}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_video_projects_user ON video_projects(user_id);
CREATE INDEX idx_video_projects_status ON video_projects(status);
CREATE INDEX idx_video_projects_created ON video_projects(created_at DESC);

-- ==========================================
-- SCREENSHOTS (Temporários - deletados após render)
-- ==========================================

CREATE TABLE project_screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  sequence_order INTEGER, -- Ordem no vídeo
  display_duration INTEGER DEFAULT 5, -- Segundos que fica na tela
  status TEXT NOT NULL DEFAULT 'uploaded',
  -- 'uploaded' | 'used_in_render' | 'deleted'
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_screenshots_project ON project_screenshots(project_id);
CREATE INDEX idx_project_screenshots_status ON project_screenshots(status);
CREATE INDEX idx_project_screenshots_sequence ON project_screenshots(project_id, sequence_order);

-- ==========================================
-- VIDEO RENDERS (Temporários - deletados após publicação)
-- ==========================================

CREATE TABLE video_renders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES video_projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  resolution TEXT NOT NULL,
  file_url TEXT, -- URL no Supabase Storage (temporário)
  file_size BIGINT,
  duration INTEGER, -- segundos
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'rendering',
  -- 'rendering' | 'ready' | 'uploading' | 'published' | 'deleted'
  published_url TEXT, -- URL final na plataforma (YouTube, TikTok, etc)
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_video_renders_project ON video_renders(project_id);
CREATE INDEX idx_video_renders_status ON video_renders(status);
CREATE INDEX idx_video_renders_platform ON video_renders(platform);

-- ==========================================
-- BLOG VIDEO POSTS (URLs externos, não hospedam vídeos)
-- ==========================================

CREATE TABLE blog_video_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES video_projects(id),
  
  -- URLs dos vídeos publicados (embed externo)
  youtube_url TEXT,
  youtube_video_id TEXT, -- Extraído para embed
  tiktok_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  
  -- Thumbnail
  thumbnail_url TEXT NOT NULL,
  use_youtube_thumbnail BOOLEAN DEFAULT true,
  
  -- Metadata
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: pelo menos um URL deve existir
  CONSTRAINT at_least_one_video_url CHECK (
    youtube_url IS NOT NULL OR 
    tiktok_url IS NOT NULL OR 
    instagram_url IS NOT NULL OR 
    linkedin_url IS NOT NULL
  )
);

CREATE INDEX idx_blog_video_posts_slug ON blog_video_posts(slug);
CREATE INDEX idx_blog_video_posts_published ON blog_video_posts(published, published_at DESC);
CREATE INDEX idx_blog_video_posts_project ON blog_video_posts(project_id);

-- Auto-extract YouTube video ID
CREATE OR REPLACE FUNCTION extract_youtube_video_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.youtube_url IS NOT NULL THEN
    NEW.youtube_video_id := substring(NEW.youtube_url from 'v=([a-zA-Z0-9_-]+)');
    IF NEW.youtube_video_id IS NULL THEN
      NEW.youtube_video_id := substring(NEW.youtube_url from 'youtu.be/([a-zA-Z0-9_-]+)');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_youtube_video_id
  BEFORE INSERT OR UPDATE ON blog_video_posts
  FOR EACH ROW
  EXECUTE FUNCTION extract_youtube_video_id();

-- ==========================================
-- VIDEO POST LIKES
-- ==========================================

CREATE TABLE video_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_video_posts(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_ip)
);

CREATE INDEX idx_video_post_likes_post ON video_post_likes(post_id);

-- Functions para like counter
CREATE OR REPLACE FUNCTION increment_video_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_video_posts SET likes = likes + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_video_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_video_posts SET likes = GREATEST(likes - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- PODCAST EPISODES
-- ==========================================

CREATE TABLE podcast_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  script TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- segundos
  file_size BIGINT,
  thumbnail_url TEXT,
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  transcript TEXT, -- Transcrição completa
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(episode_number, locale)
);

CREATE INDEX idx_podcast_episodes_published ON podcast_episodes(published, published_at DESC);
CREATE INDEX idx_podcast_episodes_locale ON podcast_episodes(locale);
CREATE INDEX idx_podcast_episodes_number ON podcast_episodes(episode_number DESC);

-- ==========================================
-- PODCAST EPISODE LIKES
-- ==========================================

CREATE TABLE podcast_episode_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(episode_id, user_ip)
);

CREATE INDEX idx_podcast_episode_likes_episode ON podcast_episode_likes(episode_id);

-- ==========================================
-- ANALYTICS
-- ==========================================

CREATE TABLE media_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL, -- 'video' | 'podcast'
  content_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  -- 'view' | 'play' | 'pause' | 'complete' | 'skip' | 'download'
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_ip TEXT,
  user_agent TEXT,
  metadata JSONB
);

CREATE INDEX idx_media_analytics_content ON media_analytics(content_type, content_id);
CREATE INDEX idx_media_analytics_event ON media_analytics(event_type);
CREATE INDEX idx_media_analytics_timestamp ON media_analytics(timestamp DESC);

-- ==========================================
-- ASSETS LIBRARY
-- ==========================================

CREATE TABLE studio_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'video' | 'image' | 'audio' | 'animation'
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- para vídeos/áudio
  file_size BIGINT,
  tags TEXT[],
  category TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_studio_assets_user ON studio_assets(user_id);
CREATE INDEX idx_studio_assets_type ON studio_assets(type);
CREATE INDEX idx_studio_assets_tags ON studio_assets USING GIN(tags);

-- ==========================================
-- AUTO UPDATE timestamps
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER video_projects_updated_at
  BEFORE UPDATE ON video_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blog_video_posts_updated_at
  BEFORE UPDATE ON blog_video_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER podcast_episodes_updated_at
  BEFORE UPDATE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_assets ENABLE ROW LEVEL SECURITY;

-- Policies para video_projects
CREATE POLICY "Users can view their own projects"
  ON video_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON video_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON video_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON video_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para assets
CREATE POLICY "Users can view their own assets"
  ON studio_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assets"
  ON studio_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON studio_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Public read para blog posts e podcasts
ALTER TABLE blog_video_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published video posts"
  ON blog_video_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Anyone can view published podcast episodes"
  ON podcast_episodes FOR SELECT
  USING (published = true);
