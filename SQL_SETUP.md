# ⚡ EXECUTAR AGORA - Script SQL para Monitoramento

## 📋 Copie e Cole no Supabase

1. **Acesse**: https://supabase.com/dashboard
2. **Projeto**: CatBytes
3. **SQL Editor** → **New Query**
4. **Cole este código**:

```sql
-- Criar tabela para logs de execução do cron
CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id SERIAL PRIMARY KEY,
  cron_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cron_logs_type ON cron_execution_logs(cron_type);
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON cron_execution_logs(cron_type, status);
CREATE INDEX IF NOT EXISTS idx_cron_logs_executed_at ON cron_execution_logs(executed_at DESC);

-- Comentários
COMMENT ON TABLE cron_execution_logs IS 'Histórico de execuções dos cron jobs';
COMMENT ON COLUMN cron_execution_logs.cron_type IS 'Tipo: blog, instagram, token-check';
COMMENT ON COLUMN cron_execution_logs.status IS 'Status: success, failed, running';
COMMENT ON COLUMN cron_execution_logs.executed_at IS 'Data e hora da execução';
COMMENT ON COLUMN cron_execution_logs.duration_ms IS 'Duração em milissegundos';
COMMENT ON COLUMN cron_execution_logs.details IS 'JSON com detalhes (erros, IDs, etc)';
```

5. **Clique em RUN** (ou Ctrl/Cmd + Enter)

## ✅ Resultado Esperado

```
Success. No rows returned
```

Pronto! Agora o dashboard mostrará todas as execuções dos crons.

## 🔍 Verificar

```sql
-- Ver estrutura da tabela
SELECT * FROM cron_execution_logs LIMIT 1;
```

Deve retornar vazio (ainda sem execuções).

Após o próximo cron rodar (Ter/Qui/Sáb/Dom às 13h), você verá os logs aparecerem automaticamente no dashboard!
