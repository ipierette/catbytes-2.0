# 🧪 Como Testar o Cronjob Manualmente

## Problema
O cronjob `simple-cron` só executa em **dias e horários específicos**:
- **Dias**: Terça (2), Quinta (4), Sábado (6), Domingo (0)
- **Hora**: 16h UTC (13h BRT)

Quando você clica em "Run" no Vercel Dashboard, ele executa **no horário atual**, mas o código verifica se é o horário certo e retorna "No tasks scheduled".

## ✅ Solução 1: Testar Manualmente via API (RECOMENDADO)

Execute o artigo manualmente chamando a API de geração:

```bash
# 1. Obter CRON_SECRET
cd ~/Desktop/programacao/projetos/catbytes-2.0
vercel env pull .env.local
export CRON_SECRET=$(grep CRON_SECRET .env.local | cut -d'"' -f2)

# 2. Gerar artigo manualmente
curl -X POST "https://www.catbytes.site/api/blog/generate" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq '.'
```

**O que isso faz:**
- ✅ Cria artigo do blog
- ✅ Envia newsletter automaticamente
- ✅ Publica no Instagram e LinkedIn
- ✅ Retorna JSON com resultado completo

## ✅ Solução 2: Criar Endpoint de Teste (SEM VERIFICAÇÃO DE HORÁRIO)

Vou criar um endpoint `/api/cron/test-run` que:
- ❌ Não verifica dia/hora
- ✅ Executa tudo imediatamente
- ✅ Protegido com CRON_SECRET

```bash
# Depois que eu criar, você pode testar assim:
curl -X POST "https://www.catbytes.site/api/cron/test-run" \
  -H "Authorization: Bearer $CRON_SECRET" \
  | jq '.'
```

## 📊 Verificar Se Funcionou

### 1. Verificar artigo criado
```bash
curl "https://www.catbytes.site/api/blog/posts?limit=1" | jq '.posts[0] | {title, created_at, published}'
```

### 2. Verificar posts no Instagram
```bash
curl "https://www.catbytes.site/api/instagram/posts?limit=1" | jq '.posts[0] | {caption, created_at, status}'
```

### 3. Verificar posts no LinkedIn
```bash
curl "https://www.catbytes.site/api/linkedin/posts?limit=1" | jq '.posts[0] | {text, created_at, status}'
```

## 🔍 Ver Logs do Último Cronjob

```bash
# Logs das últimas 24h
vercel logs --since 24h --output raw | grep -i "simple-cron\|blog\|newsletter"

# Logs de um horário específico (ex: das 13h de hoje)
vercel logs --since 24h --output raw | grep "2025-11-16.*16:0" -A 20
```

## ⏰ Próxima Execução Automática

O cronjob vai rodar automaticamente na **próxima terça-feira (19/11) às 13h BRT**.

Para confirmar que está funcionando, verifique os logs às 13h05:
```bash
vercel logs --since 10m
```

---

**Quer que eu crie o endpoint de teste `/api/cron/test-run`?**
