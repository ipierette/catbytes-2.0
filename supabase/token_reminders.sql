-- Tabela para gerenciar lembretes de expiração de tokens
CREATE TABLE token_reminders (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin')),
  token_expires_at TIMESTAMPTZ NOT NULL,
  reminder_date TIMESTAMPTZ NOT NULL,
  days_before INTEGER NOT NULL CHECK (days_before > 0),
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_token_reminders_platform ON token_reminders(platform);
CREATE INDEX idx_token_reminders_reminder_date ON token_reminders(reminder_date);
CREATE INDEX idx_token_reminders_sent ON token_reminders(sent);
CREATE INDEX idx_token_reminders_platform_sent ON token_reminders(platform, sent);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_token_reminders_updated_at 
    BEFORE UPDATE ON token_reminders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns lembretes de exemplo (opcional)
-- INSERT INTO token_reminders (platform, token_expires_at, reminder_date, days_before) VALUES
-- ('instagram', NOW() + INTERVAL '60 days', NOW() + INTERVAL '30 days', 30),
-- ('instagram', NOW() + INTERVAL '60 days', NOW() + INTERVAL '53 days', 7),
-- ('instagram', NOW() + INTERVAL '60 days', NOW() + INTERVAL '57 days', 3),
-- ('linkedin', NOW() + INTERVAL '60 days', NOW() + INTERVAL '30 days', 30),
-- ('linkedin', NOW() + INTERVAL '60 days', NOW() + INTERVAL '53 days', 7);

COMMENT ON TABLE token_reminders IS 'Lembretes automáticos para renovação de tokens de API que expiram';
COMMENT ON COLUMN token_reminders.platform IS 'Plataforma do token (instagram, linkedin)';
COMMENT ON COLUMN token_reminders.token_expires_at IS 'Data de expiração do token';
COMMENT ON COLUMN token_reminders.reminder_date IS 'Data para enviar o lembrete';
COMMENT ON COLUMN token_reminders.days_before IS 'Quantos dias antes da expiração enviar o lembrete';
COMMENT ON COLUMN token_reminders.sent IS 'Se o lembrete já foi enviado';
COMMENT ON COLUMN token_reminders.sent_at IS 'Quando o lembrete foi enviado';

-- View útil para consultar lembretes pendentes
CREATE VIEW pending_token_reminders AS
SELECT 
  id,
  platform,
  token_expires_at,
  reminder_date,
  days_before,
  CASE 
    WHEN token_expires_at < NOW() THEN 'expired'
    WHEN (token_expires_at - NOW()) <= INTERVAL '7 days' THEN 'critical'
    WHEN (token_expires_at - NOW()) <= INTERVAL '14 days' THEN 'warning'
    ELSE 'normal'
  END as urgency_level,
  EXTRACT(DAYS FROM (token_expires_at - NOW()))::INTEGER as days_until_expiry,
  created_at
FROM token_reminders 
WHERE sent = FALSE 
  AND reminder_date <= NOW()
ORDER BY reminder_date ASC, platform ASC;