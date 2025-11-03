# 🧪 Guia Completo de Teste - Newsletter CatBytes

## ✅ Pré-requisitos Verificados

- [x] Variáveis de ambiente configuradas (`.env.local`)
- [x] Tabelas criadas no Supabase
- [x] Políticas RLS configuradas
- [x] API Key do Resend ativa
- [x] Domínio verificado no Resend
- [x] Servidor Next.js rodando

---

## 📋 Fluxo Completo de Teste

### 1️⃣ Teste de Inscrição

**URL de Teste:** http://localhost:3000/pt-BR/newsletter-test

**Passos:**
1. Abra a URL no navegador
2. Preencha com um email válido que você tenha acesso
3. (Opcional) Preencha o nome
4. Clique em "Inscrever-se Gratuitamente"

**Resultado Esperado:**
- ✅ Mensagem de sucesso aparece
- ✅ Campos do formulário são limpos
- ✅ Console do navegador não mostra erros

**Verificação no Supabase:**
```sql
SELECT * FROM newsletter_subscribers 
ORDER BY subscribed_at DESC 
LIMIT 1;
```

**Campos esperados:**
- `email`: seu@email.com (minúsculas)
- `subscribed`: true
- `verified`: false
- `verification_token`: [string aleatória de 64 caracteres]
- `source`: "blog"
- `ip_address`: [seu IP]
- `subscribed_at`: [timestamp atual]

---

### 2️⃣ Teste de Email de Boas-Vindas

**Onde verificar:**
- 📧 Caixa de entrada do email cadastrado
- 📧 Pasta de spam/lixo eletrônico (se não aparecer)
- 🌐 Dashboard do Resend: https://resend.com/emails

**Email esperado:**
- **De:** CatBytes <contato@catbytes.site>
- **Assunto:** 🐱 Bem-vindo à Newsletter CatBytes!
- **Conteúdo:**
  - Mensagem de boas-vindas personalizada com o nome
  - Lista do que vai receber (artigos, dicas, novidades)
  - Botão "✓ Confirmar Inscrição"
  - Aviso para adicionar email aos contatos
  - Link para cancelar inscrição

**Se o email não chegar:**
1. Verifique o dashboard do Resend
2. Verifique os logs do servidor Next.js
3. Confirme que o domínio está verificado no Resend
4. Teste com outro email (Gmail, Outlook, etc.)

---

### 3️⃣ Teste de Verificação de Email

**Passos:**
1. Abra o email recebido
2. Clique no botão "✓ Confirmar Inscrição"
3. Você será redirecionado para: `/newsletter/verify?token=...`

**Resultado Esperado:**
- ✅ Página bonita com mensagem de sucesso
- ✅ Ícone verde de confirmação com animação
- ✅ Seu email é exibido
- ✅ Mensagem: "Email Verificado! 🎉"
- ✅ Lista do que vem agora
- ✅ Botões para voltar ao site ou ver o blog

**Verificação no Supabase:**
```sql
SELECT verified, verified_at 
FROM newsletter_subscribers 
WHERE email = 'seu@email.com';
```

**Campos esperados:**
- `verified`: true ✅
- `verified_at`: [timestamp de quando você clicou]

---

### 4️⃣ Teste de Token Já Usado

**Passos:**
1. Tente clicar novamente no link de verificação do email
2. Ou acesse manualmente: `/newsletter/verify?token=SEU_TOKEN`

**Resultado Esperado:**
- ✅ Mensagem: "Este email já foi verificado anteriormente!"
- ✅ Não dá erro
- ✅ Continua mostrando página de sucesso

---

### 5️⃣ Teste de Token Inválido

**Passos:**
1. Acesse: http://localhost:3000/newsletter/verify?token=token_invalido_12345

**Resultado Esperado:**
- ✅ Página com ícone vermelho de erro
- ✅ Mensagem: "Token inválido ou expirado"
- ✅ Lista de possíveis causas
- ✅ Botão para voltar ao site

---

### 6️⃣ Teste de Token Ausente

**Passos:**
1. Acesse: http://localhost:3000/newsletter/verify

**Resultado Esperado:**
- ✅ Página com ícone laranja
- ✅ Mensagem: "Link Inválido"
- ✅ Sugestão para verificar o link completo

---

## 🔍 Checklist de Validação

### Frontend
- [ ] Formulário envia dados corretamente
- [ ] Loading state aparece durante envio
- [ ] Mensagem de sucesso é exibida
- [ ] Mensagem de erro aparece se falhar
- [ ] Campos são limpos após sucesso
- [ ] Email é validado (formato correto)

