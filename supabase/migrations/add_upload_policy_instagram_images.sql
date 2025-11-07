-- =====================================================
-- Storage Policy: Permitir upload de imagens por usuários autenticados
-- Para o modal Text-only IA + IMG que usa supabase client
-- =====================================================

-- 1. Política de INSERT: Usuários autenticados podem fazer upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instagram-images');

-- 2. Política de UPDATE: Usuários podem atualizar suas próprias imagens
CREATE POLICY "Authenticated users can update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'instagram-images');

-- =====================================================
-- Verificação (opcional - execute depois)
-- =====================================================

-- Ver todas as políticas do bucket instagram-images:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Testar se bucket existe:
-- SELECT id, name, public FROM storage.buckets WHERE id = 'instagram-images';
