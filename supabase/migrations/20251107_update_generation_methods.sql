-- Migration: Atualizar constraint generation_method para incluir novos métodos
-- Data: 2025-11-07
-- Descrição: Adiciona leonardo-ai e nanobanana aos métodos válidos

-- 1. Remover constraint antiga
ALTER TABLE instagram_posts
DROP CONSTRAINT IF EXISTS check_generation_method;

-- 2. Criar nova constraint com todos os métodos
ALTER TABLE instagram_posts
ADD CONSTRAINT check_generation_method 
CHECK (generation_method IN (
  'ai-traditional', 
  'dalle-3', 
  'stability-ai', 
  'text-only-manual',
  'leonardo-ai',
  'nanobanana'
));

-- 3. Atualizar comentário
COMMENT ON COLUMN instagram_posts.generation_method IS 'Método usado para gerar o post: ai-traditional, dalle-3, stability-ai, text-only-manual, leonardo-ai, nanobanana';

-- 4. Verificação
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'check_generation_method';
