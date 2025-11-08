-- =====================================================
-- Migration: Add Image Prompts (Safe Version)
-- Date: 2025-11-07
-- Description: Safely adds image_prompt and content_image_prompts columns
-- =====================================================

-- Use DO block to check and add columns safely
DO $$
BEGIN
  -- Add image_prompt column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'blog_posts' 
    AND column_name = 'image_prompt'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN image_prompt TEXT;
    RAISE NOTICE 'Added column: image_prompt';
  ELSE
    RAISE NOTICE 'Column image_prompt already exists';
  END IF;

  -- Add content_image_prompts column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'blog_posts' 
    AND column_name = 'content_image_prompts'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN content_image_prompts TEXT[];
    RAISE NOTICE 'Added column: content_image_prompts';
  ELSE
    RAISE NOTICE 'Column content_image_prompts already exists';
  END IF;
END $$;

-- =====================================================
-- Migration Complete
-- =====================================================
