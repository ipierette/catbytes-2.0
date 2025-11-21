# 🚨 AÇÃO OBRIGATÓRIA - Execute Este SQL no Supabase

## Problema
Instagram SmartGenerate mostra erro 400:
```
Error: Apenas 0 de 1 foram salvos
POST /rest/v1/instagram_posts 400 (Bad Request)
```

## Causa
Status `'draft'` e `'scheduled'` não existem no constraint do banco.

## Solução

### 1. Acesse o Supabase SQL Editor
https://supabase.com/dashboard/project/lbjekucdxgouwgegpdhi/sql/new

### 2. Cole e Execute Este SQL

```sql
-- Remover constraint antiga
ALTER TABLE instagram_posts
DROP CONSTRAINT IF EXISTS instagram_posts_status_check;

-- Criar nova constraint com 'draft' e 'scheduled'
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_status_check 
CHECK (status IN (
  'pending',
  'approved', 
  'rejected', 
  'published', 
  'failed',
  'draft',
  'scheduled'
));
```

### 3. Verificar
Após executar, rode este SQL para confirmar:

```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'instagram_posts_status_check';
```

**Resultado esperado:**
```
constraint_name              | constraint_definition
instagram_posts_status_check | CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'published'::text, 'failed'::text, 'draft'::text, 'scheduled'::text])))
```

---

## ✅ Depois de Executar

1. Volte para `/admin/instagram`
2. Clique em "Gerar com IA"
3. Gere 1 post de teste
4. Tente "Salvar como Rascunho"
5. Deve funcionar sem erro 400 ✅

---

**Arquivo SQL:** `supabase/migrations/20251121_add_draft_scheduled_status.sql`