### Backend API
- [ ] POST `/api/newsletter/subscribe` retorna 200
- [ ] Email é salvo no banco em minúsculas
- [ ] Token de verificação é gerado (64 chars)
- [ ] IP e User-Agent são salvos
- [ ] Não permite emails duplicados ativos
- [ ] Email de boas-vindas é enviado

### Email
- [ ] Email chega na caixa de entrada
- [ ] Remetente correto: contato@catbytes.site
- [ ] Layout renderiza corretamente
- [ ] Botão de confirmação funciona
- [ ] Link de cancelamento funciona
- [ ] Imagens carregam (logo, etc.)

### Verificação
- [ ] POST `/api/newsletter/verify` retorna 200
- [ ] Campo `verified` muda para true
- [ ] Campo `verified_at` é preenchido
- [ ] Página de sucesso renderiza corretamente
- [ ] Token já usado retorna mensagem adequada
- [ ] Token inválido retorna erro 404

### Banco de Dados
- [ ] Subscriber é criado com todos os campos
- [ ] Índices estão funcionando
- [ ] RLS permite INSERT público
- [ ] RLS permite UPDATE por token
- [ ] Constraint de email funciona

---

## 🐛 Troubleshooting

### Erro: "supabaseUrl is required"
**Causa:** Variáveis do Supabase não estão carregadas
**Solução:**
```bash
# Parar o servidor
pkill -f "next dev"

# Verificar variáveis
node scripts/check-env.js

# Reiniciar servidor
npm run dev
```

### Erro: Email não chega
**Possíveis causas:**
1. RESEND_API_KEY incorreta ou expirada
2. Domínio não verificado no Resend
3. Email caiu no spam
4. Limite de envios excedido (Resend free tier)

**Verificação:**
- Dashboard Resend: https://resend.com/emails
- Logs do servidor: Buscar por `[Newsletter] Welcome email error`

### Erro: "Token inválido ou expirado"
**Possíveis causas:**
1. Token foi usado anteriormente
2. Link foi copiado incorretamente
3. Banco foi resetado mas email não

**Solução:**
```sql
-- Verificar token no banco
SELECT verification_token, verified 
FROM newsletter_subscribers 
WHERE email = 'seu@email.com';

-- Se necessário, resetar verificação
UPDATE newsletter_subscribers 
SET verified = false, verified_at = NULL 
WHERE email = 'seu@email.com';
```

### Erro: Página de verificação carrega infinitamente
**Causa:** API não está respondendo
**Verificação:**
1. Abra DevTools (F12) > Network
2. Procure por requisição para `/api/newsletter/verify`
3. Veja se retorna 200, 404 ou 500
4. Verifique os logs do servidor

---

## 📊 Queries Úteis do Supabase

### Ver todos os subscribers
```sql
SELECT 
  email, 
  name, 
  subscribed, 
  verified,
  subscribed_at,
  verified_at,
  source
FROM newsletter_subscribers
ORDER BY subscribed_at DESC;
```

### Ver subscribers não verificados
```sql
SELECT email, subscribed_at
FROM newsletter_subscribers
WHERE verified = false AND subscribed = true
ORDER BY subscribed_at DESC;
```

### Ver subscribers verificados hoje
```sql
SELECT email, verified_at
FROM newsletter_subscribers
WHERE DATE(verified_at) = CURRENT_DATE
ORDER BY verified_at DESC;
```

### Resetar verificação (para reteste)
```sql
UPDATE newsletter_subscribers
SET verified = false, verified_at = NULL
WHERE email = 'seu@email.com';
```

### Deletar subscriber (para reteste completo)
```sql
DELETE FROM newsletter_subscribers
WHERE email = 'seu@email.com';
```

---

## ✅ Teste Completo Passou?

Se todos os itens acima funcionaram:

1. ✅ Sistema de inscrição funcionando
2. ✅ Email de boas-vindas sendo enviado
3. ✅ Verificação de email funcionando
4. ✅ Banco de dados salvando corretamente
5. ✅ Erros sendo tratados adequadamente

**Próximos passos:**
- Testar em produção (Vercel)
- Criar campanha de newsletter
- Configurar envio automático de posts
- Adicionar analytics de abertura/cliques

---

## 📝 Logs para Monitorar

### Servidor Next.js
```
[Newsletter] Subscription error: ...
[Newsletter] Welcome email error: ...
[Newsletter] Verification error: ...
[Newsletter] Update error: ...
```

### Console do Navegador
```
Verification error: ...
```

### Supabase Logs
- SQL Editor > Logs
- Procure por erros nas queries
- Verifique políticas RLS

---

**🐱 Criado por CatBytes - Testado e aprovado pelos gatinhos!**
