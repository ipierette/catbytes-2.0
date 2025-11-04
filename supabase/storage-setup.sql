-- =====================================================
-- Supabase Storage Setup for Blog Images
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Criar o bucket para imagens do blog
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Qualquer pessoa pode VER imagens (leitura pública)
CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- =====================================================
-- IMPORTANTE: Service Role NÃO precisa de políticas!
-- =====================================================
-- O service_role key BYPASSA todas as políticas RLS automaticamente.
-- Por isso NÃO criamos políticas de INSERT/UPDATE/DELETE.
-- Nossa API route usa o service_role, então já tem acesso total.

-- =====================================================
-- Verificação (opcional - execute depois)
-- =====================================================

-- Verificar se o bucket foi criado:
-- SELECT * FROM storage.buckets WHERE id = 'blog-images';

-- Verificar políticas criadas:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Ver todos os buckets:
-- SELECT id, name, public FROM storage.buckets;
