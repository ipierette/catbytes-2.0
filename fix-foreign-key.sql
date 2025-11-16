-- Verificar artigos com translated_from referenciando IDs inexistentes
SELECT id, title, translated_from 
FROM blog_posts 
WHERE translated_from IS NOT NULL 
  AND translated_from NOT IN (SELECT id FROM blog_posts);

-- Corrigir: remover referências inválidas
UPDATE blog_posts 
SET translated_from = NULL 
WHERE translated_from IS NOT NULL 
  AND translated_from NOT IN (SELECT id FROM blog_posts);
