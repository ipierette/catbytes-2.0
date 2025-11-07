-- =====================================================
-- Supabase Storage Setup for Instagram Images
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Criar o bucket para imagens do Instagram
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram-images', 'instagram-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Qualquer pessoa pode VER imagens (leitura pública)
CREATE POLICY "Public read access for instagram images"
ON storage.objects FOR SELECT
USING (bucket_id = 'instagram-images');

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
SELECT * FROM storage.buckets WHERE id = 'instagram-images';

-- Ver todos os buckets:
SELECT id, name, public, created_at FROM storage.buckets;

-- Ver políticas do bucket:
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
