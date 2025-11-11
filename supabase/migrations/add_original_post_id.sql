-- Adiciona campo para rastrear post original em traduções
-- Executa apenas se a coluna não existir ainda

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'original_post_id') THEN
        ALTER TABLE blog_posts 
        ADD COLUMN original_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL;
        
        -- Adicionar índice para performance
        CREATE INDEX IF NOT EXISTS idx_blog_posts_original_post_id ON blog_posts(original_post_id);
        
        -- Comentário na coluna
        COMMENT ON COLUMN blog_posts.original_post_id IS 'ID do post original quando este é uma tradução';
    END IF;
END $$;