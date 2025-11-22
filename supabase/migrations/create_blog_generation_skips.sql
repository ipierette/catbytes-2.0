-- Create table for tracking days when automatic blog generation should be skipped
CREATE TABLE IF NOT EXISTS blog_generation_skips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skip_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin'
);

-- Create index on skip_date for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_generation_skips_date ON blog_generation_skips(skip_date);

-- Add RLS policies
ALTER TABLE blog_generation_skips ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read skips (to check if generation should be skipped)
CREATE POLICY "Allow public read access to blog_generation_skips"
  ON blog_generation_skips
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/delete skips (admin only)
CREATE POLICY "Allow service role to insert blog_generation_skips"
  ON blog_generation_skips
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to delete blog_generation_skips"
  ON blog_generation_skips
  FOR DELETE
  USING (true);

-- Add comment
COMMENT ON TABLE blog_generation_skips IS 'Tracks dates when automatic blog post generation should be skipped. Manual posts still trigger newsletter and social media.';
