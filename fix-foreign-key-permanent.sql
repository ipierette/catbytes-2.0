-- SOLUÇÃO PERMANENTE: Configurar CASCADE na foreign key

-- 1. Remover a constraint atual
ALTER TABLE blog_posts 
DROP CONSTRAINT IF EXISTS blog_posts_translated_from_fkey;

-- 2. Recriar com ON DELETE CASCADE
-- Isso faz com que quando um artigo for deletado, 
-- todos os artigos que o referenciam tenham translated_from = NULL automaticamente
ALTER TABLE blog_posts
ADD CONSTRAINT blog_posts_translated_from_fkey 
FOREIGN KEY (translated_from) 
REFERENCES blog_posts(id) 
ON DELETE SET NULL;

-- 3. Limpar referências inválidas existentes
UPDATE blog_posts 
SET translated_from = NULL 
WHERE translated_from IS NOT NULL 
  AND translated_from NOT IN (SELECT id FROM blog_posts);

-- 4. Verificar se ainda há referências inválidas
SELECT COUNT(*) as invalid_references
FROM blog_posts 
WHERE translated_from IS NOT NULL 
  AND translated_from NOT IN (SELECT id FROM blog_posts);
