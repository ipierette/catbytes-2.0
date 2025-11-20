-- Tabela para rastrear execuções de cron jobs
CREATE TABLE IF NOT EXISTS cron_execution_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL, -- 'blog_generation', 'newsletter', 'instagram', 'linkedin', 'topic_expansion'
  status TEXT NOT NULL, -- 'success', 'failure', 'partial'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER, -- Duração em milissegundos
  result JSONB, -- Detalhes do resultado
  error_message TEXT,
  metadata JSONB, -- Informações adicionais (day, hour, etc)
  
  CONSTRAINT valid_status CHECK (status IN ('success', 'failure', 'partial', 'running'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cron_log_job_name ON cron_execution_log(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_log_status ON cron_execution_log(status);
CREATE INDEX IF NOT EXISTS idx_cron_log_started ON cron_execution_log(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_log_completed ON cron_execution_log(completed_at DESC);

-- View para últimas execuções por job
CREATE OR REPLACE VIEW cron_last_executions AS
SELECT DISTINCT ON (job_name)
  job_name,
  status,
  started_at,
  completed_at,
  duration_ms,
  error_message
FROM cron_execution_log
ORDER BY job_name, started_at DESC;

-- View para estatísticas de sucesso
CREATE OR REPLACE VIEW cron_success_rate AS
SELECT 
  job_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'failure') as failed,
  COUNT(*) FILTER (WHERE status = 'partial') as partial,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)) * 100, 
    2
  ) as success_rate_percentage,
  AVG(duration_ms) FILTER (WHERE status = 'success') as avg_duration_ms,
  MAX(started_at) as last_execution
FROM cron_execution_log
WHERE started_at > NOW() - INTERVAL '30 days' -- Últimos 30 dias
GROUP BY job_name;

COMMENT ON TABLE cron_execution_log IS 'Histórico completo de execuções de cron jobs';
COMMENT ON VIEW cron_last_executions IS 'Última execução de cada tipo de cron job';
COMMENT ON VIEW cron_success_rate IS 'Taxa de sucesso dos cron jobs nos últimos 30 dias';
