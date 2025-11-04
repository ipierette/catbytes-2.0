-- =====================================================
-- Supabase Storage Setup for Blog Images
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Criar o bucket para imagens do blog
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,  -- Bucket público
  52428800,  -- 50 MB limit por arquivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']  -- Tipos permitidos
)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS (Row Level Security) no bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Política: Qualquer pessoa pode VER imagens (leitura pública)
CREATE POLICY "Public Access to Blog Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- 4. Política: Apenas service_role pode FAZER UPLOAD
CREATE POLICY "Service Role Can Upload Blog Images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'blog-images');

-- 5. Política: Apenas service_role pode ATUALIZAR
CREATE POLICY "Service Role Can Update Blog Images"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

-- 6. Política: Apenas service_role pode DELETAR
CREATE POLICY "Service Role Can Delete Blog Images"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'blog-images');

-- =====================================================
-- Verificação (opcional - execute depois)
-- =====================================================

-- Verificar se o bucket foi criado:
-- SELECT * FROM storage.buckets WHERE id = 'blog-images';

-- Verificar políticas criadas:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%Blog Images%';

-- Ver todos os buckets:
-- SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets;
