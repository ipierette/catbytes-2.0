-- =====================================================
-- MIGRATION: Corrigir schema e adicionar índices
-- =====================================================

-- 1. Verificar e adicionar coluna 'status' na tabela instagram_posts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='instagram_posts' AND column_name='status') THEN
        ALTER TABLE instagram_posts ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- 2. Verificar e adicionar coluna 'scheduled_for' na tabela instagram_posts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='instagram_posts' AND column_name='scheduled_for') THEN
        ALTER TABLE instagram_posts ADD COLUMN scheduled_for TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Verificar e adicionar coluna 'approved_at' na tabela instagram_posts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='instagram_posts' AND column_name='approved_at') THEN
        ALTER TABLE instagram_posts ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. Verificar e adicionar coluna 'published_at' na tabela instagram_posts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='instagram_posts' AND column_name='published_at') THEN
        ALTER TABLE instagram_posts ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 5. Verificar e adicionar coluna 'instagram_post_id' na tabela instagram_posts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='instagram_posts' AND column_name='instagram_post_id') THEN
        ALTER TABLE instagram_posts ADD COLUMN instagram_post_id TEXT;
    END IF;
END $$;

-- 6. Verificar e adicionar coluna 'error_message' na tabela instagram_posts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='instagram_posts' AND column_name='error_message') THEN
        ALTER TABLE instagram_posts ADD COLUMN error_message TEXT;
    END IF;
END $$;

-- 7. Verificar e adicionar coluna 'status' na tabela blog_posts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blog_posts' AND column_name='status') THEN
        ALTER TABLE blog_posts ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
END $$;

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_instagram_posts_status ON instagram_posts(status);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_scheduled ON instagram_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- 9. Criar tabelas de configurações se não existirem
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_settings (
  id SERIAL PRIMARY KEY,
  auto_generation_enabled BOOLEAN DEFAULT true,
  batch_size INTEGER DEFAULT 10,
  last_generation_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Inserir configuração padrão de automação
INSERT INTO automation_settings (id, auto_generation_enabled, batch_size)
VALUES (1, true, 10)
ON CONFLICT (id) DO NOTHING;

-- 11. Atualizar posts existentes sem status
UPDATE instagram_posts SET status = 'pending' WHERE status IS NULL;
UPDATE blog_posts SET status = 'draft' WHERE status IS NULL;

-- 12. Adicionar coluna preferred_language na newsletter_subscribers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='newsletter_subscribers' AND column_name='preferred_language') THEN
        ALTER TABLE newsletter_subscribers ADD COLUMN preferred_language TEXT DEFAULT 'pt-BR';
    END IF;
END $$;

-- 13. Adicionar coluna original_post_id na blog_posts (para traduções)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blog_posts' AND column_name='original_post_id') THEN
        ALTER TABLE blog_posts ADD COLUMN original_post_id INTEGER REFERENCES blog_posts(id);
    END IF;
END $$;

-- 14. Adicionar índice para consultas de posts traduzidos
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale ON blog_posts(locale);
CREATE INDEX IF NOT EXISTS idx_blog_posts_original ON blog_posts(original_post_id);

-- =====================================================
-- Concluído!
-- =====================================================
