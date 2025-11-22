# LinkedIn Token Expiration - Solução

## Problema
Os tokens do LinkedIn expiram a cada 60 dias, mas você está relatando expiração a cada 3-4 dias.

## Causas Possíveis

### 1. **Usando Access Token ao invés de Refresh Token**
O access token do LinkedIn expira em **60 dias** e não pode ser renovado automaticamente.

### 2. **Token sendo invalidado por mudanças na app**
- Mudanças nos escopos da aplicação
- Mudanças na chave secreta
- Múltiplos logins/reautorizações

## Solução: Implementar OAuth 2.0 Refresh Token

### Passo 1: Obter Refresh Token (primeira vez)

1. Acesse: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=openid%20profile%20email%20w_member_social`

2. Após autorizar, você receberá um `code`

3. Troque o code por access_token + refresh_token:

```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

Resposta:
```json
{
  "access_token": "AQV...",
  "refresh_token": "AQX...",
  "expires_in": 5184000,  // 60 dias
  "refresh_token_expires_in": 31536000  // 365 dias
}
```

### Passo 2: Salvar Tokens no .env

```env
LINKEDIN_ACCESS_TOKEN=AQV...
LINKEDIN_REFRESH_TOKEN=AQX...
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

### Passo 3: Automatizar Renovação (TODO)

Criar endpoint `/api/linkedin/refresh-token` que roda antes de cada publicação:

```typescript
async function refreshLinkedInToken() {
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.LINKEDIN_REFRESH_TOKEN!,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    })
  })
  
  const data = await response.json()
  
  // Atualizar no Vercel via API
  // ou salvar em database e ler de lá
  
  return data.access_token
}
```

## Solução Temporária (Manual)

### A cada 3-4 dias, reautorize:

1. Vá em: https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=https://catbytes.site/api/linkedin/callback&scope=openid%20profile%20email%20w_member_social

2. Copie o `code` da URL de retorno

3. Execute:
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -d "grant_type=authorization_code" \
  -d "code=CODIGO_AQUI" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://catbytes.site/api/linkedin/callback"
```

4. Atualize `LINKEDIN_ACCESS_TOKEN` no Vercel

## Próximos Passos

- [ ] Criar endpoint de callback OAuth
- [ ] Salvar refresh_token no database (Supabase)
- [ ] Implementar auto-renovação antes de cada post
- [ ] Adicionar monitoramento de expiração no dashboard admin

## Referências

- [LinkedIn OAuth 2.0 Docs](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Refresh Token Guide](https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens)
