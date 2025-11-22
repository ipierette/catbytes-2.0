# GitHub Actions para Cron Jobs Adicionais

Como o Vercel tem limite de 2 cron jobs no plano gratuito, usamos GitHub Actions para o terceiro cron job (publicação de posts agendados).

## 📋 Cron Jobs Atuais

### Vercel (Limite: 2)
1. **Blog Generation** - `0 12 * * 2,4,6,0` - Segunda, Quinta, Sábado, Domingo às 12h
2. **Instagram Token Check** - `0 12 * * *` - Diário às 12h

### GitHub Actions (Ilimitado)
3. **Publish Scheduled Blog Posts** - `0 * * * *` - A cada hora

## 🔧 Configuração do GitHub Actions

### 1. Adicionar Secrets ao GitHub

Vá em: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Adicione os seguintes secrets:

```
VERCEL_DEPLOYMENT_URL = https://catbytes.site
CRON_SECRET = [seu valor de CRON_SECRET do .env]
```

### 2. Arquivo de Workflow

O arquivo `.github/workflows/publish-scheduled-blog.yml` já está criado e irá:
- Rodar a cada hora
- Chamar o endpoint `/api/cron/publish-scheduled-blog`
- Publicar posts que atingiram o horário agendado
- Enviar newsletter e promover nas redes sociais

## 📌 Endpoints de Cron

### `/api/simple-cron` (Vercel)
- Gera artigos do blog automaticamente
- Segunda, Quinta, Sábado, Domingo às 12h BRT

### `/api/cron/check-instagram-token` (Vercel)
- Verifica validade do token do Instagram
- Diariamente às 12h BRT

### `/api/cron/publish-scheduled-blog` (GitHub Actions)
- Publica posts agendados que atingiram o horário
- A cada hora

## ⚠️ Importante

- GitHub Actions é gratuito para repositórios públicos (2000 min/mês para privados)
- Os secrets devem ser configurados manualmente no GitHub
- O workflow pode ser executado manualmente via GitHub UI se necessário

## 🔍 Monitoramento

Você pode ver os logs dos workflows em:
`Actions` → `Publish Scheduled Blog Posts` → Ver execuções

## 🚀 Testando Manualmente

No GitHub, vá em `Actions` → `Publish Scheduled Blog Posts` → `Run workflow`
