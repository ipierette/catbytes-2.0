-- Migration: Criar usuário admin no Supabase Auth
-- Data: 2025-11-07
-- Descrição: Cria o usuário admin no Supabase Auth para permitir upload de imagens

-- IMPORTANTE: Execute isso no SQL Editor do Supabase Dashboard

-- 1. Verificar se o usuário já existe
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'ipierette2@gmail.com';

-- 2. Se NÃO existir, você precisa criar via Dashboard:
-- Vá em: Authentication > Users > Add User
-- Email: ipierette2@gmail.com
-- Password: C@T-BYt3s1460071-- (mesma senha do admin)
-- ✅ Marque "Auto Confirm User"

-- 3. Após criar o usuário, verifique:
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  role
FROM auth.users 
WHERE email = 'ipierette2@gmail.com';

-- 5. Verificar políticas RLS novamente
SELECT 
  policyname,
  cmd as operation,
  roles::text
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
