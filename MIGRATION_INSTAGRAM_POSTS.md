# 🔧 Migration: Corrigir Instagram Posts

## ❌ Problema
```
POST https://lbjekucdxgouwgegpdhi.supabase.co/rest/v1/instagram_posts 400 (Bad Request)
Error: Apenas 0 de 1 foram salvos
```

**Causa:** Código tenta inserir coluna `generation_method` mas ela não existe no banco de dados.

## ✅ Solução

### Passo 1: Aplicar SQL no Supabase

1. Acesse: https://supabase.com/dashboard/project/lbjekucdxgouwgegpdhi/sql/new
2. Cole o SQL abaixo:

```sql
-- Migration: Adicionar SMART_GENERATE aos métodos de geração
-- Data: 2025-11-21

-- 1. Adicionar coluna se não existe
ALTER TABLE instagram_posts 
ADD COLUMN IF NOT EXISTS generation_method TEXT DEFAULT 'ai-traditional';

-- 2. Remover constraint antiga
ALTER TABLE instagram_posts
DROP CONSTRAINT IF EXISTS check_generation_method;

-- 3. Criar nova constraint com SMART_GENERATE
ALTER TABLE instagram_posts
ADD CONSTRAINT check_generation_method 
CHECK (generation_method IN (
  'ai-traditional', 
  'dalle-3', 
  'stability-ai', 
  'text-only-manual',
  'leonardo-ai',
  'nanobanana',
  'SMART_GENERATE'
));

-- 4. Atualizar posts existentes sem generation_method
UPDATE instagram_posts 
SET generation_method = 'ai-traditional' 
WHERE generation_method IS NULL;

-- 5. Criar índice se não existe
CREATE INDEX IF NOT EXISTS idx_instagram_posts_generation_method 
ON instagram_posts(generation_method);

-- 6. Adicionar comentário
COMMENT ON COLUMN instagram_posts.generation_method IS 'Método usado para gerar o post: ai-traditional, dalle-3, stability-ai, text-only-manual, leonardo-ai, nanobanana, SMART_GENERATE';
```

3. Clique em **Run** (ou Ctrl+Enter)

### Passo 2: Verificar se funcionou

Execute no SQL Editor:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'instagram_posts' 
  AND column_name = 'generation_method';
```

**Resultado esperado:**
```
column_name        | data_type | is_nullable | column_default
generation_method  | text      | YES         | 'ai-traditional'::text
```

### Passo 3: Testar SmartGenerateModal

1. Abra `/admin/instagram`
2. Clique em "Gerar com IA"
3. Gere 1 post
4. Salve como rascunho, agende ou publique
5. Deve funcionar sem erro 400 ✅

## 📊 Status Atual

- ❌ `generation_method` não existe na tabela
- ✅ Código usa `generation_method` em todos os inserts
- ✅ Migration criada em `supabase/migrations/20251121_add_smart_generate.sql`
- ⏳ Aguardando aplicação manual no Supabase

## 🔍 Como Validar

```bash
# Depois de aplicar o SQL, teste:
npm run dev

# Abra:
# http://localhost:3000/admin/instagram
# Clique em "Gerar com IA" → Salvar rascunho
# Não deve ter erro 400
```

## 📝 Outros Fixes Necessários

### Fix: Erro ao abrir painel de tópicos

O erro `Cannot read properties of undefined (reading 'map')` ainda ocorre porque o fix anterior não pegou no build.

**Solução:** Revalidar cache do Vercel ou aguardar próximo deploy.

**Arquivo:** `app/admin/blog/topics/page.tsx`
**Linha:** 548
**Fix aplicado:** `topic.tags && topic.tags.length > 0` (commit 687af0d)
