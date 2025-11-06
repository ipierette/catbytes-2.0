# 🔧 Como Aplicar as Migrations

## Problemas Atuais

### 1. Erro ao salvar posts (DALL-E, Stability, Text-only):
```
"Could not find the 'generation_method' column of 'instagram_posts' in the schema cache"
```

### 2. Erro ao salvar posts com nicho 'tech':
```
"new row for relation "instagram_posts" violates check constraint "instagram_posts_nicho_check"
```

## Solução: Aplicar 2 Migrations no Supabase

### Opção 1: Via Dashboard do Supabase (Recomendado) ⭐

1. **Acessar**: https://supabase.com/dashboard
2. **Ir para**: Seu projeto → SQL Editor
3. **Copiar e colar AMBOS os SQLs abaixo** (em ordem):

#### Migration 1: Adicionar coluna generation_method ✅

```sql
-- Migration: Adiciona coluna generation_method na tabela instagram_posts
-- Data: 2025-11-06

-- Adicionar coluna generation_method
ALTER TABLE instagram_posts 
ADD COLUMN IF NOT EXISTS generation_method TEXT DEFAULT 'ai-traditional';

-- Adicionar comentário na coluna
COMMENT ON COLUMN instagram_posts.generation_method IS 'Método usado para gerar o post: ai-traditional, dalle-3, stability-ai, text-only-manual';

-- Criar índice para queries por método de geração
CREATE INDEX IF NOT EXISTS idx_instagram_posts_generation_method 
ON instagram_posts(generation_method);

-- Atualizar posts existentes que não têm o campo
UPDATE instagram_posts 
SET generation_method = 'ai-traditional' 
WHERE generation_method IS NULL;

-- Adicionar constraint para valores válidos
ALTER TABLE instagram_posts
ADD CONSTRAINT check_generation_method 
CHECK (generation_method IN ('ai-traditional', 'dalle-3', 'stability-ai', 'text-only-manual'));
```

#### Migration 2: Corrigir constraint de nicho ✅

```sql
-- Migration: Remove constraint restritivo de nicho
-- Data: 2025-11-06

-- Remover constraint antigo (se existir)
ALTER TABLE instagram_posts 
DROP CONSTRAINT IF EXISTS instagram_posts_nicho_check;

-- Adicionar constraint mais flexível (apenas não-vazio)
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_nicho_check 
CHECK (nicho IS NOT NULL AND LENGTH(TRIM(nicho)) > 0);

-- Comentário explicativo
COMMENT ON COLUMN instagram_posts.nicho IS 'Nicho ou categoria do post (tech, business, lifestyle, education, fitness, etc). Aceita qualquer valor não-vazio.';
```

4. **Executar** (botão "Run" ou Ctrl/Cmd + Enter)
5. **Verificar**: Se não houver erros, está pronto!

---

### Opção 2: Via CLI do Supabase

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Login
supabase login

# 3. Link ao projeto
supabase link --project-ref seu-project-id

# 4. Aplicar migrations
supabase db push
```

---

## Verificar se Funcionou

### Via SQL Editor:
```sql
-- Ver estrutura da tabela (generation_method)
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'instagram_posts' 
AND column_name = 'generation_method';

-- Ver constraints de nicho
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'instagram_posts_nicho_check';
```

**Resultado Esperado (generation_method):**
```
column_name       | data_type | column_default
generation_method | text      | 'ai-traditional'
```

**Resultado Esperado (nicho):**
```
constraint_name                | check_clause
instagram_posts_nicho_check    | ((nicho IS NOT NULL) AND (length(btrim(nicho)) > 0))
```

---

## Testar Geração de Posts

Após aplicar AMBAS as migrations, teste:

1. **DALL-E 3**: ✅ Deve funcionar sem erro PGRST204 ou constraint
2. **Stability AI**: ✅ Deve funcionar sem erro PGRST204 ou constraint
3. **Texto IA + IMG**: ✅ Deve funcionar completamente
4. **Nicho 'tech'**: ✅ Deve ser aceito sem erro

---

## Valores Permitidos

### generation_method (novo campo)
- `ai-traditional` - Geração IA tradicional (GPT-4 + imagem)
- `dalle-3` - Gerado com DALL-E 3
- `stability-ai` - Gerado com Stability AI
- `text-only-manual` - Texto IA + imagem manual

### nicho (constraint atualizado)
- **Antes**: Apenas valores específicos (limitado)
- **Agora**: Qualquer valor não-vazio (flexível) ✨
- Exemplos aceitos: `tech`, `business`, `lifestyle`, `education`, `fitness`, `saúde`, `automação`, etc.

---

## Rollback (se necessário)

### Para reverter generation_method:
```sql
ALTER TABLE instagram_posts DROP CONSTRAINT IF EXISTS check_generation_method;
DROP INDEX IF EXISTS idx_instagram_posts_generation_method;
ALTER TABLE instagram_posts DROP COLUMN IF EXISTS generation_method;
```

### Para reverter nicho (voltar ao antigo):
```sql
ALTER TABLE instagram_posts DROP CONSTRAINT IF EXISTS instagram_posts_nicho_check;
-- Recriar constraint antigo aqui (se necessário)
```

---

## 🎯 Resumo

**2 Migrations para aplicar:**
1. ✅ Adicionar coluna `generation_method`
2. ✅ Remover constraint restritivo de `nicho`

**Após aplicar:**
- DALL-E 3 funcionará ✅
- Stability AI funcionará ✅
- Texto IA + IMG funcionará ✅
- Qualquer nicho será aceito ✅

**Tempo estimado:** 2 minutos ⏱️
