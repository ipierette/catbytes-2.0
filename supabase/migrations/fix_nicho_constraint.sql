-- Migration: Remove constraint restritivo de nicho
-- Data: 2025-11-06
-- Descrição: Remove ou atualiza constraint de nicho para aceitar qualquer valor

-- Remover constraint antigo (se existir)
ALTER TABLE instagram_posts 
DROP CONSTRAINT IF EXISTS instagram_posts_nicho_check;

-- Adicionar constraint mais flexível (apenas não-vazio)
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_nicho_check 
CHECK (nicho IS NOT NULL AND LENGTH(TRIM(nicho)) > 0);

-- Comentário explicativo
COMMENT ON COLUMN instagram_posts.nicho IS 'Nicho ou categoria do post (tech, business, lifestyle, education, fitness, etc). Aceita qualquer valor não-vazio.';
