-- =====================================================
-- Blog Topics Management System
-- Sistema completo de gerenciamento de tópicos
-- =====================================================

-- Tabela principal de tópicos
CREATE TABLE IF NOT EXISTS blog_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Conteúdo do tópico
  topic TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Automação e Negócios', 'Programação e IA', 'Cuidados Felinos', 'Tech Aleatório')),
  
  -- Status e controle de uso
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used', 'blocked', 'archived')),
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Embedding vetorial para similaridade
  embedding vector(1536), -- OpenAI text-embedding-ada-002
  
  -- Metadata
  source TEXT DEFAULT 'manual', -- 'manual', 'imported', 'ai_generated'
  priority INTEGER DEFAULT 0, -- Para priorização (maior = mais prioritário)
  tags TEXT[] DEFAULT '{}',
  
  -- Controle de qualidade
  approved BOOLEAN DEFAULT true,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_blog_topics_category ON blog_topics(category);
CREATE INDEX idx_blog_topics_status ON blog_topics(status);
CREATE INDEX idx_blog_topics_last_used ON blog_topics(last_used_at);
CREATE INDEX idx_blog_topics_deleted ON blog_topics(deleted_at) WHERE deleted_at IS NULL;

-- Índice vetorial para busca de similaridade (usando pgvector)
CREATE INDEX idx_blog_topics_embedding ON blog_topics USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- =====================================================
-- Tabela de histórico de uso de tópicos
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_topic_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  topic_id UUID REFERENCES blog_topics(id) ON DELETE CASCADE,
  post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  
  topic_text TEXT NOT NULL, -- Snapshot do tópico no momento do uso
  category TEXT NOT NULL,
  
  -- Métricas do post gerado
  generation_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Analytics
  post_views INTEGER DEFAULT 0,
  post_engagement JSONB -- likes, shares, comments, etc
);

CREATE INDEX idx_topic_usage_topic_id ON blog_topic_usage_history(topic_id);
CREATE INDEX idx_topic_usage_post_id ON blog_topic_usage_history(post_id);
CREATE INDEX idx_topic_usage_created ON blog_topic_usage_history(created_at DESC);

-- =====================================================
-- Tabela de bloqueio de tópicos similares
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_topic_similarity_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  topic_id UUID REFERENCES blog_topics(id) ON DELETE CASCADE,
  blocked_topic_id UUID REFERENCES blog_topics(id) ON DELETE CASCADE,
  
  similarity_score FLOAT NOT NULL, -- 0.0 a 1.0 (quanto maior, mais similar)
  reason TEXT,
  
  -- Evitar duplicatas
  UNIQUE(topic_id, blocked_topic_id)
);

CREATE INDEX idx_similarity_blocks_topic ON blog_topic_similarity_blocks(topic_id);
CREATE INDEX idx_similarity_blocks_score ON blog_topic_similarity_blocks(similarity_score DESC);

-- =====================================================
-- Função para atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_blog_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_topics_updated_at
  BEFORE UPDATE ON blog_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_topics_updated_at();

