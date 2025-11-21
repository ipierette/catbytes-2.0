-- =========================================================
-- RODAR ESTE SQL NO SUPABASE SQL EDITOR
-- Atualiza funções para NUNCA repetir tópicos
-- =========================================================

-- 1. Atualizar função get_unique_blog_topic (NUNCA REPETIR)
CREATE OR REPLACE FUNCTION get_unique_blog_topic(
  p_category TEXT,
  p_similarity_threshold FLOAT DEFAULT 0.85,
  p_recent_days INTEGER DEFAULT 90000
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
    -- ⚠️ MUDANÇA CRÍTICA: NUNCA USAR TÓPICOS JÁ USADOS (sem cooldown)
    AND bt.times_used = 0
    -- Não está bloqueado por similaridade com tópicos já usados
    AND NOT EXISTS (
      SELECT 1 FROM blog_topic_similarity_blocks bsb
      JOIN blog_topics bt_used ON bsb.blocked_topic_id = bt_used.id
      WHERE bsb.topic_id = bt.id
      AND bsb.similarity_score >= p_similarity_threshold
      AND bt_used.times_used > 0
    )
  ORDER BY 
    bt.priority DESC,
    RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 2. Atualizar função calculate_topic_similarities (sem DELETE)
CREATE OR REPLACE FUNCTION calculate_topic_similarities(
  p_threshold FLOAT DEFAULT 0.85
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- ⚠️ MUDANÇA: Removido DELETE (acumula similaridades)
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

-- 3. Rodar cálculo de similaridades
SELECT calculate_topic_similarities(0.85) as new_similarities_added;

-- 4. Verificar stats
SELECT 
  COUNT(*) as total_blocks,
  AVG(similarity_score) as avg_score,
  MAX(similarity_score) as max_score,
  MIN(similarity_score) as min_score
FROM blog_topic_similarity_blocks;

SELECT 
  category,
  COUNT(*) FILTER (WHERE times_used = 0) as nunca_usados,
  COUNT(*) FILTER (WHERE times_used > 0) as ja_usados,
  COUNT(*) as total
FROM blog_topics
WHERE deleted_at IS NULL
GROUP BY category
ORDER BY category;
