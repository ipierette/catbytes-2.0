-- Criar tabela para armazenar informações dos vlogs
CREATE TABLE IF NOT EXISTS vlogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  video_url TEXT NOT NULL,
  original_description TEXT,
  improved_description TEXT,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending', -- pending, published_instagram, published_linkedin, published_all
  published_to JSONB DEFAULT '[]'::jsonb, -- Array de plataformas onde foi publicado
  instagram_post_id TEXT,
  instagram_reel_id TEXT,
  linkedin_post_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_vlogs_status ON vlogs(status);
CREATE INDEX IF NOT EXISTS idx_vlogs_created_at ON vlogs(created_at DESC);

-- Comentários
COMMENT ON TABLE vlogs IS 'Armazena vídeos do vlog para publicação em múltiplas plataformas';
COMMENT ON COLUMN vlogs.status IS 'Status da publicação: pending, published_instagram, published_linkedin, published_all';
COMMENT ON COLUMN vlogs.published_to IS 'Array JSON com as plataformas onde foi publicado: ["instagram_feed", "instagram_reels", "linkedin"]';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_vlogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vlogs_updated_at
  BEFORE UPDATE ON vlogs
  FOR EACH ROW
  EXECUTE FUNCTION update_vlogs_updated_at();

-- Criar bucket de storage para vídeos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao storage
CREATE POLICY "Public read access to videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Service role can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'service_role');

CREATE POLICY "Service role can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.role() = 'service_role');
