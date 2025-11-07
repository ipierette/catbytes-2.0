-- =====================================================
-- FIX: Remover política duplicada e recriar corretamente
-- =====================================================

-- 1. Remover política antiga (se existir)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their images" ON storage.objects;

-- 2. Criar política correta de INSERT para usuários autenticados
CREATE POLICY "authenticated_users_upload_instagram_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instagram-images');

-- 3. Criar política correta de UPDATE para usuários autenticados
CREATE POLICY "authenticated_users_update_instagram_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'instagram-images');

-- =====================================================
-- Verificação
-- =====================================================

-- Ver todas as políticas:
SELECT 
  policyname, 
  cmd as operation,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%instagram%';
