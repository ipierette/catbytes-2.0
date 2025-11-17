# Sistema de Monitoramento de Cron Jobs

## 📋 Visão Geral

O dashboard agora possui um sistema completo de monitoramento em tempo real das execuções dos cron jobs, incluindo histórico, estatísticas e detalhamento das próximas execuções.

## 🕐 Cronograma de Execução

### 1. **Simple Cron** - Geração de Conteúdo
- **Endpoint**: `/api/simple-cron`
- **Horário**: 16:00 UTC (13:00 BRT)
- **Dias**: Terça, Quinta, Sábado e Domingo
- **Cron Expression**: `0 16 * * 2,4,6,0`

**Ações executadas:**
1. **Geração de Blog** (`cron_type: 'blog'`)
   - Gera novo artigo automaticamente
   - Verifica duplicação (não gera se já existe post hoje)
   - Registra ID do post gerado nos logs
   - Envia alertas de sucesso/falha
   - Promove artigo no Instagram/LinkedIn (cria posts pendentes para aprovação manual)

**REMOVIDO em 17/11/2025:**
- ~~Geração Instagram Batch (10 posts)~~ - Removido para economizar API costs ($166/ano)
- Posts Instagram agora são criados manualmente via text-only modal
- DALL-E não gera texto em português de forma confiável

### 2. **Instagram Token Check** - Verificação Diária
- **Endpoint**: `/api/cron/check-instagram-token`
- **Horário**: 12:00 UTC (09:00 BRT)
- **Dias**: Todos os dias
- **Cron Expression**: `0 12 * * *`

**Ações executadas:**
1. **Verificação de Expiração** (`cron_type: 'token-check'`)
   - Verifica dias restantes até expiração
   - Envia email de alerta se ≤ 1 dia
   - Registra nos logs se enviou alerta ou não
   - Previne interrupções no serviço

## 📊 Sistema de Logs

### Tabela: `cron_execution_logs`

```sql
CREATE TABLE cron_execution_logs (
  id SERIAL PRIMARY KEY,
  cron_type VARCHAR(50) NOT NULL,    -- 'blog', 'instagram', 'token-check'
  status VARCHAR(20) NOT NULL,        -- 'success', 'failed', 'running'
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,                -- Duração em milissegundos
  details JSONB,                      -- Detalhes da execução
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos do Details (JSONB)

**Blog Generation:**
```json
{
  "blog_post_id": 123,
  "title": "Título do post gerado",
  "error": "Mensagem de erro (se houver)"
}
```

**Instagram Generation:**
```json
{
  "instagram_posts": 10,
  "error": "Mensagem de erro (se houver)"
}
```

**Token Check:**
```json
{
  "daysRemaining": 5,
  "alertSent": false,
  "expiryDate": "2025-01-20T00:00:00Z",
  "error": "Mensagem de erro (se houver)"
}
```

## 🔧 Implementação

### 1. API de Histórico

**Endpoint**: `GET /api/cron/history`

**Query Params:**
- `limit` (default: 10) - Quantidade de logs a retornar
- `type` - Filtrar por tipo: 'blog', 'instagram', 'token-check'

**Resposta:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "cron_type": "blog",
      "status": "success",
      "executed_at": "2025-01-08T16:00:00Z",
      "duration_ms": 2340,
      "details": {
        "blog_post_id": 123,
        "title": "Post Title"
      }
    }
  ],
  "stats": {
    "total": 10,
    "success": 8,
    "failed": 2,
    "lastExecution": { /* último log */ }
  }
}
```

### 2. Função Helper: `cron-logger.ts`

```typescript
import { startCronLog } from '@/lib/cron-logger'

// No início da execução do cron
const cronLog = startCronLog('blog')

try {
  // ... sua lógica aqui ...
  
  // Sucesso
  await cronLog.success({ 
    blog_post_id: post.id,
    title: post.title
  })
} catch (error) {
  // Erro
  await cronLog.fail(error, { additional: 'context' })
}
```

### 3. Componente de Monitoramento

