-- Criar tabela para logs de execução do cron
CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id SERIAL PRIMARY KEY,
  cron_type VARCHAR(50) NOT NULL, -- 'blog', 'instagram', 'token-check'
  status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'running'
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cron_logs_type ON cron_execution_logs(cron_type);
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON cron_execution_logs(cron_type, status);
CREATE INDEX IF NOT EXISTS idx_cron_logs_executed_at ON cron_execution_logs(executed_at DESC);

-- Comentários
COMMENT ON TABLE cron_execution_logs IS 'Histórico de execuções dos cron jobs';
COMMENT ON COLUMN cron_execution_logs.cron_type IS 'Tipo do cron: blog, instagram, token-check';
COMMENT ON COLUMN cron_execution_logs.status IS 'Status da execução: success, failed, running';
COMMENT ON COLUMN cron_execution_logs.executed_at IS 'Data e hora da execução';
COMMENT ON COLUMN cron_execution_logs.duration_ms IS 'Duração da execução em milissegundos';
COMMENT ON COLUMN cron_execution_logs.details IS 'Detalhes adicionais em formato JSON (erros, IDs gerados, etc)';
