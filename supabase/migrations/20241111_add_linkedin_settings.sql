-- =====================================================
-- LinkedIn Settings Table
-- Armazena access token e configurações do LinkedIn
-- Similar à tabela instagram_settings
-- =====================================================

-- Criar tabela de configurações do LinkedIn
CREATE TABLE IF NOT EXISTS linkedin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- OAuth Tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  
  -- LinkedIn IDs
  person_urn TEXT, -- urn:li:person:ABC123
  organization_urn TEXT, -- urn:li:organization:123456 (página da empresa)
  
  -- Metadados
  last_token_refresh TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_linkedin_settings_active ON linkedin_settings(is_active);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_linkedin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER linkedin_settings_updated_at
  BEFORE UPDATE ON linkedin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_linkedin_settings_updated_at();

-- Comentários
COMMENT ON TABLE linkedin_settings IS 'Configurações e tokens de autenticação do LinkedIn';
COMMENT ON COLUMN linkedin_settings.access_token IS 'Access token do OAuth LinkedIn (expira em 60 dias)';
COMMENT ON COLUMN linkedin_settings.refresh_token IS 'Refresh token para renovar access token';
COMMENT ON COLUMN linkedin_settings.person_urn IS 'URN do perfil pessoal no LinkedIn';
COMMENT ON COLUMN linkedin_settings.organization_urn IS 'URN da página da empresa (CatBytes)';
COMMENT ON COLUMN linkedin_settings.token_expires_at IS 'Data de expiração do access token';

-- Inserir configuração inicial vazia (será preenchida após OAuth)
INSERT INTO linkedin_settings (access_token, is_active)
VALUES ('PENDING_OAUTH', true)
ON CONFLICT DO NOTHING;
