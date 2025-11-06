# 🔧 Como Aplicar a Migration

## Problema Atual
Erro ao salvar posts:
```
"Could not find the 'generation_method' column of 'instagram_posts' in the schema cache"
```

## Solução: Adicionar Coluna no Supabase

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. **Acessar**: https://supabase.com/dashboard
2. **Ir para**: Seu projeto → SQL Editor
3. **Copiar e colar** o SQL abaixo:

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

4. **Executar** (botão "Run" ou Ctrl/Cmd + Enter)
5. **Verificar**: Se não houver erros, está pronto!

### Opção 2: Via CLI do Supabase

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Login
supabase login

# 3. Link ao projeto
supabase link --project-ref seu-project-id

# 4. Aplicar migration
supabase db push
```

---

## Verificar se Funcionou

### Via SQL Editor:
```sql
-- Ver estrutura da tabela
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'instagram_posts' 
AND column_name = 'generation_method';
```

Deve retornar:
```
column_name       | data_type | column_default
generation_method | text      | 'ai-traditional'
```

---

## Testar Geração de Posts

Após aplicar a migration, teste:

1. **DALL-E 3**: Deve funcionar sem erro PGRST204
2. **Stability AI**: Deve funcionar sem erro PGRST204
3. **Texto IA + IMG**: Deve funcionar sem erro 401

---

## Valores Permitidos

A coluna `generation_method` aceita:
- `ai-traditional` - Geração IA tradicional (GPT-4 + imagem)
- `dalle-3` - Gerado com DALL-E 3
- `stability-ai` - Gerado com Stability AI
- `text-only-manual` - Texto IA + imagem manual

---

## Rollback (se necessário)

Para reverter a migration:

```sql
-- Remover constraint
ALTER TABLE instagram_posts DROP CONSTRAINT IF EXISTS check_generation_method;

-- Remover índice
DROP INDEX IF EXISTS idx_instagram_posts_generation_method;

-- Remover coluna
ALTER TABLE instagram_posts DROP COLUMN IF EXISTS generation_method;
```