-- =====================================================
-- Função para buscar tópico único (não usado recentemente)
-- =====================================================
CREATE OR REPLACE FUNCTION get_unique_blog_topic(
  p_category TEXT,
  p_similarity_threshold FLOAT DEFAULT 0.85,
  p_recent_days INTEGER DEFAULT 90
)
RETURNS TABLE (
  id UUID,
  topic TEXT,
  category TEXT,
  times_used INTEGER,
  last_used_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bt.id,
    bt.topic,
    bt.category,
    bt.times_used,
    bt.last_used_at
  FROM blog_topics bt
  WHERE 
    bt.category = p_category
    AND bt.status = 'available'
    AND bt.deleted_at IS NULL
    AND bt.approved = true
    AND (
      bt.last_used_at IS NULL 
      OR bt.last_used_at < NOW() - INTERVAL '1 day' * p_recent_days
    )
    -- Não está bloqueado por similaridade com tópicos usados recentemente
    AND NOT EXISTS (
      SELECT 1 FROM blog_topic_similarity_blocks bsb
      JOIN blog_topic_usage_history btuh ON btuh.topic_id = bsb.blocked_topic_id
      WHERE bsb.topic_id = bt.id
      AND bsb.similarity_score >= p_similarity_threshold
      AND btuh.created_at > NOW() - INTERVAL '1 day' * p_recent_days
    )
  ORDER BY 
    -- Priorizar por: nunca usados > menos usados > prioridade > aleatório
    CASE WHEN bt.times_used = 0 THEN 0 ELSE 1 END,
    bt.times_used ASC,
    bt.priority DESC,
    RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Função para marcar tópico como usado
-- =====================================================
CREATE OR REPLACE FUNCTION mark_topic_as_used(
  p_topic_id UUID,
  p_post_id UUID DEFAULT NULL,
  p_generation_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Atualizar tópico
  UPDATE blog_topics
  SET 
    times_used = times_used + 1,
    last_used_at = NOW(),
    status = CASE 
      WHEN times_used >= 3 THEN 'used' -- Após 3 usos, marcar como usado
      ELSE status 
    END
  WHERE id = p_topic_id;
  
  -- Registrar no histórico
  INSERT INTO blog_topic_usage_history (
    topic_id,
    post_id,
    topic_text,
    category,
    generation_time_ms
  )
  SELECT 
    id,
    p_post_id,
    topic,
    category,
    p_generation_time_ms
  FROM blog_topics
  WHERE id = p_topic_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Função para calcular e armazenar similaridades
-- (Será chamada periodicamente ou após novos tópicos)
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_topic_similarities(
  p_threshold FLOAT DEFAULT 0.85
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Deletar similaridades antigas
  DELETE FROM blog_topic_similarity_blocks;
  
  -- Calcular e inserir novas similaridades
  INSERT INTO blog_topic_similarity_blocks (topic_id, blocked_topic_id, similarity_score, reason)
  SELECT 
    t1.id as topic_id,
    t2.id as blocked_topic_id,
    1 - (t1.embedding <=> t2.embedding) as similarity_score,
    'Auto-detected similarity above threshold'
  FROM blog_topics t1
  CROSS JOIN blog_topics t2
  WHERE 
    t1.id != t2.id
    AND t1.embedding IS NOT NULL
    AND t2.embedding IS NOT NULL
    AND t1.deleted_at IS NULL
    AND t2.deleted_at IS NULL
    AND 1 - (t1.embedding <=> t2.embedding) >= p_threshold
  ON CONFLICT (topic_id, blocked_topic_id) DO NOTHING;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Views para dashboard
-- =====================================================

-- View: Estatísticas gerais de tópicos
CREATE OR REPLACE VIEW blog_topics_stats AS
SELECT 
  category,
  COUNT(*) as total_topics,
  COUNT(*) FILTER (WHERE status = 'available') as available_topics,
  COUNT(*) FILTER (WHERE status = 'used') as used_topics,
  COUNT(*) FILTER (WHERE status = 'blocked') as blocked_topics,
  COUNT(*) FILTER (WHERE times_used = 0) as never_used,
  AVG(times_used) as avg_times_used,
  MAX(last_used_at) as last_topic_used_at
FROM blog_topics
WHERE deleted_at IS NULL
GROUP BY category;

-- View: Tópicos mais usados
CREATE OR REPLACE VIEW blog_topics_most_used AS
SELECT 
  id,
  topic,
  category,
  times_used,
  last_used_at,
  (
    SELECT COUNT(*) 
    FROM blog_topic_usage_history 
    WHERE topic_id = blog_topics.id 
    AND success = true
  ) as successful_posts
FROM blog_topics
WHERE deleted_at IS NULL
ORDER BY times_used DESC, last_used_at DESC
LIMIT 50;

-- View: Análise de uso recente (últimos 30 dias)
CREATE OR REPLACE VIEW blog_topics_recent_usage AS
SELECT 
  DATE(created_at) as usage_date,
  category,
  COUNT(*) as topics_used,
  COUNT(*) FILTER (WHERE success = true) as successful_generations,
  AVG(generation_time_ms) as avg_generation_time_ms
FROM blog_topic_usage_history
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), category
ORDER BY usage_date DESC, category;

-- =====================================================
-- RLS (Row Level Security) - Opcional
-- =====================================================

ALTER TABLE blog_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_topic_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_topic_similarity_blocks ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura pública de tópicos aprovados
CREATE POLICY "Public read access to approved topics"
  ON blog_topics FOR SELECT
  USING (approved = true AND deleted_at IS NULL);

-- Policy: Admin tem acesso total
CREATE POLICY "Admin full access to topics"
  ON blog_topics FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to usage history"
  ON blog_topic_usage_history FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access to similarity blocks"
  ON blog_topic_similarity_blocks FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Comentários para documentação
-- =====================================================

COMMENT ON TABLE blog_topics IS 'Pool de tópicos para geração automática de posts no blog';
COMMENT ON COLUMN blog_topics.embedding IS 'Vetor de embedding para detecção de similaridade (OpenAI ada-002)';
COMMENT ON COLUMN blog_topics.status IS 'available: nunca usado ou pouco usado | used: usado várias vezes | blocked: bloqueado manualmente | archived: arquivado';
COMMENT ON FUNCTION get_unique_blog_topic IS 'Busca um tópico único que não foi usado recentemente e não é similar a tópicos usados recentemente';
COMMENT ON FUNCTION mark_topic_as_used IS 'Marca tópico como usado e registra no histórico';
COMMENT ON FUNCTION calculate_topic_similarities IS 'Calcula similaridades entre todos os tópicos e armazena bloqueios automáticos';
