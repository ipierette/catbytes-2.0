-- Tabela para rastrear uso de tópicos (garantir 2 anos sem repetição)
CREATE TABLE IF NOT EXISTS topic_usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- 'Automação e Negócios', 'Programação e IA', etc
  topic_text TEXT NOT NULL, -- Texto exato do tópico usado
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  
  CONSTRAINT unique_topic_per_category UNIQUE (category, topic_text)
);

-- Função para calcular data de reutilização (2 anos após uso)
CREATE OR REPLACE FUNCTION get_reusable_after(used_at_param TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT used_at_param + INTERVAL '730 days';
$$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_topic_usage_category ON topic_usage_history(category);
CREATE INDEX IF NOT EXISTS idx_topic_usage_recent ON topic_usage_history(used_at DESC);
CREATE INDEX IF NOT EXISTS idx_topic_reusable_calc ON topic_usage_history(get_reusable_after(used_at));

-- View para tópicos disponíveis (não usados ou reutilizáveis após 2 anos)
CREATE OR REPLACE VIEW available_topics_by_category AS
SELECT 
  category,
  COUNT(*) FILTER (WHERE get_reusable_after(used_at) > NOW()) as locked_topics,
  COUNT(*) FILTER (WHERE get_reusable_after(used_at) <= NOW()) as reusable_topics
FROM topic_usage_history
GROUP BY category;

COMMENT ON TABLE topic_usage_history IS 'Rastreia uso de tópicos de blog para evitar repetições em 2 anos';
COMMENT ON FUNCTION get_reusable_after IS 'Calcula data após qual o tópico pode ser reutilizado (2 anos após uso)';
