-- Migration: Adicionar SMART_GENERATE aos métodos de geração
-- Data: 2025-11-21
-- Descrição: Adiciona SMART_GENERATE e garante que generation_method existe

-- 1. Adicionar coluna se não existe
ALTER TABLE instagram_posts 
ADD COLUMN IF NOT EXISTS generation_method TEXT DEFAULT 'ai-traditional';

-- 2. Remover constraint antiga
ALTER TABLE instagram_posts
DROP CONSTRAINT IF EXISTS check_generation_method;

-- 3. Criar nova constraint com SMART_GENERATE
ALTER TABLE instagram_posts
ADD CONSTRAINT check_generation_method 
CHECK (generation_method IN (
  'ai-traditional', 
  'dalle-3', 
  'stability-ai', 
  'text-only-manual',
  'leonardo-ai',
  'nanobanana',
  'SMART_GENERATE'
));

-- 4. Atualizar posts existentes sem generation_method
UPDATE instagram_posts 
SET generation_method = 'ai-traditional' 
WHERE generation_method IS NULL;

-- 5. Criar índice se não existe
CREATE INDEX IF NOT EXISTS idx_instagram_posts_generation_method 
ON instagram_posts(generation_method);

-- 6. Adicionar comentário
COMMENT ON COLUMN instagram_posts.generation_method IS 'Método usado para gerar o post: ai-traditional, dalle-3, stability-ai, text-only-manual, leonardo-ai, nanobanana, SMART_GENERATE';
