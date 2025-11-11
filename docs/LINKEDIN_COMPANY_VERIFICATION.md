# 🔐 Verificação da Empresa CatBytes no LinkedIn

## 📋 Status Atual

### Credenciais Configuradas ✅
- **Client ID**: Configurado em `.env.local`
- **Client Secret**: Configurado em `.env.local`
- **Redirect URI**: `https://catbytes.site/api/linkedin/callback`

### URL de Verificação Recebida
```
Configurada em .env.local (LINKEDIN_VERIFICATION_URL)
```

---

## ⚠️ O Que é a Verificação de Empresa?

Quando você cria uma LinkedIn App e a associa a uma **LinkedIn Page** (página de empresa), o LinkedIn exige que um **Admin da página** aprove essa associação.

### Por que é necessário?
- ✅ Permite publicar **em nome da empresa** (não apenas pessoal)
- ✅ Dá acesso ao scope `w_organization_social`
- ✅ Protege contra apps não autorizados usando o nome da empresa

### ⚠️ Importante
> **Uma vez aprovada, a verificação NÃO PODE SER DESFEITA!**

---

## 👥 Quem Pode Aprovar?

Apenas **Admins da página** "Catbytes2.0-Sistema Inteligente de Presença Digital e Automação Criativa" podem aprovar.

### Como Verificar se Você é Admin

1. Acesse: https://www.linkedin.com/company/catbytes20/
2. Clique em **"Admin tools"** (canto superior direito)
3. Se conseguir ver, você é Admin ✅

---

## 🚀 Como Fazer a Verificação

### Passo 1: Acessar o Link de Verificação

Acesse o link de verificação configurado em `.env.local` (variável `LINKEDIN_VERIFICATION_URL`).

Um Admin da página CatBytes precisa acessar este link.

### Passo 2: O Admin Vai Ver Esta Tela

```
┌─────────────────────────────────────────────────────────┐
│  Verify company                                    ✕    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Company verification                                   │
│                                                         │
│  When a Page verifies the association to an app it     │
│  also takes responsibility for it. This also enables   │
│  Page Admins to view this association.                 │
│                                                         │
│  Once verification is complete, it cannot be undone.   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Verification process                                   │
│                                                         │
│  1. Please send the verification URL to a Page Admin   │
│     for Catbytes2.0-Sistema Inteligente de Presença    │
│     Digital e Automação Criativa. They will be able    │
│     to complete the process by approving the           │
│     association.                                       │
│                                                         │
│  2. During the approval process, your name, profile    │
│     image, current title, current company name and     │
│     connection will be visible to the Page Admin.     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Cancel]                         [I'm done]           │
└─────────────────────────────────────────────────────────┘
```

### Passo 3: O Admin Clica em "Approve"

Após aprovação, a app terá permissão para:
- ✅ Publicar posts em nome da página CatBytes
- ✅ Acessar analytics da página
- ✅ Gerenciar conteúdo da empresa

### Passo 4: Confirmar Verificação Completa

Volte para o Developer Portal e verifique:
- https://www.linkedin.com/developers/apps/YOUR_APP_ID/settings

Você deve ver:
```
✅ Company Verification: Verified
   Catbytes2.0-Sistema Inteligente de Presença Digital e Automação Criativa
```

---

## 🔧 Após a Verificação

### 1. Obter Organization URN

Depois da verificação, você precisa do **Organization URN** da página CatBytes.

**Como obter**:

```bash
# Usando a LinkedIn API
curl -X GET 'https://api.linkedin.com/v2/organizations?q=administeredOrganization' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

Ou veja no Admin Panel da página:
- URL da página: `https://www.linkedin.com/company/catbytes20/`
- Organization URN: `urn:li:organization:XXXXX`

### 2. Atualizar .env.local

Adicione o URN obtido:

```bash
LINKEDIN_ORGANIZATION_URN=urn:li:organization:XXXXX
```

### 3. Testar Publicação

Após verificação completa, você poderá publicar posts em nome da empresa:

```typescript
import { publishLinkedInPost } from '@/lib/linkedin-api'

const result = await publishLinkedInPost({
  text: '🚀 Primeiro post automatizado da CatBytes!',
  organizationUrn: process.env.LINKEDIN_ORGANIZATION_URN, // Publica como empresa
})
```

---

## 🐛 Troubleshooting

### Erro: "Insufficient privileges"

**Problema**: Você não é Admin da página

**Solução**: 
1. Peça para outro Admin adicionar você como Admin
2. Ou peça para esse Admin fazer a verificação

### Erro: "Verification link expired"

**Problema**: Link de verificação expirou

**Solução**:
1. Volte ao Developer Portal
2. Gere um novo link de verificação
3. Envie para o Admin novamente

### Verificação não aparece como completa

**Problema**: Processo não finalizou

**Solução**:
1. Aguarde 5-10 minutos (pode demorar)
2. Atualize a página do Developer Portal
3. Se persistir, tente fazer logout/login

---

## 📝 Checklist de Verificação

- [ ] Você tem acesso Admin à página CatBytes no LinkedIn?
- [ ] Link de verificação foi enviado/acessado?
- [ ] Aprovação foi confirmada pelo Admin?
- [ ] Status mudou para "Verified" no Developer Portal?
- [ ] Organization URN foi obtido e adicionado ao `.env.local`?
- [ ] Teste de publicação funcionou?

---

## 🎯 Próximos Passos Após Verificação

1. ✅ **Completar OAuth Flow** - Obter access token
2. ✅ **Salvar tokens no Supabase** - Usar `linkedin_settings` table
3. ✅ **Implementar auto-post do blog** - Publicar artigos automaticamente
4. ✅ **Dashboard de controle** - Interface para gerenciar tokens e posts

---

## 📞 Contato

Se precisar de ajuda com a verificação:
- **Email Admin CatBytes**: ipierette2@gmail.com
- **LinkedIn Support**: https://www.linkedin.com/help/linkedin

---

**Última atualização**: 11 de novembro de 2025
