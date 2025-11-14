-- Add token_expires_at and token_type columns to linkedin_settings
ALTER TABLE linkedin_settings
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'Bearer';

-- Update existing record with the expiry date (12/01/2026)
UPDATE linkedin_settings 
SET token_expires_at = '2026-01-12 00:00:00+00'::timestamptz,
    token_type = 'Bearer'
WHERE id = 1;

-- Comentários
COMMENT ON COLUMN linkedin_settings.expires_at IS 'Data de expiração do token de acesso';
COMMENT ON COLUMN linkedin_settings.token_type IS 'Tipo do token (bearer, etc)';
