# ⚡ AÇÃO NECESSÁRIA: Criar Tabela no Supabase

## 🎯 O que fazer agora

Para ativar o sistema de monitoramento de cron jobs, você precisa executar um script SQL no Supabase.

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
   - Vá em: https://supabase.com/dashboard
   - Selecione seu projeto CATBytes

### 2. Abra o SQL Editor
   - No menu lateral, clique em **SQL Editor**
   - Clique em **+ New Query**

### 3. Cole o Script SQL

Copie e cole este código:

```sql
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
```

### 4. Execute
   - Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
   - Aguarde a mensagem de sucesso

### 5. Verifique
   - Vá em **Table Editor** no menu lateral
   - Procure a tabela `cron_execution_logs`
   - Deve aparecer com todas as colunas

## ✅ Resultado Esperado

Você verá algo assim:

```
Success. No rows returned
```

Isso significa que a tabela foi criada com sucesso!

## 🎉 Pronto!

Agora o sistema de monitoramento está ativo. Na próxima vez que o cron executar, os logs serão salvos automaticamente.

## 🔍 Como Verificar que Funcionou

1. Acesse: `https://catbytes.site/admin/dashboard`
2. Role até o card **"Monitoramento de Cron Jobs"**
3. Você verá:
   - Últimas execuções
   - Estatísticas
   - Status de cada execução
   - Próximas execuções programadas

Se ainda não houver execuções, o card mostrará "Nenhuma execução registrada" até o próximo cron rodar.

## 📅 Quando os Logs Começarão a Aparecer?

**Geração de Conteúdo:**
- Próxima execução: Terça, Quinta, Sábado ou Domingo às 9:00 BRT

**Verificação de Token:**
- Próxima execução: Amanhã às 09:00 BRT

## 🆘 Problemas?

Se encontrar erro ao executar o SQL:
1. Verifique se copiou todo o código
2. Certifique-se de estar no projeto correto
3. Tente executar linha por linha (CREATE TABLE, depois os INDEXes)

Se tiver dúvidas, me chame!
