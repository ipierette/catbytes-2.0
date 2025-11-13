-- Tabela para armazenar credenciais sensíveis de forma segura
-- Tokens do LinkedIn, Instagram, etc.
-- IMPORTANTE: Esta tabela NÃO deve ser acessível publicamente

CREATE TABLE IF NOT EXISTS secure_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca rápida por chave
CREATE INDEX IF NOT EXISTS idx_secure_credentials_key ON secure_credentials(key);

-- Comentários para documentação
COMMENT ON TABLE secure_credentials IS 'Armazena credenciais sensíveis (tokens de API) de forma segura';
COMMENT ON COLUMN secure_credentials.key IS 'Identificador da credencial (ex: linkedin_access_token)';
COMMENT ON COLUMN secure_credentials.value IS 'Valor da credencial (token, secret, etc.)';

-- RLS (Row Level Security) - Apenas service_role pode acessar
ALTER TABLE secure_credentials ENABLE ROW LEVEL SECURITY;

-- Política: Apenas service_role (backend) pode ler/escrever
CREATE POLICY "Service role only" ON secure_credentials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Remove acesso público completamente
DROP POLICY IF EXISTS "Public read access" ON secure_credentials;
DROP POLICY IF EXISTS "Public write access" ON secure_credentials;
