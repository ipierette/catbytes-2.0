-- Add image_prompt and content_image_prompts columns to blog_posts
-- Add image_prompt and content_image_prompts columns to blog_posts
-- Uses DO block to check if columns exist before adding

DO $$
BEGIN
  -- Add image_prompt column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'image_prompt'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN image_prompt TEXT;
  END IF;

  -- Add content_image_prompts column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'content_image_prompts'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN content_image_prompts TEXT[];
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN blog_posts.image_prompt IS 'AI prompt used to generate the cover image';
COMMENT ON COLUMN blog_posts.content_image_prompts IS 'Array of AI prompts for content images (diagrams, flowcharts, etc)';-- Add index for filtering posts with prompts
CREATE INDEX IF NOT EXISTS idx_blog_posts_image_prompt ON blog_posts(image_prompt) WHERE image_prompt IS NOT NULL;
