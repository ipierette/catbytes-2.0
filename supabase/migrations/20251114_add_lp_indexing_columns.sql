-- Adiciona colunas para sistema de auto-indexação de LPs
ALTER TABLE landing_pages
ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS seo_score INTEGER,
ADD COLUMN IF NOT EXISTS last_indexing_status JSONB;

-- Índice para buscar LPs não indexadas
CREATE INDEX IF NOT EXISTS landing_pages_indexed_at_idx ON landing_pages(indexed_at DESC);

-- Comentários
COMMENT ON COLUMN landing_pages.indexed_at IS 'Data/hora da última submissão ao Google Indexing API';
COMMENT ON COLUMN landing_pages.seo_score IS 'Score de SEO (0-100) calculado automaticamente';
COMMENT ON COLUMN landing_pages.last_indexing_status IS 'Último resultado completo da indexação (JSON)';
