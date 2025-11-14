-- Adicionar colunas de expiração e metadata na tabela linkedin_settings

ALTER TABLE linkedin_settings 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS token_type VARCHAR(50) DEFAULT 'bearer';

-- Atualizar data de expiração do token atual (12/01/2026)
UPDATE linkedin_settings 
SET expires_at = '2026-01-12 23:59:59+00'::timestamptz
WHERE access_token IS NOT NULL 
  AND access_token != 'PENDING_OAUTH';

-- Comentários
COMMENT ON COLUMN linkedin_settings.expires_at IS 'Data de expiração do token de acesso';
COMMENT ON COLUMN linkedin_settings.token_type IS 'Tipo do token (bearer, etc)';
