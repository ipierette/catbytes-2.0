# 🚨 TESTE URGENTE DO CRON - TERÇA-FEIRA 10H

## Problema Identificado

**Cron jobs NÃO executam desde implementação de posts de divulgação**

### Causa Raiz
- `promoteArticle()` chamava `/api/instagram/publish` e `/api/linkedin/publish`
- Se essas APIs travassem ou falhassem, o cron INTEIRO parava
- Sem timeout, podia travar indefinidamente
- **Resultado:** NADA executava (nem blog, nem newsletter, nem nada)

## Correção Implementada (Deploy: `0bbfaf6`)

### 1. Timeout de 30s na Promoção Social
```typescript
// blog/generate/route.ts
const promotionPromise = promoteArticle(...)
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 30000)
)
const result = await Promise.race([promotionPromise, timeoutPromise])
```

### 2. Timeout de 15s por Plataforma
```typescript
// blog-social-promoter.ts
await Promise.race([
  publishToInstagram(...),
  new Promise((_, reject) => setTimeout(() => reject(...), 15000))
])
```

### 3. Error Handling Robusto
- Blog SEMPRE é gerado
- Divulgação é best-effort (falha não quebra nada)
- Logs detalhados de cada etapa

---

## 🧪 TESTE MANUAL - EXECUTE AGORA

### Opção 1: Teste Completo (Recomendado)

```bash
cd /Users/Izadora1/Desktop/programacao/projetos/catbytes-2.0

# Testar geração de blog (com divulgação)
curl -X POST "https://catbytes.site/api/blog/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a0a99efa3213a7ffcf610276504172999bd3e07c908709c3fd6e25f44af518fb" \
  -d '{"theme": "Programação e IA", "topic": "5 ferramentas de IA para desenvolvedores"}' \
  -v
```

**Tempo esperado:** 30-90 segundos  
**Resultado esperado:**
```json
{
  "success": true,
  "post": { "id": "...", "title": "...", "slug": "..." },
  "socialPromotion": {
    "attempted": true,
    "successes": ["Instagram", "LinkedIn"],
    "failures": []
  }
}
```

---

### Opção 2: Teste Apenas Instagram

```bash
# Teste direto da API de Instagram publish
curl -X POST "https://catbytes.site/api/instagram/publish" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a0a99efa3213a7ffcf610276504172999bd3e07c908709c3fd6e25f44af518fb" \
  -d '{
    "image_url": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
    "caption": "🧪 TESTE DE DIVULGAÇÃO\n\nEste é um post de teste para verificar se a divulgação automática está funcionando.\n\n#teste #catbytes",
    "auto_publish": false,
    "blog_category": "Teste"
  }' \
  -v
```

**Resultado esperado:**
```json
{
  "success": true,
  "post_id": "...",
  "instagram_post_id": "..."
}
```

---

### Opção 3: Teste Apenas LinkedIn

```bash
# Teste direto da API de LinkedIn publish
curl -X POST "https://catbytes.site/api/linkedin/publish" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer a0a99efa3213a7ffcf610276504172999bd3e07c908709c3fd6e25f44af518fb" \
  -d '{
    "text": "🧪 TESTE DE DIVULGAÇÃO\n\nEste é um post de teste para verificar se a divulgação automática está funcionando no LinkedIn.\n\n#teste #catbytes #izadoracurypierette",
    "image_url": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
    "publish_now": false,
    "blog_category": "Teste"
  }' \
  -v
```

**Resultado esperado:**
```json
{
  "success": true,
  "post_id": "...",
  "linkedin_post_id": "..."
}
```

---

## 🔍 Diagnóstico de Problemas

### Se Instagram/LinkedIn falharem:

**Possíveis causas:**
1. **Token expirado** (Instagram Graph API ou LinkedIn OAuth)
2. **Variáveis de ambiente não configuradas no Vercel:**
   - `INSTAGRAM_ACCESS_TOKEN`
   - `INSTAGRAM_USER_ID`
   - `LINKEDIN_ACCESS_TOKEN`
   - `LINKEDIN_PERSON_URN`

3. **Rate limit** das APIs

### Verificar Tokens (Instagram):
```bash
curl "https://graph.facebook.com/debug_token?input_token=$INSTAGRAM_ACCESS_TOKEN&access_token=$INSTAGRAM_ACCESS_TOKEN"
```

### Verificar Tokens (LinkedIn):
```bash
curl -H "Authorization: Bearer $LINKEDIN_ACCESS_TOKEN" \
  "https://api.linkedin.com/v2/me"
```

---

## ✅ Checklist de Validação

Após executar o teste, confirmar:

- [ ] Blog foi gerado com sucesso?
- [ ] Instagram post foi criado? (mesmo com `auto_publish: false`)
- [ ] LinkedIn post foi criado? (mesmo com `publish_now: false`)
- [ ] Processo levou menos de 2 minutos?
- [ ] Se alguma divulgação falhou, blog ainda foi criado?

---

## 🚀 Próxima Execução Automática

**Quinta-feira, 20 de novembro de 2025**  
**Horário: 12:00 UTC = 9:00 BRT**

O cron `/api/simple-cron` vai executar automaticamente e:
1. Gerar novo artigo de blog
2. Tentar divulgar no Instagram (max 15s)
3. Tentar divulgar no LinkedIn (max 15s)
4. Enviar newsletter para assinantes

**MESMO SE A DIVULGAÇÃO FALHAR**, o blog será gerado!

---

## 📊 Monitoramento

Após o teste, verificar logs no Vercel:
1. Acessar https://vercel.com/catbytes/dashboard
2. Ir em Functions → `/api/blog/generate`
3. Ver logs em tempo real
4. Procurar por:
   - `[Generate] 📱 Promoting article on social media...`
   - `[Instagram Publish] Starting...`
   - `[LinkedIn Publish] Starting...`
   - `✅ Article promoted on: Instagram, LinkedIn`

---

## 🔧 Rollback (Se necessário)

Se TUDO falhar e você quiser desabilitar divulgação temporariamente:

```bash
# Editar app/api/blog/generate/route.ts
# Linha ~620: Mudar condição para sempre false
if (false && createdPost.published && coverImageUrl && !textOnly) {
```

Isso vai gerar blogs normalmente SEM tentar divulgar.

---

**Data:** 18 de novembro de 2025, 10:30 BRT  
**Status:** ⏳ Aguardando teste manual  
**Próxima ação:** Executar Opção 1 (teste completo)