**Componente**: `CronMonitoringCard.tsx`

**Features:**
- ✅ Exibe últimas 10 execuções
- ✅ Estatísticas (Total, Sucesso, Falhas)
- ✅ Status colorido (verde = sucesso, vermelho = erro)
- ✅ Detalhes de cada execução (IDs, erros, duração)
- ✅ Tempo relativo ("2h atrás", "Agora mesmo")
- ✅ Auto-refresh a cada 30 segundos
- ✅ Próximas execuções programadas

## 📈 Dashboard Stats Corrigidos

### Função: `calculateNextGenerationDate()`

**Antes (ERRADO):**
```typescript
const generationDays = new Set([1, 2, 4, 6]) // ERRADO: Seg, Ter, Qui, Sáb
const generationHour = 13 // ERRADO: Horário BRT em vez de UTC
```

**Depois (CORRETO):**
```typescript
const generationDays = new Set([2, 4, 6, 0]) // CORRETO: Ter, Qui, Sáb, Dom
const generationHourUTC = 16 // CORRETO: 16:00 UTC = 13:00 BRT
```

**Mudanças:**
- Usa `getUTCHours()` e `getUTCDay()` para consistência
- Calcula com horário UTC (16:00) que converte para BRT (13:00)
- Dias corretos: [2, 4, 6, 0] = Terça, Quinta, Sábado, Domingo

## 🚀 Como Usar

### 1. Criar a Tabela no Supabase

Execute o script SQL:
```bash
supabase/migrations/create_cron_execution_logs.sql
```

Ou rode diretamente no SQL Editor do Supabase Dashboard.

### 2. Visualizar no Dashboard

Acesse: `https://catbytes.site/admin/dashboard`

O card de monitoramento aparecerá automaticamente mostrando:
- Últimas execuções
- Status de cada uma
- Erros e detalhes
- Próximas execuções programadas

### 3. Filtrar Logs por Tipo

```typescript
// Ver apenas logs de geração de blog
const response = await fetch('/api/cron/history?type=blog&limit=20')

// Ver apenas logs de verificação de token
const response = await fetch('/api/cron/history?type=token-check')
```

## 🔍 Debugging

### Verificar Última Execução

```sql
SELECT * FROM cron_execution_logs 
ORDER BY executed_at DESC 
LIMIT 1;
```

### Ver Todas as Falhas

```sql
SELECT * FROM cron_execution_logs 
WHERE status = 'failed' 
ORDER BY executed_at DESC;
```

### Estatísticas por Tipo

```sql
SELECT 
  cron_type,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as success,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  AVG(duration_ms) as avg_duration_ms
FROM cron_execution_logs
GROUP BY cron_type;
```

## 📝 Checklist de Implementação

- [x] Criar tabela `cron_execution_logs`
- [x] Criar função helper `cron-logger.ts`
- [x] Criar API `/api/cron/history`
- [x] Criar componente `CronMonitoringCard`
- [x] Integrar logging no `simple-cron`
- [x] Integrar logging no `check-instagram-token`
- [x] Corrigir cálculo `calculateNextGenerationDate()`
- [x] Corrigir cálculo `calculateNextPublicationDate()`
- [x] Adicionar card ao dashboard
- [ ] Executar script SQL no Supabase
- [ ] Testar primeira execução do cron
- [ ] Validar logs sendo salvos corretamente

## 🎯 Próximos Passos

1. **Adicionar Notificações Push**: Alertas em tempo real no dashboard quando um cron executar
2. **Gráficos de Performance**: Visualizar duração ao longo do tempo
3. **Retry Automático**: Tentar novamente em caso de falha
4. **Dashboard de Analytics**: Métricas agregadas (taxa de sucesso, tempo médio, etc)
5. **Export de Logs**: Download em CSV/JSON para análise externa

## 🔗 Links Úteis

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Supabase JSONB Functions](https://supabase.com/docs/guides/database/json)
- [UTC Time Converter](https://www.timeanddate.com/worldclock/converter.html)
