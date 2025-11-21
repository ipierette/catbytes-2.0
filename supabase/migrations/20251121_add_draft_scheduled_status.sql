-- Migration: Adicionar status 'draft' e 'scheduled' ao constraint
-- Data: 2025-11-21
-- Descrição: Permite salvar rascunhos e agendar posts no Instagram

-- 1. Remover constraint antiga
ALTER TABLE instagram_posts
DROP CONSTRAINT IF EXISTS instagram_posts_status_check;

-- 2. Criar nova constraint com 'draft' e 'scheduled'
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_status_check 
CHECK (status IN (
  'pending',
  'approved', 
  'rejected', 
  'published', 
  'failed',
  'draft',
  'scheduled'
));

-- 3. Verificar
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'instagram_posts_status_check';
