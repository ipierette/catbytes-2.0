# 🚀 Guia Completo de Configuração - Newsletter CatBytes

Este guia vai te ajudar a configurar tudo do zero! Siga os passos na ordem.

## 📦 Índice
1. [Configurar Supabase (Banco de Dados)](#1-configurar-supabase)
2. [Configurar Resend (Envio de Emails)](#2-configurar-resend)
3. [Configurar Variáveis de Ambiente](#3-configurar-variáveis-de-ambiente)
4. [Testar o Sistema](#4-testar-o-sistema)

---

## 1. Configurar Supabase

### O que é Supabase?
É um banco de dados PostgreSQL gratuito na nuvem. Usamos para armazenar os posts do blog e os inscritos da newsletter.

### Passo a Passo:

#### 1.1 Criar conta no Supabase
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub ou email

#### 1.2 Criar um novo projeto
1. No dashboard, clique em "New Project"
2. Escolha um nome: `catbytes-blog`
3. Crie uma senha forte (guarde ela!)
4. Escolha a região: **South America (São Paulo)** - mais perto do Brasil!
5. Clique em "Create new project"
6. Aguarde 2-3 minutos enquanto o projeto é criado

#### 1.3 Executar o Schema SQL
1. No menu lateral, clique em **SQL Editor**
2. Clique em **"New Query"**
3. Abra o arquivo `supabase/schema.sql` do seu projeto
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no editor SQL do Supabase
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Você deve ver a mensagem "Success. No rows returned"

✅ Pronto! As tabelas foram criadas:
- `blog_posts` - Para os artigos do blog
- `newsletter_subscribers` - Para os inscritos
- `newsletter_campaigns` - Para tracking dos envios
- `blog_generation_log` - Para logs

#### 1.4 Pegar as chaves de API
1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você vai ver 3 informações importantes:

**Project URL:**
```
https://xxxxxxxxxxx.supabase.co
```
☝️ Esta é sua `NEXT_PUBLIC_SUPABASE_URL`

**anon public:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
☝️ Esta é sua `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**service_role (secret):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
☝️ Esta é sua `SUPABASE_SERVICE_ROLE_KEY` (NUNCA compartilhe!)

---

## 2. Configurar Resend

### O que é Resend?
É um serviço moderno para enviar emails transacionais. Muito mais simples que Amazon SES ou SendGrid!

### Por que Resend?
- ✅ **Fácil de configurar** - Leva 5 minutos
- ✅ **Plano gratuito** - 100 emails/dia ou 3.000 emails/mês
- ✅ **Emails bonitos** - Suporte completo a HTML
- ✅ **Confiável** - Boa entregabilidade

### Passo a Passo:

#### 2.1 Criar conta no Resend
1. Acesse: https://resend.com
2. Clique em "Sign Up"
3. Crie sua conta (pode usar GitHub)

#### 2.2 Adicionar seu domínio (Opcional mas RECOMENDADO)
**Se você tem um domínio próprio:**

1. No dashboard, vá em **Domains**
2. Clique em **"Add Domain"**
3. Digite: `catbytes.site`
4. Copie os registros DNS que aparecem
5. Vá no seu provedor de domínio (Registro.br, GoDaddy, etc)
6. Adicione os registros DNS:
   - **SPF** (TXT)
   - **DKIM** (TXT)
   - **DMARC** (TXT)
7. Aguarde alguns minutos e clique em "Verify" no Resend

**Registros típicos:**
```
Tipo: TXT
Nome: @
Valor: v=spf1 include:resend.com ~all

Tipo: TXT
Nome: resend._domainkey
Valor: [valor fornecido pelo Resend]

Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:contato@catbytes.site
```

✅ Domínio verificado! Agora seus emails vão sair de `contato@catbytes.site`

**Se NÃO tem domínio:**
- Pode usar o domínio de teste do Resend
- Emails sairão de: `onboarding@resend.dev`
- ⚠️ Pode ir mais para spam

#### 2.3 Criar API Key
1. No menu lateral, clique em **API Keys**
2. Clique em **"Create API Key"**
3. Dê um nome: `CatBytes Newsletter`
4. Permissões: **"Sending access"**
5. Clique em **"Add"**
6. **COPIE A CHAVE AGORA!** (não vai aparecer de novo)

Vai ser algo assim:
```
re_123abc456def789ghi012jkl345mno678pqr
```

☝️ Esta é sua `RESEND_API_KEY`

---

## 3. Configurar Variáveis de Ambiente

### 3.1 Criar arquivo `.env.local`

No seu projeto, crie ou edite o arquivo `.env.local` na raiz:

```bash
# ==============================================
# SUPABASE - Banco de Dados
# ==============================================
# Obtenha em: Supabase Dashboard > Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==============================================
# OPENAI - Geração de Conteúdo com IA
# ==============================================
# Obtenha em: https://platform.openai.com/api-keys

OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==============================================
# RESEND - Envio de Emails
# ==============================================
# Obtenha em: https://resend.com/api-keys

RESEND_API_KEY=re_123abc456def789ghi012jkl345mno678pqr

# ==============================================
# CONFIGURAÇÕES DO SITE
# ==============================================

# URL do seu site em produção
# Se estiver testando localmente, use: http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://catbytes.site

# Número do WhatsApp (apenas números com código do país)
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999

# Segredo para proteger endpoints do Cron Job
# Gere uma string aleatória forte
# Dica: use https://randomkeygen.com/
CRON_SECRET=sua_string_super_secreta_aleatoria_aqui_12345

# Token do GitHub (Opcional - para badges dinâmicas)
# Obtenha em: https://github.com/settings/tokens
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.2 Explicação de cada variável:

#### `NEXT_PUBLIC_SUPABASE_URL`
- **O que é:** URL do seu banco de dados
- **Onde pegar:** Supabase > Settings > API > Project URL
- **Exemplo:** `https://abcdefgh.supabase.co`

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **O que é:** Chave pública para leitura
- **Onde pegar:** Supabase > Settings > API > anon public
- **Exemplo:** `eyJhbGciOi...`

#### `SUPABASE_SERVICE_ROLE_KEY`
- **O que é:** Chave SECRETA para operações administrativas
- **Onde pegar:** Supabase > Settings > API > service_role
- **⚠️ NUNCA compartilhe ou comite no Git!**

#### `OPENAI_API_KEY`
- **O que é:** Chave para usar GPT-4 e DALL-E 3
- **Onde pegar:** https://platform.openai.com/api-keys
- **Como criar:**
  1. Crie conta na OpenAI
  2. Vá em "API keys"
  3. Clique em "Create new secret key"
  4. Copie a chave

#### `RESEND_API_KEY`
- **O que é:** Chave para enviar emails
- **Onde pegar:** https://resend.com/api-keys
- **Formato:** `re_xxxxxxxxxxxx`

#### `NEXT_PUBLIC_SITE_URL`
- **O que é:** URL completa do seu site
- **Em produção:** `https://catbytes.site`
- **Em desenvolvimento:** `http://localhost:3000`
- **Para que serve:** Links nos emails apontam para aqui

#### `CRON_SECRET`
- **O que é:** Senha para proteger o cron job
- **Como criar:** Use uma string aleatória forte
- **Geradores:** https://randomkeygen.com/
- **Exemplo:** `a8d9f7g6h5j4k3l2m1n0o9p8q7r6s5t4`

### 3.3 Configurar no Vercel (Produção)

Se você vai fazer deploy no Vercel:

1. Vá no dashboard do Vercel
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione **TODAS** as variáveis do `.env.local`
5. Marque: ✅ Production ✅ Preview ✅ Development
6. Clique em **Save**

---

## 4. Testar o Sistema

### 4.1 Rodar localmente

```bash
# Instalar dependências
npm install

# Rodar o projeto
npm run dev
```

Acesse: http://localhost:3000

### 4.2 Testar Newsletter

1. Vá até a página do blog: http://localhost:3000/pt-BR/blog
2. Você deve ver a seção de newsletter
3. Preencha seu email e clique em "Assinar"
4. Verifique sua caixa de entrada (e spam!)
5. Você deve receber um email de boas-vindas

### 4.3 Testar geração de posts

**Manual (via API):**
```bash
curl -X POST http://localhost:3000/api/blog/generate \
  -H "Content-Type: application/json"
```

**Cron (automático):**
O cron roda automaticamente no Vercel:
- Terças, Quintas e Sábados às 10h BRT
- Configurado em `vercel.json`

### 4.4 Testar envio de newsletter

```bash
# Substitua POST_ID pelo ID de um post existente
curl -X POST http://localhost:3000/api/newsletter/send-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_CRON_SECRET" \
  -d '{"blogPostId": "POST_ID_AQUI"}'
```

---

## 5. Verificar se está tudo funcionando

### ✅ Checklist Final

- [ ] Tabelas criadas no Supabase
- [ ] Consegue acessar o blog: `/pt-BR/blog`
- [ ] Seção de newsletter aparece no blog
- [ ] Seção de newsletter aparece no footer
- [ ] Consegue se inscrever na newsletter
- [ ] Recebe email de boas-vindas
- [ ] Emails não vão para spam (se configurou domínio)
- [ ] Link de cancelar inscrição funciona

### Comandos úteis para debug:

```bash
# Ver logs do Vercel
vercel logs

# Ver inscritos no Supabase
# Execute no SQL Editor:
SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC;

# Ver campanhas enviadas
SELECT * FROM newsletter_campaigns ORDER BY sent_at DESC;

# Contar inscritos ativos
SELECT COUNT(*) FROM newsletter_subscribers
WHERE verified = true AND subscribed = true;
```

---

## 🆘 Problemas Comuns

### Emails vão para spam
**Solução:**
1. Configure seu domínio no Resend
2. Adicione os registros SPF, DKIM, DMARC
3. Peça aos usuários para adicionar `contato@catbytes.site` nos contatos

### Erro "Table does not exist"
**Solução:**
1. Execute o arquivo `supabase/schema.sql` no SQL Editor
2. Verifique se todas as queries executaram com sucesso

### Erro "Unauthorized" no Cron
**Solução:**
1. Certifique-se que `CRON_SECRET` está configurado no Vercel
2. Use a mesma string no `.env.local` e no Vercel

### Newsletter não aparece no footer
**Solução:**
1. Limpe o cache: `rm -rf .next`
2. Rode novamente: `npm run dev`

---

## 📊 Monitoramento

### Dashboard do Resend
- Acesse: https://resend.com/emails
- Veja todos os emails enviados
- Taxa de entrega
- Bounces e reclamações

### Dashboard do Supabase
- Acesse: https://app.supabase.com
- Table Editor: Ver dados das tabelas
- SQL Editor: Fazer queries customizadas

### Logs do Vercel
- Acesse: https://vercel.com/dashboard
- Veja logs do Cron Job
- Monitore erros em tempo real

---

## 🎉 Pronto!

Seu sistema de newsletter está configurado e pronto para usar!

### O que acontece automaticamente agora:
1. **Terças, Quintas, Sábados às 10h:** Novo post gerado com IA
2. **Imediatamente após:** Email enviado para todos os inscritos
3. **Emails bonitos:** Com a logo, imagens, e formatação profissional
4. **Tracking:** Todas as métricas salvas no banco

### Custos:
- **Supabase:** Gratuito (até 500MB de dados)
- **Resend:** Gratuito (até 3.000 emails/mês)
- **OpenAI:** ~$0.03 por post gerado
- **Vercel:** Gratuito (com limites)

---

Precisa de ajuda? Me chama! 🐱
