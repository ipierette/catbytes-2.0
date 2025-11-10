# 🚀 Guia de Configuração - Vercel Auto-Deploy

## 📋 Visão Geral

O sistema pode fazer deploy automático das landing pages geradas na Vercel de 2 formas:

### **Opção A: Deploy Direto (Recomendado)**
- ✅ Mais simples
- ✅ Não precisa GitHub
- ✅ Deploy instantâneo
- ✅ URL: `lp-slug.vercel.app`
- ✅ **Implementado no código**

### **Opção B: Via GitHub + Vercel**
- ⚠️ Mais complexo
- ⚠️ Cria repositório para cada LP
- ⚠️ Mais lento (~2min)
- ✅ Melhor para versionamento
- ❌ Não implementado ainda

---

## 🔑 Passo 1: Criar Vercel Token

### **Mesma Conta Vercel (Recomendado):**

1. Acesse: https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Configurações:
   ```
   Token Name: Landing Pages Auto Deploy
   Scope: Full Account
   Expiration: No Expiration (ou 1 year)
   ```
4. Clique em **"Create"**
5. **COPIE O TOKEN** (só aparece uma vez!)

### **Conta Separada (Opcional):**

Se quiser criar conta nova para isolar:

1. Crie nova conta Vercel com email diferente
2. Siga os mesmos passos acima
3. Use esse token nas variáveis de ambiente

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

Adicione no arquivo `.env.local`:

```bash
# Vercel Auto-Deploy
VERCEL_TOKEN=seu_token_aqui_copiado_do_passo_1

# Opcional: Se usar Vercel Team
VERCEL_TEAM_ID=team_xxxxxxxxx
```

### Como encontrar VERCEL_TEAM_ID (se usar):
1. Acesse: https://vercel.com/teams/settings
2. Copie o "Team ID" ou "Team Slug"
3. **Deixe VAZIO se usar conta pessoal**

---

## 🧪 Passo 3: Testar Deploy

### No Admin:

1. Vá em `/admin/landing-pages`
2. Clique em **"Nova Landing Page"**
3. Preencha o formulário:
   ```
   Nicho: Consultório Médico
   Problema: Pacientes esquecem consultas e não aparecem
   Solução: Sistema automático de confirmação via WhatsApp
   CTA: Quero Automatizar Meu Consultório
   Tema: Turquesa Saúde
   ```
4. Aguarde ~30 segundos (geração)
5. Na lista, clique no botão **"Deploy"** (vamos adicionar)
6. Aguarde ~10 segundos (deploy Vercel)
7. URL estará disponível: `https://lp-consultorio-123456.vercel.app`

---

## 🔄 Como Funciona (Backend):

```
1. [Admin] Clica em "Deploy"
   ↓
2. [API] POST /api/landing-pages/deploy
   ↓
3. [Vercel API] Cria deployment com HTML
   ↓
4. [Vercel] Gera URL: lp-slug.vercel.app
   ↓
5. [Supabase] Salva deploy_url + status
   ↓
6. [Admin] Mostra link "Ver Online"
```

---

## 💰 Limites Vercel (Plano Free):

- ✅ **100 projetos** (100 landing pages diferentes)
- ✅ **Unlimited deployments**
- ✅ **100GB bandwidth/mês** (suficiente para ~100k visitas)
- ✅ **Unlimited domains** (pode usar domínio customizado)

### Se atingir limite:
- Upgrade para Pro: $20/mês (Unlimited projetos)
- Ou criar segunda conta Vercel

---

## 🎯 Próximos Passos (Adicionar Botão Deploy):

Vou adicionar o botão "Deploy" na interface do admin agora.

---

## 🆚 Comparação: Mesma Conta vs Conta Separada

| Característica | Mesma Conta | Conta Separada |
|---------------|-------------|----------------|
| **Complexidade** | ⭐ Simples | ⭐⭐⭐ Complexo |
| **Custo** | Grátis | Grátis |
| **Limite Projetos** | 100 | 200 (2x100) |
| **Gerenciamento** | 1 dashboard | 2 dashboards |
| **API Tokens** | 1 token | 2 tokens |
| **Billing** | Unificado | Separado |
| **Recomendado para** | Uso normal | Revenda LPs |

---

## 🔐 Segurança:

### Proteções Implementadas:
- ✅ Token em variável de ambiente (não exposto)
- ✅ API route server-side only
- ✅ Validação de landing page ID
- ✅ Update status tracking

### Proteções Adicionais:
- [ ] Limitar deploys por hora (evitar abuse)
- [ ] Webhook Vercel para confirmar deploy
- [ ] Rollback automático se falhar

---

## 📞 Suporte:

Se tiver erro no deploy:
1. Verifique se VERCEL_TOKEN está correto
2. Veja logs do servidor: `npm run dev`
3. Verifique limite de projetos na Vercel
4. Tente deploy manual: https://vercel.com/new

---

**Recomendação Final:** Use a **mesma conta Vercel**. É mais simples e 100 projetos é suficiente para começar. Se crescer muito, upgrade para Pro ($20/mês) vale mais a pena que gerenciar múltiplas contas.
