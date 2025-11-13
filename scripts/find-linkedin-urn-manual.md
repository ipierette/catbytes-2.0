# 🔍 Como Encontrar Seu LinkedIn Person URN Manualmente

## Método 1: Pelo Perfil do LinkedIn (Mais Fácil)

1. **Acesse seu perfil:** https://www.linkedin.com/in/me/

2. **Copie a URL completa** que aparece, exemplo:
   ```
   https://www.linkedin.com/in/izadora-pierette-12ab34cd/
   ```

3. **Pegue apenas a parte depois de `/in/`:**
   ```
   izadora-pierette-12ab34cd
   ```

4. **Seu Person URN é:**
   ```
   urn:li:person:izadora-pierette-12ab34cd
   ```

5. **Adicione no `.env.local`:**
   ```env
   LINKEDIN_PERSON_URN=urn:li:person:izadora-pierette-12ab34cd
   ```

---

## Método 2: Pelo LinkedIn Developers (Mais Confiável)

1. **Acesse:** https://www.linkedin.com/developers/apps/verification

2. **Faça login** com sua conta LinkedIn

3. **Copie o "Member ID"** que aparece na tela

4. **Seu Person URN é:**
   ```
   urn:li:person:<member-id-copiado>
   ```

5. **Adicione no `.env.local`:**
   ```env
   LINKEDIN_PERSON_URN=urn:li:person:<member-id-copiado>
   ```

---

## Método 3: Testando na Interface (Revelará o URN Correto)

1. **Acesse:** http://localhost:3000/admin/linkedin

2. **Gere um post** qualquer (pode ser de teste)

3. **Clique em "Publicar no LinkedIn"**

4. **Se der erro**, o erro vai mostrar o URN esperado, tipo:
   ```
   Expected author URN: urn:li:person:XXXX
   ```

5. **Copie esse URN** e adicione no `.env.local`

---

## ⚠️ Importante sobre Organization URN (Para Postar como Página)

Se você quer postar como **página da empresa CatBytes**:

1. **Acesse a página:** https://www.linkedin.com/company/catbytes/

2. **Copie a parte depois de `/company/`:**
   ```
   catbytes
   ```

3. **OU pegue o ID numérico** (se houver na URL):
   ```
   https://www.linkedin.com/company/12345678/
   ```

4. **O Organization URN é:**
   ```
   urn:li:organization:12345678
   ```
   
   OU se for por vanity name:
   ```
   urn:li:organization:catbytes
   ```

5. **Adicione no `.env.local`:**
   ```env
   LINKEDIN_ORGANIZATION_URN=urn:li:organization:12345678
   ```

---

## ✅ Exemplo Completo no `.env.local`

```env
# LinkedIn Configuration
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_client_secret
LINKEDIN_ACCESS_TOKEN=seu_token_atual
LINKEDIN_REDIRECT_URI=https://catbytes.site/api/linkedin/callback

# LinkedIn URNs
LINKEDIN_PERSON_URN=urn:li:person:izadora-pierette-12ab34cd
LINKEDIN_ORGANIZATION_URN=urn:li:organization:12345678
```

---

## 🚀 Depois de Adicionar os URNs

1. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse:** http://localhost:3000/admin/linkedin

3. **Teste gerando e publicando um post!**

---

## 💡 Dicas

- O **Person URN** é obrigatório para qualquer publicação
- O **Organization URN** é opcional, só se quiser postar como página
- Se o toggle "Como Página" estiver ativado, será usado o Organization URN
- Se estiver desativado, será usado o Person URN
