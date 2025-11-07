-- Migration: Garantir política RLS correta para instagram-images
-- Data: 2025-11-06
-- Descrição: Remove políticas duplicadas e cria políticas corretas para upload

-- 1. Remove todas as políticas existentes para garantir um estado limpo
DROP POLICY IF EXISTS "authenticated_users_upload_instagram_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_update_instagram_images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for instagram images" ON storage.objects;

-- 2. Cria política para INSERT (upload)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instagram-images');

-- 3. Cria política para UPDATE
CREATE POLICY "Authenticated users can update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'instagram-images');

-- 4. Cria política para SELECT (leitura pública)
CREATE POLICY "Public read access for instagram images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'instagram-images');

-- 5. Cria política para DELETE (apenas usuários autenticados)
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'instagram-images');

-- 6. Verificação final
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
