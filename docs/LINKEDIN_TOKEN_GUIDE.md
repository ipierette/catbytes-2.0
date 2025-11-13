# 🔑 Guia Completo: Gerar Token do LinkedIn

## 📋 Informações que você já tem

✅ **CLIENT_ID**: Configurado no .env.local  
✅ **CLIENT_SECRET**: Configurado no .env.local  
✅ **REDIRECT_URI**: `https://catbytes.site/api/linkedin/callback`  
✅ **APP_ID**: Configurado no .env.local  
✅ **CRM_ID**: Configurado no .env.local  
✅ **ACCESS_TOKEN**: (você já gerou!)

---

## ❌ Informações que ainda precisam ser obtidas

### 1. LINKEDIN_PERSON_URN
- **O que é**: Identificador único do seu perfil pessoal no LinkedIn
- **Formato**: `urn:li:person:ABC123xyz`
- **Como obter**: Veja o **Passo 3** abaixo

### 2. LINKEDIN_ORGANIZATION_URN
- **O que é**: Identificador único da página CatBytes no LinkedIn
- **Formato**: `urn:li:organization:12345678`
- **Como obter**: Veja o **Passo 4** abaixo

---

## 🚀 Passo a Passo Completo

### Passo 1: URL de Autorização (✅ Você já fez isso!)

Você já acessou e autorizou através desta URL:
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=SEU_CLIENT_ID&redirect_uri=https://catbytes.site/api/linkedin/callback&scope=openid%20profile%20email%20w_member_social&state=RANDOM
```

---

### Passo 2: Trocar código por token (✅ Você já fez isso!)

Você já executou algo similar a:
```bash
curl -X POST 'https://www.linkedin.com/oauth/v2/accessToken' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'code=SEU_CODIGO' \
  -d 'redirect_uri=https://catbytes.site/api/linkedin/callback' \
  -d 'client_id=SEU_CLIENT_ID' \
  -d 'client_secret=SEU_CLIENT_SECRET'
```

E obteve o token: `AQUI...MVWxtSlOlg`

---

### Passo 3: Obter Person URN ⚠️ FAÇA AGORA

Execute este comando no terminal (substitua `SEU_TOKEN` pelo token que você gerou):

```bash
curl -X GET 'https://api.linkedin.com/v2/userinfo' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

**Resposta esperada:**
```json
{
  "sub": "ABC123xyz",  // 👈 Este é o seu Person URN!
  "name": "Seu Nome",
  "given_name": "Seu",
  "family_name": "Nome",
  "email": "seu@email.com",
  "email_verified": true
}
```

**Copie o valor de `sub`** e adicione ao `.env.local`:
```env
LINKEDIN_PERSON_URN=ABC123xyz
```

---

### Passo 4: Obter Organization URN ⚠️ FAÇA AGORA

#### Método 1: Através da API (recomendado)

```bash
curl -X GET 'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organization~(localizedName,vanityName)))' \
  -H 'Authorization: Bearer SEU_TOKEN_AQUI'
```

**Resposta esperada:**
```json
{
  "elements": [
    {
      "organization": "urn:li:organization:12345678",  // 👈 Organization URN!
      "organization~": {
        "localizedName": "CatBytes",
        "vanityName": "catbytes"
      }
    }
  ]
}
```

#### Método 2: Através do LinkedIn Developers

1. Acesse seu app no LinkedIn Developers
2. Vá na aba **"Products"**
3. Clique em **"Marketing Developer Platform"** (se habilitado)
4. Você verá as organizações autorizadas listadas
5. O ID da organização aparecerá no formato: `urn:li:organization:NUMERO`

#### Método 3: Através da URL da página

1. Acesse a página CatBytes no LinkedIn
2. Olhe a URL: `https://www.linkedin.com/company/12345678/`
3. O número `12345678` é o Organization ID
4. Formate como: `urn:li:organization:12345678`

**Adicione ao `.env.local`:**
```env
LINKEDIN_ORGANIZATION_URN=urn:li:organization:12345678
```

---

## 📝 Atualizando o .env.local

Seu arquivo `.env.local` deve ficar assim:

```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=seu_client_id_aqui
LINKEDIN_CLIENT_SECRET=seu_client_secret_aqui
LINKEDIN_REDIRECT_URI=https://catbytes.site/api/linkedin/callback
LINKEDIN_APP_ID=seu_app_id_aqui
LINKEDIN_CRM_ID=seu_crm_id_aqui

# Token de Acesso (expira em 60 dias)
LINKEDIN_ACCESS_TOKEN=SEU_TOKEN_AQUI
LINKEDIN_TOKEN_EXPIRY=2025-01-11T00:00:00.000Z

# URNs (obtenha seguindo o passo 3 e 4)
LINKEDIN_PERSON_URN=ABC123xyz
LINKEDIN_ORGANIZATION_URN=urn:li:organization:12345678
```

---

## 🎯 Usando o Gerador Automático

Agora que corrigimos o sistema, você pode usar o Admin > Configurações > Gerar Token LinkedIn:

1. ✅ O sistema vai gerar a URL correta automaticamente
2. ✅ Vai incluir os escopos corretos: `openid`, `profile`, `email`, `w_member_social`
3. ✅ Vai te dar o comando curl pronto para copiar e colar
4. ✅ Vai te guiar para obter o Person URN

---

## ⏰ Renovação Automática

**Token expira em 60 dias (aproximadamente 11 de janeiro de 2025)**

Configure lembretes no Admin > Configurações:
- ⏰ 30 dias antes (12 de dezembro)
- ⏰ 14 dias antes (28 de dezembro)
- ⏰ 7 dias antes (4 de janeiro)
- ⏰ 3 dias antes (8 de janeiro)
- ⏰ 1 dia antes (10 de janeiro)

---

## 🐛 Troubleshooting

### Erro: "Invalid redirect_uri"
- ✅ Certifique-se que `https://catbytes.site/api/linkedin/callback` está registrado no app

### Erro: "Invalid scope"
- ✅ Verifique se o app tem os produtos habilitados:
  - Share on LinkedIn
  - Sign In with LinkedIn using OpenID Connect

### Erro: "Token expired"
- ✅ O token expira em 60 dias
- ✅ Use o gerador no Admin > Configurações para renovar

### Person URN não aparece
- ✅ Certifique-se que usou o endpoint `/v2/userinfo` (não `/v2/me`)
- ✅ O Person URN é o campo `sub` da resposta

---

## 📚 Links Úteis

- [LinkedIn OAuth Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)

---

## ✅ Checklist Final

- [x] CLIENT_ID configurado
- [x] CLIENT_SECRET configurado
- [x] REDIRECT_URI configurado
- [x] ACCESS_TOKEN gerado
- [ ] PERSON_URN obtido (execute Passo 3)
- [ ] ORGANIZATION_URN obtido (execute Passo 4)
- [ ] .env.local atualizado
- [ ] Servidor reiniciado
- [ ] Teste de postagem no LinkedIn realizado

---

**🎉 Após completar todos os passos, você poderá postar automaticamente no LinkedIn através do CatBytes!**
