-- =====================================================
-- ANALYTICS TABLES - SUPABASE SCHEMA
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Tabela para page views
CREATE TABLE IF NOT EXISTS analytics_page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    session_id TEXT NOT NULL,
    locale TEXT DEFAULT 'pt-BR',
    ip_address INET,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para blog post views
CREATE TABLE IF NOT EXISTS analytics_blog_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id TEXT NOT NULL,
    post_slug TEXT NOT NULL,
    post_title TEXT NOT NULL,
    read_time_seconds INTEGER DEFAULT 0,
    scroll_depth_percent INTEGER DEFAULT 0,
    locale TEXT DEFAULT 'pt-BR',
    session_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para eventos customizados
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    session_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON analytics_page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON analytics_page_views(page);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON analytics_page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_blog_views_timestamp ON analytics_blog_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_blog_views_post_id ON analytics_blog_views(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_slug ON analytics_blog_views(post_slug);
CREATE INDEX IF NOT EXISTS idx_blog_views_session ON analytics_blog_views(session_id);

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);

-- RLS (Row Level Security) - Permitir inserção pública para tracking
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserções públicas (tracking)
CREATE POLICY "Allow public inserts" ON analytics_page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts" ON analytics_blog_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Políticas para leitura apenas por service role (admin)
CREATE POLICY "Allow service role reads" ON analytics_page_views
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role reads" ON analytics_blog_views
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role reads" ON analytics_events
    FOR SELECT USING (auth.role() = 'service_role');

-- Views para agregações comuns
CREATE OR REPLACE VIEW analytics_daily_summary AS
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_page_views,
    COUNT(DISTINCT session_id) as unique_visitors,
    COUNT(DISTINCT page) as unique_pages
FROM analytics_page_views
GROUP BY DATE(timestamp)
ORDER BY date DESC;

CREATE OR REPLACE VIEW analytics_blog_summary AS
SELECT 
    DATE(timestamp) as date,
    post_slug,
    post_title,
    COUNT(*) as views,
    COUNT(DISTINCT session_id) as unique_readers,
    AVG(read_time_seconds) as avg_read_time,
    AVG(scroll_depth_percent) as avg_scroll_depth
FROM analytics_blog_views
GROUP BY DATE(timestamp), post_slug, post_title
ORDER BY date DESC, views DESC;

-- Função para limpar dados antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    -- Remove dados de analytics com mais de 2 anos
    DELETE FROM analytics_page_views 
    WHERE timestamp < NOW() - INTERVAL '2 years';
    
    DELETE FROM analytics_blog_views 
    WHERE timestamp < NOW() - INTERVAL '2 years';
    
    DELETE FROM analytics_events 
    WHERE timestamp < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE analytics_page_views IS 'Tracking de visualizações de páginas';
COMMENT ON TABLE analytics_blog_views IS 'Tracking específico de posts do blog';
COMMENT ON TABLE analytics_events IS 'Eventos customizados de analytics';

COMMENT ON COLUMN analytics_page_views.session_id IS 'ID único da sessão do usuário';
COMMENT ON COLUMN analytics_blog_views.read_time_seconds IS 'Tempo de leitura em segundos';
COMMENT ON COLUMN analytics_blog_views.scroll_depth_percent IS 'Porcentagem de scroll da página';