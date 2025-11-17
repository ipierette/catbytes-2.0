# SQL Setup - Tabelas de Monitoramento

Este arquivo contém os scripts SQL necessários para criar as tabelas de monitoramento do sistema.

## 1. Tabela: cron_execution_logs

Para monitorar execuções dos cron jobs:

```sql
-- Criar tabela de logs de execução dos crons
CREATE TABLE IF NOT EXISTS public.cron_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cron_type TEXT NOT NULL, -- 'blog', 'instagram', 'linkedin', 'newsletter', 'token-check'
  status TEXT NOT NULL, -- 'success', 'failed'
  duration_ms INTEGER NOT NULL, -- Duração em milissegundos
  details JSONB DEFAULT '{}', -- Detalhes adicionais da execução
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cron_logs_type ON public.cron_execution_logs(cron_type);
CREATE INDEX IF NOT EXISTS idx_cron_logs_created_at ON public.cron_execution_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON public.cron_execution_logs(status);

-- Comentários
COMMENT ON TABLE public.cron_execution_logs IS 'Logs de execução dos cron jobs do sistema';
COMMENT ON COLUMN public.cron_execution_logs.cron_type IS 'Tipo do cron job executado';
COMMENT ON COLUMN public.cron_execution_logs.status IS 'Status da execução: success ou failed';
COMMENT ON COLUMN public.cron_execution_logs.duration_ms IS 'Duração da execução em milissegundos';
COMMENT ON COLUMN public.cron_execution_logs.details IS 'Detalhes adicionais em formato JSON';
```

## 2. Tabela: daily_events

Para registrar eventos do dia e gerar relatórios consolidados:

```sql
-- Criar tabela de eventos diários
CREATE TABLE IF NOT EXISTS public.daily_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'blog_generated', 'blog_failed', 'instagram_published', etc.
  event_date DATE NOT NULL, -- Data do evento (YYYY-MM-DD)
  event_time TIMESTAMPTZ NOT NULL, -- Timestamp completo do evento
  title TEXT NOT NULL, -- Título descritivo do evento
  description TEXT, -- Descrição detalhada (opcional)
  metadata JSONB DEFAULT '{}', -- Dados adicionais em JSON
  error_message TEXT, -- Mensagem de erro (se aplicável)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_daily_events_type ON public.daily_events(event_type);
CREATE INDEX IF NOT EXISTS idx_daily_events_date ON public.daily_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_events_time ON public.daily_events(event_time DESC);

-- Comentários
COMMENT ON TABLE public.daily_events IS 'Registro de eventos diários para relatórios consolidados';
COMMENT ON COLUMN public.daily_events.event_type IS 'Tipo do evento: blog_generated, instagram_published, etc.';
COMMENT ON COLUMN public.daily_events.event_date IS 'Data do evento no formato YYYY-MM-DD';
COMMENT ON COLUMN public.daily_events.event_time IS 'Timestamp completo do evento';
COMMENT ON COLUMN public.daily_events.title IS 'Título descritivo do evento';
COMMENT ON COLUMN public.daily_events.description IS 'Descrição detalhada do evento';
COMMENT ON COLUMN public.daily_events.metadata IS 'Dados adicionais em formato JSON';
COMMENT ON COLUMN public.daily_events.error_message IS 'Mensagem de erro se o evento foi uma falha';
```

## Como Usar

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole um dos scripts acima
4. Clique em **Run** para executar

---

✅ Após executar ambos os scripts:
- Dashboard de monitoramento funcionará corretamente
- Emails de resumo diário terão dados para processar
- Analytics de custos poderão rastrear eventos
