# 🚀 Sistema LinkedIn + Vlog - Guia de Configuração

## ✅ O que foi criado

### 1. Sistema LinkedIn (Página Admin)
- **Página:** `/admin/linkedin`
- **Funcionalidades:**
  - Gerar posts sobre artigos do blog
  - Gerar posts aleatórios sobre fullstack em diferentes nichos
  - Edição de texto antes de publicar
  - Geração de imagem com DALL-E baseada em prompt IA
  - Publicação como perfil pessoal ou página da empresa

### 2. Sistema Vlog (Upload e Publicação de Vídeos)
- **Página:** `/admin/vlog`
- **Funcionalidades:**
  - Upload de vídeos até 10MB
  - IA melhora automaticamente a descrição
  - Publicação em múltiplas plataformas:
    - Instagram Feed (post de vídeo)
    - Instagram Reels
    - LinkedIn (post com vídeo)

### 3. APIs Criadas
- `/api/linkedin/generate` - Gera conteúdo de posts
- `/api/linkedin/upload-image` - Upload temporário de imagens
- `/api/linkedin/post` - Publica no LinkedIn
- `/api/vlog/upload` - Upload e processamento de vídeos
- `/api/vlog/publish` - Publicação multi-plataforma

---

## 🔧 Configuração Obrigatória

### Passo 1: Executar Migrations do Supabase

Você precisa executar 2 migrations no Supabase Dashboard:

1. **Acesse:** https://supabase.com/dashboard/project/lbjekucdxgouwgegpdhi/sql/new

2. **Execute a migration `secure_credentials`:**
```sql
-- Copie e execute o conteúdo de:
supabase/migrations/create_secure_credentials_table.sql
```

3. **Execute a migration `vlogs`:**
```sql
-- Copie e execute o conteúdo de:
supabase/migrations/20251113_create_vlogs_table.sql
```

### Passo 2: Configurar LinkedIn Developer App

1. **Acesse:** https://www.linkedin.com/developers/apps/229306421

2. **Aba "Products"** - Certifique-se que está marcado:
   - ✅ Share on LinkedIn

3. **Aba "Auth"** - Verifique o OAuth 2.0 scope:
   - ✅ `w_member_social` (único necessário)

> **Nota:** Se você usa apenas o escopo `w_member_social`, você consegue postar no LinkedIn tanto como perfil pessoal quanto como página (se tiver permissões de admin na página).

### Passo 3: Obter Person URN com Token Atual

Como você já tem um token com `w_member_social`, vamos apenas buscar seu Person URN:

1. **Execute no terminal:**
```bash
node scripts/get-linkedin-urns.js
```

2. **O script irá:**
   - Buscar seu Person URN usando a API `/v2/me`
   - Tentar buscar organizações onde você é admin (se tiver)
   - Atualizar automaticamente o `.env.local` com os URNs encontrados

3. **Verifique o `.env.local`** - deve ter:
```env
LINKEDIN_ACCESS_TOKEN=<seu_token_atual>
LINKEDIN_PERSON_URN=<urn_encontrado>
LINKEDIN_ORGANIZATION_URN=<urn_da_página_se_existir>
```

3. Se encontrar, atualizará automaticamente:
```env
LINKEDIN_ORGANIZATION_URN=urn:li:organization:XXXXXX
```

---

## 📦 Dependências Necessárias

Certifique-se que estas dependências estão instaladas:

```bash
npm install uuid @google/generative-ai
```

---

## 🎯 Como Usar

### LinkedIn Posts

1. Acesse `/admin/linkedin`
2. Escolha o tipo de post:
   - **Post sobre Fullstack:** Gera conteúdo aleatório
   - **Divulgar Artigo do Blog:** Escolha um artigo publicado
3. Clique em "Gerar Post com IA"
4. Revise o texto e o prompt da imagem
5. (Opcional) Clique em "Gerar Imagem com DALL-E"
6. Escolha se quer publicar como perfil ou página
7. Clique em "Publicar no LinkedIn"

### Vlog (Vídeos)

1. Acesse `/admin/vlog`
2. Selecione um vídeo (até 10MB)
3. Escreva uma breve descrição
4. Clique em "Processar e Melhorar com IA"
5. Aguarde o upload e processamento
6. A IA melhorará a descrição automaticamente
7. Selecione as plataformas:
   - 📸 Instagram Feed
   - 🎬 Instagram Reels
   - 💼 LinkedIn
8. Clique em "Publicar nas Plataformas"

---

## ⚠️ Observações Importantes

### Sobre o LinkedIn

- O token do LinkedIn expira em **60 dias**
- Não existe refresh token (precisa re-autenticar)
- Posts com imagem têm ~2x mais engajamento
- O upload de vídeo nativo no LinkedIn é complexo (usa link por ora)

### Sobre Vídeos no Instagram

- **Reels:** Formato vertical, até 90 segundos
- **Feed:** Formato quadrado/horizontal
- O processamento pode levar alguns minutos
- Máximo 10MB por vídeo

### Sobre o Storage

- Vídeos são armazenados no **Supabase Storage** (bucket: `videos`)
- Imagens temporárias do LinkedIn em `public/temp/linkedin/`
- Considere limpar arquivos antigos periodicamente

---

## 🐛 Troubleshooting

### "Token do LinkedIn não configurado"
→ Execute os Passos 3 e 4 acima para obter novo token

### "Person URN não configurado"
→ Execute `node scripts/get-linkedin-urns.js` após atualizar o token

### "Erro ao fazer upload do vídeo"
→ Verifique se a migration `vlogs` foi executada no Supabase
→ Confirme que o bucket `videos` existe e é público

### "Timeout ao aguardar processamento do vídeo"
→ Vídeo muito grande ou internet lenta
→ Instagram pode demorar até 2 minutos para processar

### "Erro ao gerar imagem"
→ Verifique se `OPENAI_API_KEY` está no `.env.local`
→ Confirme que tem créditos na conta OpenAI

---

## 📝 Checklist Final

Antes de usar o sistema, confirme:

- [ ] Migration `secure_credentials` executada no Supabase
- [ ] Migration `vlogs` executada no Supabase
- [ ] Bucket `videos` criado no Supabase Storage (público)
- [ ] LinkedIn App com produtos "OpenID Connect" e "Share on LinkedIn"
- [ ] Escopos corretos configurados no LinkedIn App
- [ ] Novo token OAuth obtido (com escopos: profile, email, openid, w_member_social)
- [ ] `LINKEDIN_ACCESS_TOKEN` atualizado no `.env.local`
- [ ] `LINKEDIN_PERSON_URN` configurado no `.env.local`
- [ ] (Opcional) `LINKEDIN_ORGANIZATION_URN` configurado
- [ ] Dependências instaladas (`uuid`, `@google/generative-ai`)

---

## 🎉 Pronto!

Após seguir todos os passos, você terá:

✅ Sistema completo de posts no LinkedIn com IA
✅ Geração automática de imagens
✅ Upload e publicação de vídeos em múltiplas plataformas
✅ Interface admin integrada e intuitiva

**Dúvidas?** Verifique os logs no console do navegador ou do servidor.
