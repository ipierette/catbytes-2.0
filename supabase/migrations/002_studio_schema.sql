-- =====================================================
-- CatBytes Media Studio - Database Schema
-- =====================================================
-- Este arquivo contém todas as tabelas necessárias para o Media Studio
-- Execute no SQL Editor do Supabase

-- =====================================================
-- 1. STUDIO PROJECTS
-- =====================================================
CREATE TABLE IF NOT EXISTS studio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0, -- duração total em segundos
  status TEXT DEFAULT 'draft', -- draft, rendering, published, failed
  aspect_ratio TEXT DEFAULT '16:9', -- 16:9, 9:16, 1:1, 4:5
  resolution TEXT DEFAULT '1080p', -- 720p, 1080p, 4k
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para busca rápida por status e data
CREATE INDEX IF NOT EXISTS idx_studio_projects_status ON studio_projects(status);
CREATE INDEX IF NOT EXISTS idx_studio_projects_updated_at ON studio_projects(updated_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_studio_projects_updated_at
  BEFORE UPDATE ON studio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. STUDIO CLIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS studio_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES studio_projects(id) ON DELETE CASCADE,
  asset_url TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- video, image, audio
  thumbnail_url TEXT,
  
  -- Timeline positioning
  position INTEGER NOT NULL DEFAULT 0, -- ordem no timeline
  track INTEGER DEFAULT 0, -- trilha (0 = principal, 1+ = overlays)
  
  -- Time controls
  start_time DECIMAL(10, 3), -- tempo de início no projeto (segundos)
  end_time DECIMAL(10, 3), -- tempo de fim no projeto (segundos)
  trim_start DECIMAL(10, 3) DEFAULT 0, -- início do trim no asset original
  trim_end DECIMAL(10, 3), -- fim do trim no asset original (NULL = até o fim)
  
  -- Visual properties
  effects JSONB DEFAULT '[]', -- array de efeitos aplicados
  transitions JSONB DEFAULT '{}', -- transições de entrada/saída
  
  -- Metadata
  duration DECIMAL(10, 3), -- duração original do asset
  metadata JSONB DEFAULT '{}', -- width, height, fps, codec, etc
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para queries eficientes
CREATE INDEX IF NOT EXISTS idx_studio_clips_project ON studio_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_studio_clips_position ON studio_clips(project_id, position);

-- =====================================================
-- 3. STUDIO ASSETS (Biblioteca)
-- =====================================================
CREATE TABLE IF NOT EXISTS studio_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- video, audio, image
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Media properties
  duration INTEGER, -- segundos (NULL para imagens)
  file_size INTEGER, -- bytes
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- {width, height, fps, codec, bitrate, etc}
  
  -- Organization
  tags TEXT[] DEFAULT '{}', -- tags para busca
  folder TEXT, -- organização em pastas
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para busca
CREATE INDEX IF NOT EXISTS idx_studio_assets_type ON studio_assets(type);
CREATE INDEX IF NOT EXISTS idx_studio_assets_tags ON studio_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_studio_assets_created ON studio_assets(created_at DESC);

-- =====================================================
-- 4. RENDER JOBS (Histórico de renderização)
-- =====================================================
CREATE TABLE IF NOT EXISTS studio_render_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
  
  -- Job status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  progress INTEGER DEFAULT 0, -- 0-100
  
  -- Output config
  output_url TEXT,
  output_format TEXT, -- mp4, webm, mov
  output_quality TEXT, -- 720p, 1080p, 4k
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Processing time
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para monitoring
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON studio_render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_render_jobs_project ON studio_render_jobs(project_id);

-- =====================================================
-- 5. SCRIPTS (Roteiros gerados pela IA)
-- =====================================================
CREATE TABLE IF NOT EXISTS studio_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
  
  -- Script content
  topic TEXT NOT NULL,
  style TEXT, -- educativo, viral, tutorial, etc
  hook TEXT,
  points JSONB DEFAULT '[]', -- array de pontos principais
  cta TEXT, -- call-to-action
  
  -- Metadata
  estimated_duration INTEGER, -- segundos
  target_audience TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scripts_project ON studio_scripts(project_id);

-- =====================================================
-- 6. NARRATIONS (Narrações geradas)
-- =====================================================
CREATE TABLE IF NOT EXISTS studio_narrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
  script_id UUID REFERENCES studio_scripts(id) ON DELETE SET NULL,
  
  -- Audio info
  audio_url TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  voice_name TEXT,
  
  -- Original text
  text TEXT NOT NULL,
  character_count INTEGER,
  
  -- Voice settings
  stability DECIMAL(3, 2) DEFAULT 0.50,
  similarity_boost DECIMAL(3, 2) DEFAULT 0.75,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_narrations_project ON studio_narrations(project_id);

-- =====================================================
-- 7. PUBLISHED VIDEOS (Vídeos publicados nas redes)
-- =====================================================
CREATE TABLE IF NOT EXISTS studio_published_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES studio_projects(id) ON DELETE SET NULL,
  
  -- Platform info
  platform TEXT NOT NULL, -- youtube, tiktok, instagram, linkedin
  platform_video_id TEXT, -- ID do vídeo na plataforma
  platform_url TEXT,
  
  -- Publishing data
  title TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Analytics (pode ser atualizado periodicamente)
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_published_platform ON studio_published_videos(platform);
CREATE INDEX IF NOT EXISTS idx_published_project ON studio_published_videos(project_id);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Habilitar RLS em todas as tabelas
ALTER TABLE studio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_narrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_published_videos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (ajustar conforme necessidade)
-- Por enquanto, permitir acesso público para service role

-- SELECT: Permitir leitura para todos (ajustar se precisar autenticação)
CREATE POLICY "Allow public read access" ON studio_projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON studio_clips FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON studio_assets FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON studio_render_jobs FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON studio_scripts FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON studio_narrations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON studio_published_videos FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: Permitir com service role key (backend)
CREATE POLICY "Allow service role all access" ON studio_projects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role all access" ON studio_clips FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role all access" ON studio_assets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role all access" ON studio_render_jobs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role all access" ON studio_scripts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role all access" ON studio_narrations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role all access" ON studio_published_videos FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Função para obter duração total de um projeto
CREATE OR REPLACE FUNCTION get_project_total_duration(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_duration INTEGER;
BEGIN
  SELECT COALESCE(MAX(end_time), 0)
  INTO total_duration
  FROM studio_clips
  WHERE project_id = project_uuid;
  
  RETURN total_duration;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar projetos antigos (útil para manutenção)
CREATE OR REPLACE FUNCTION cleanup_old_draft_projects(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM studio_projects
  WHERE status = 'draft'
    AND created_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. INITIAL DATA (Opcional)
-- =====================================================

-- Inserir algumas vozes padrão da Eleven Labs para referência
INSERT INTO public.studio_narrations (id, project_id, script_id, audio_url, voice_id, voice_name, text, character_count)
VALUES
  (uuid_generate_v4(), NULL, NULL, '', 'ErXwobaYiN019PkySvjV', 'Antoni (M)', 'Voz profissional masculina', 0),
  (uuid_generate_v4(), NULL, NULL, '', 'EXAVITQu4vr4xnSDxMaL', 'Bella (F)', 'Voz amigável feminina', 0)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Todas as tabelas foram criadas com sucesso.
-- Execute este arquivo no SQL Editor do Supabase.
-- 
-- Próximos passos:
-- 1. Verificar se os buckets 'videos' e 'instagram-images' existem
-- 2. Configurar variáveis de ambiente (OPENAI_API_KEY, ELEVENLABS_API_KEY)
-- 3. Testar as APIs do Studio
