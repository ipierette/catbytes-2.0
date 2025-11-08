#!/bin/bash
# Script para aplicar migração de image_prompt de forma segura

echo "🔧 Aplicando migração de image_prompt..."
echo ""
echo "📋 Este script vai adicionar as colunas:"
echo "   - image_prompt (TEXT)"
echo "   - content_image_prompts (TEXT[])"
echo ""
echo "⚠️  IMPORTANTE: Execute este SQL no Supabase Dashboard > SQL Editor"
echo ""
echo "================================================"
cat << 'EOF'

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'blog_posts' 
    AND column_name = 'image_prompt'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN image_prompt TEXT;
    RAISE NOTICE 'Adicionada coluna: image_prompt';
  ELSE
    RAISE NOTICE 'Coluna image_prompt já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'blog_posts' 
    AND column_name = 'content_image_prompts'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN content_image_prompts TEXT[];
    RAISE NOTICE 'Adicionada coluna: content_image_prompts';
  ELSE
    RAISE NOTICE 'Coluna content_image_prompts já existe';
  END IF;
END $$;

EOF
echo "================================================"
echo ""
echo "✅ Copie o SQL acima e execute no Supabase Dashboard"
echo "   https://supabase.com/dashboard/project/YOUR_PROJECT/sql"
echo ""
