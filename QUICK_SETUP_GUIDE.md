# 🚀 GUIA RÁPIDO DE SETUP - 10 Minutos

## ⚡ Passo a Passo

### 1️⃣ Instalar Dependência (1 min)

```bash
npm install @google-analytics/data
```

### 2️⃣ Executar Migração SQL (2 min)

1. Abrir **Supabase Dashboard**
2. Ir em **SQL Editor**
3. Copiar conteúdo de `supabase/migrations/001_fix_schema.sql`
4. Colar e **executar** (Run)
5. Verificar: "Success. No rows returned"

### 3️⃣ Configurar Instagram (2 min)

Adicionar ao `.env.local`:

```env
INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
INSTAGRAM_ACCOUNT_ID=seu_account_id
```

**Como obter:**
1. Meta Business Suite → Configurações
2. Contas do Instagram → Detalhes
3. Gerar Access Token de longa duração

### 4️⃣ Configurar Resend (3 min)

```env
RESEND_API_KEY=re_sua_chave
ADMIN_EMAIL=seu@email.com
```

**Setup:**
1. Criar conta em https://resend.com
2. Adicionar domínio + verificar DNS
3. Gerar API Key
4. Adicionar email admin

### 5️⃣ Configurar Google Analytics (OPCIONAL - 5 min)

```env
GOOGLE_ANALYTICS_CREDENTIALS={"type":"service_account",...}
GOOGLE_ANALYTICS_PROPERTY_ID=properties/123456789
```

**Setup:**
1. Google Cloud Console → IAM → Service Accounts
2. Criar conta → baixar JSON
3. Google Analytics → Admin → Property Access
4. Adicionar service account como Viewer
5. Copiar Property ID do GA4

**⚠️ Se não configurar:** Sistema usa dados mock automaticamente

### 6️⃣ Configurar OpenAI (já deve ter)

```env
OPENAI_API_KEY=sk-sua_chave
```

### 7️⃣ Configurar Cron Secret

```env
CRON_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_BASE_URL=https://catbytes.site
```

### 8️⃣ Deploy & Configurar Vercel

```bash
vercel --prod
```

**No Vercel Dashboard:**
1. Settings → Environment Variables
2. Adicionar `CRON_SECRET` (mesma do .env.local)
3. Salvar

---

## ✅ Testar Sistema

### Teste 1: Aprovação de Post
1. Ir para `/admin/instagram`
2. Clicar **Aprovar** em post pendente
3. ✅ Verificar toast de sucesso
4. ✅ Verificar data agendada
5. ✅ Verificar email recebido

### Teste 2: Publicação Manual
1. Clicar **Publish Now** em post aprovado
2. Aguardar (~10s)
3. ✅ Verificar post no Instagram
4. ✅ Verificar status "Publicado"
5. ✅ Verificar email com link

### Teste 3: Tradução
1. Ir para `/admin/blog`
2. Clicar **Traduzir para Inglês**
3. Confirmar modal
4. ✅ Verificar post em `/en-US/blog/[slug]-en`
5. ✅ Verificar contador de tokens
6. ✅ Verificar email de conclusão

### Teste 4: Analytics
1. Ir para `/admin/analytics`
2. ✅ Verificar gráficos carregando
3. ✅ Trocar período (7d/30d/90d)
4. ✅ Se não configurou GA: ver dados mock

### Teste 5: Relatório Diário
```bash
curl -X GET https://catbytes.site/api/cron/daily-report \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```
✅ Verificar email com estatísticas

---

## 📝 Checklist Completo

- [ ] `npm install @google-analytics/data`
- [ ] Migração SQL executada no Supabase
- [ ] Instagram Token + Account ID no .env
- [ ] Resend configurado + domínio verificado
- [ ] Google Analytics configurado (ou mock ativo)
- [ ] OpenAI API Key configurado
- [ ] Cron Secret gerado e no Vercel
- [ ] Deploy feito com sucesso
- [ ] Teste de aprovação ✅
- [ ] Teste de publicação ✅
- [ ] Teste de tradução ✅
- [ ] Teste de analytics ✅
- [ ] Teste de relatório ✅

---

## 🆘 Troubleshooting

### Erro: "column 'status' does not exist"
**Solução:** Execute a migração SQL no Supabase

### Erro: "Failed to publish to Instagram"
**Solução:** Verifique INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_ACCOUNT_ID

### Erro: "Cannot find module '@google-analytics/data'"
**Solução:** `npm install @google-analytics/data`

### Analytics mostrando dados fictícios
**Causa:** Google Analytics não configurado
**Solução:** Configure ou ignore (sistema funciona com mock)

### Email não chegando
**Solução:** 
1. Verificar domínio verificado no Resend
2. Verificar RESEND_API_KEY
3. Verificar ADMIN_EMAIL
4. Checar spam

### Relatório diário não executando
**Solução:**
1. Verificar CRON_SECRET no Vercel
2. Verificar `vercel-cron.json` no deploy
3. Logs no Vercel Dashboard → Cron Jobs

---

## 🎯 Resumo

**Tempo total:** ~10-15 minutos  
**Obrigatório:** Steps 1, 2, 3, 4, 6  
**Opcional:** Step 5 (Google Analytics)

**Depois do setup:**
✅ Sistema 100% funcional  
✅ Backend real persistindo dados  
✅ Notificações por email ativas  
✅ Cron jobs agendados  
✅ Analytics em tempo real  

🎉 **Pronto para produção!**
