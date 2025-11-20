# Troubleshooting: Vercel Cron Não Executa

## Problema Identificado (20/11/2025)

O Vercel Cron **não está chamando** automaticamente `/api/simple-cron` nos horários agendados.

### Evidências:
- ✅ `vercel.json` configurado corretamente: `"0 16 * * 2,4,6,0"` (Ter/Qui/Sáb/Dom 16h UTC)
- ✅ Endpoint `/api/simple-cron` funciona quando chamado manualmente
- ❌ Último artigo gerado: 18/11 (terça) - **nada em 20/11 (quinta)**
- ❌ Nenhum log de execução automática em `cron_execution_logs`

## Causas Possíveis

### 1. **Vercel Cron não ativado no projeto**
   - **Verificar**: Dashboard Vercel → Projeto → Settings → Cron Jobs
   - **Ação**: Ativar "Enable Cron Jobs" se desabilitado

### 2. **Plano Hobby tem limitações**
   - Cron jobs podem estar disponíveis apenas em planos pagos
   - **Verificar**: https://vercel.com/docs/cron-jobs#limits
   - **Ação**: Considerar upgrade para Pro ($20/mês) se necessário

### 3. **Fuso horário incorreto**
   - Vercel usa UTC, mas pode haver inconsistência
   - **Teste**: Adicionar cron de teste rodando a cada hora
   
### 4. **Erro silencioso durante deploy**
   - Cron pode não estar sendo registrado no Vercel
   - **Verificar**: Logs de deploy no Vercel Dashboard

### 5. **vercel.json não está sendo lido**
   - Pode estar usando `vercel.single-cron.json` ao invés de `vercel.json`
   - **Ação**: Renomear para `vercel.json` se necessário

## Solução Temporária Implementada ✅

**Script manual**: `./force-cron-execution.sh`

```bash
cd /Users/Izadora1/Desktop/programacao/projetos/catbytes-2.0
./force-cron-execution.sh
```

### O que faz:
1. Chama `/api/blog/generate` (POST)
2. Gera artigo do dia
3. Envia newsletter automaticamente
4. Cria e publica posts Instagram + LinkedIn
5. Mostra resumo da execução

### Quando usar:
- **Terça, Quinta, Sábado, Domingo** às **13h BRT** (quando cron deveria rodar)
- Sempre que perceber que artigo não foi gerado

## Próximos Passos para Correção Permanente

### Passo 1: Verificar Dashboard Vercel
1. Acessar: https://vercel.com/catbytes/settings/cron
2. Confirmar se "Enable Cron Jobs" está ON
3. Verificar se os crons aparecem listados:
   - `/api/simple-cron` @ `0 16 * * 2,4,6,0`
   - `/api/cron/check-instagram-token` @ `0 12 * * *`

### Passo 2: Adicionar Cron de Teste (rodando a cada hora)
Adicionar ao `vercel.json`:
```json
{
  "path": "/api/cron/ping",
  "schedule": "0 * * * *"
}
```

Criar `/api/cron/ping/route.ts`:
```typescript
export async function GET() {
  console.log('[Ping] Cron executou:', new Date().toISOString())
  return Response.json({ ping: 'ok', time: new Date().toISOString() })
}
```

### Passo 3: Verificar Logs do Vercel
1. Dashboard → Deployments → Latest
2. Functions → `/api/simple-cron`
3. Verificar se há execuções nos horários esperados

### Passo 4: Considerar Alternativas

Se Vercel Cron não funcionar:

#### Opção A: Cron externo (GitHub Actions)
- Rodar workflow agendado que chama a API
- Grátis e confiável
- Requer configuração no repositório

#### Opção B: Serviço de cron dedicado
- EasyCron, cron-job.org (grátis)
- Chama a URL em horários específicos

#### Opção C: Manual com alarme
- Configurar alarme no celular para 13h (Ter/Qui/Sáb/Dom)
- Executar `./force-cron-execution.sh`

## Monitoramento

### Dashboard de Cron (TODO)
Adicionar ao `/admin/dashboard`:
- ✅ Última execução de cada cron
- ✅ Status (sucesso/falha)
- ❌ Próxima execução esperada
- ❌ Alertas se não executou no horário

### Alertas por Email
Sistema já implementado (`lib/alert-system.ts`), mas não está sendo usado no dashboard.

## Filtro de Newsletter (TODO)

**Problema**: `valterzjr@gmail.com` só quer newsletter em inglês, mas está recebendo pt-BR.

**Solução**: Adicionar filtro em `/api/blog/generate/route.ts`:

```typescript
// Buscar assinantes
.eq('verified', true)
.eq('subscribed', true)
.eq('preferred_language', 'pt-BR') // ← ADICIONAR
```

---

**Última atualização**: 20/11/2025 10:30 BRT
**Status**: Cron manual funcionando ✅ | Cron automático investigando 🔍
