-- Migration: Adiciona coluna generation_method na tabela instagram_posts
-- Data: 2025-11-06
-- Descrição: Adiciona tracking do método de geração (IA tradicional, DALL-E 3, Stability AI, Text-only manual)

-- Adicionar coluna generation_method
ALTER TABLE instagram_posts 
ADD COLUMN IF NOT EXISTS generation_method TEXT DEFAULT 'ai-traditional';

-- Adicionar comentário na coluna
COMMENT ON COLUMN instagram_posts.generation_method IS 'Método usado para gerar o post: ai-traditional, dalle-3, stability-ai, text-only-manual';

-- Criar índice para queries por método de geração
CREATE INDEX IF NOT EXISTS idx_instagram_posts_generation_method 
ON instagram_posts(generation_method);

-- Atualizar posts existentes que não têm o campo
UPDATE instagram_posts 
SET generation_method = 'ai-traditional' 
WHERE generation_method IS NULL;

-- Adicionar constraint para valores válidos
ALTER TABLE instagram_posts
ADD CONSTRAINT check_generation_method 
CHECK (generation_method IN ('ai-traditional', 'dalle-3', 'stability-ai', 'text-only-manual'));
