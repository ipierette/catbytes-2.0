# 🔧 Configuração Rápida - Auto-Indexação de LPs

## ⚠️ Erro: "relation landing_pages does not exist"

Você precisa aplicar as migrations do Supabase primeiro.

---

## ✅ Solução em 3 Passos

### **Passo 1: Copiar SQL**

Copie o SQL abaixo:

```sql
-- Migration 1: Criar tabela landing_pages
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  niche VARCHAR(100) NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  cta_text VARCHAR(100) NOT NULL,
  theme_color VARCHAR(50) NOT NULL,
  
  -- Conteúdo gerado pela IA
  headline TEXT,
  subheadline TEXT,
  benefits JSONB,
  hero_image_url TEXT,
  html_content TEXT,
  
  -- Deploy info
  deploy_url TEXT,
  deploy_status VARCHAR(50) DEFAULT 'pending',
  github_repo_url TEXT,
  vercel_project_id TEXT,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Auto-indexação (NOVAS COLUNAS)
  indexed_at TIMESTAMPTZ,
  seo_score INTEGER,
  last_indexing_status JSONB,
  
  CONSTRAINT landing_pages_status_check CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT landing_pages_deploy_status_check CHECK (deploy_status IN ('pending', 'deploying', 'published', 'failed'))
);

-- Índices
CREATE INDEX IF NOT EXISTS landing_pages_status_idx ON landing_pages(status);
CREATE INDEX IF NOT EXISTS landing_pages_slug_idx ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS landing_pages_created_at_idx ON landing_pages(created_at DESC);
CREATE INDEX IF NOT EXISTS landing_pages_indexed_at_idx ON landing_pages(indexed_at DESC);

-- Comentários
COMMENT ON COLUMN landing_pages.indexed_at IS 'Data/hora da última submissão ao Google Indexing API';
COMMENT ON COLUMN landing_pages.seo_score IS 'Score de SEO (0-100) calculado automaticamente';
COMMENT ON COLUMN landing_pages.last_indexing_status IS 'Último resultado completo da indexação (JSON)';
```

---

### **Passo 2: Executar no Supabase**

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto **catbytes**
3. Menu lateral → **SQL Editor**
4. Clique em **New Query**
5. Cole o SQL acima
6. Clique em **Run** (Ctrl/Cmd + Enter)

✅ Deve aparecer: "Success. No rows returned"

---

### **Passo 3: Verificar**

Execute este SQL para confirmar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'landing_pages'
ORDER BY ordinal_position;
```

Deve listar **todas as colunas**, incluindo:
- `indexed_at` → timestamptz
- `seo_score` → integer
- `last_indexing_status` → jsonb

---

## 🎯 Pronto!

Agora o sistema de auto-indexação vai funcionar:

```bash
# Testar API de indexação
curl -X POST http://localhost:3000/api/landing-pages/generate-rich \
  -H "Content-Type: application/json" \
  -d '{"nicho": "consultorio", "tipo": "guia"}'
```

---

## 📝 Migrations Completas (Opcional)

Se preferir aplicar todas as migrations de uma vez:

```bash
# No terminal do projeto
cd /Users/Izadora1/Desktop/programacao/projetos/catbytes-2.0
./supabase/apply-migrations.sh
```

Escolha opção **2** e copie todo o SQL gerado.

---

## 🆘 Troubleshooting

### **Erro: "function uuid_generate_v4() does not exist"**

Execute antes:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Erro: "permission denied"**

Você está usando o usuário correto? Verifique:
```sql
SELECT current_user;
```

Deve retornar `postgres` ou seu usuário admin.

### **Tabela já existe mas faltam colunas**

Execute apenas o ALTER TABLE:
```sql
ALTER TABLE landing_pages
ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS seo_score INTEGER,
ADD COLUMN IF NOT EXISTS last_indexing_status JSONB;

CREATE INDEX IF NOT EXISTS landing_pages_indexed_at_idx ON landing_pages(indexed_at DESC);
```

---

## ✅ Verificação Final

Teste inserindo uma LP manualmente:

```sql
INSERT INTO landing_pages (title, slug, niche, problem, solution, cta_text, theme_color)
VALUES (
  'Teste Auto-Indexação',
  'teste-indexacao',
  'consultorio',
  'Problema teste',
  'Solução teste',
  'Fale Conosco',
  '#4F46E5'
);

-- Verificar
SELECT id, slug, indexed_at, seo_score FROM landing_pages WHERE slug = 'teste-indexacao';
```

Deve retornar a LP com `indexed_at` e `seo_score` como `null` (serão preenchidos quando indexar).

---

## 🚀 Próximo Passo

Após aplicar a migration, configure a **variável de ambiente** no Vercel:

```env
GOOGLE_INDEXING_KEY={"type":"service_account",...}
```

Veja instruções completas em: `docs/LP_AUTO_INDEXING_GUIDE.md`
