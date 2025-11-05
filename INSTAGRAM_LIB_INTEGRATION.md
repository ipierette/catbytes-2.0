# 📦 Integração com instagram-graph-api-lib

## 🎯 **Por que usar essa biblioteca?**

A biblioteca `instagram-graph-api` simplifica as chamadas à API do Instagram:
- ✅ Código mais limpo e organizado
- ✅ TypeScript tipado
- ✅ Menos código manual
- ✅ Manutenção mais fácil

**MAS:** Você **AINDA PRECISA** do token de acesso do Facebook! A biblioteca não resolve o problema de autenticação.

---

## 🔧 **Instalação**

```bash
npm install instagram-graph-api
```

---

## 📝 **Como Adaptar Nosso Sistema**

### **Antes (nosso código atual):**

```typescript
// lib/instagram-api.ts
export async function publishToInstagram(
  imageUrl: string,
  caption: string,
  credentials: InstagramCredentials
): Promise<{ postId: string; permalink: string }> {
  // 1. Criar container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v21.0/${credentials.accountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: credentials.accessToken,
      }),
    }
  )
  
  const containerData = await containerResponse.json()
  const containerId = containerData.id

  // 2. Aguardar status FINISHED
  await waitForContainerStatus(containerId, credentials)

  // 3. Publicar
  const publishResponse = await fetch(
    `https://graph.facebook.com/v21.0/${credentials.accountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: credentials.accessToken,
      }),
    }
  )
  
  // ... resto do código
}
```

---

### **Depois (com a biblioteca):**

```typescript
// lib/instagram-api.ts
import { 
  Client, 
  PostPagePhotoMediaRequest, 
  PostPublishMediaRequest,
  GetContainerRequest 
} from 'instagram-graph-api'

export async function publishToInstagram(
  imageUrl: string,
  caption: string,
  credentials: InstagramCredentials
): Promise<{ postId: string; permalink: string }> {
  // Criar cliente
  const client = new Client(
    credentials.accessToken,
    credentials.accountId
  )

  // 1. Criar container de foto
  const createContainerRequest = client.newPostPagePhotoMediaRequest()
    .withImageUrl(imageUrl)
    .withCaption(caption)

  const containerResponse = await createContainerRequest.execute()
  const containerId = containerResponse.getId()

  // 2. Aguardar status FINISHED
  await waitForContainerStatus(client, containerId)

  // 3. Publicar
  const publishRequest = client.newPostPublishMediaRequest(containerId)
  const publishResponse = await publishRequest.execute()
  
  const postId = publishResponse.getId()
  
  // 4. Buscar permalink
  const mediaRequest = client.newGetMediaRequest(postId)
    .withFields(['permalink'])
  
  const mediaResponse = await mediaRequest.execute()
  const permalink = mediaResponse.getPermalink()

  return { postId, permalink }
}

async function waitForContainerStatus(
  client: Client, 
  containerId: string
): Promise<void> {
  const maxAttempts = 30
  let attempts = 0

  while (attempts < maxAttempts) {
    const statusRequest = client.newGetContainerRequest(containerId)
      .withFields(['status_code'])
    
    const statusResponse = await statusRequest.execute()
    const status = statusResponse.getStatusCode()

    if (status === 'FINISHED') {
      return
    }

    if (status === 'ERROR') {
      throw new Error('Container creation failed')
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
    attempts++
  }

  throw new Error('Timeout waiting for container')
}
```

---

## 🔄 **Atualizar lib/instagram-api.ts Completo**

Vou criar uma versão completa adaptada:

```typescript
// lib/instagram-api.ts
import { 
  Client, 
  PostPagePhotoMediaRequest,
  PostPublishMediaRequest,
  GetContainerRequest,
  GetMediaRequest,
  ContainerStatus 
} from 'instagram-graph-api'

export interface InstagramCredentials {
  accessToken: string
  accountId: string
}

export interface InstagramPublishResult {
  postId: string
  permalink: string
}

/**
 * Publica uma imagem no Instagram
 */
export async function publishToInstagram(
  imageUrl: string,
  caption: string,
  credentials: InstagramCredentials
): Promise<InstagramPublishResult> {
  try {
    const client = new Client(
      credentials.accessToken,
      credentials.accountId
    )

    console.log('📸 Criando container de imagem...')
    
    // 1. Criar container
    const containerRequest = client.newPostPagePhotoMediaRequest()
      .withImageUrl(imageUrl)
      .withCaption(caption)

    const containerResponse = await containerRequest.execute()
    const containerId = containerResponse.getId()

    console.log(`✅ Container criado: ${containerId}`)
    console.log('⏳ Aguardando processamento...')

    // 2. Aguardar status FINISHED
    await waitForContainerStatus(client, containerId)

    console.log('🚀 Publicando no Instagram...')

    // 3. Publicar
    const publishRequest = client.newPostPublishMediaRequest(containerId)
    const publishResponse = await publishRequest.execute()
    
    const postId = publishResponse.getId()

    console.log(`✅ Post publicado: ${postId}`)
    console.log('🔗 Buscando permalink...')

    // 4. Buscar permalink
    const mediaRequest = client.newGetMediaRequest(postId)
      .withFields(['permalink'])
    
    const mediaResponse = await mediaRequest.execute()
    const permalink = mediaResponse.getPermalink()

    console.log(`✅ Permalink: ${permalink}`)

    return { postId, permalink }
  } catch (error) {
    console.error('❌ Erro ao publicar no Instagram:', error)
    throw error
  }
}

/**
 * Aguarda o container ser processado
 */
async function waitForContainerStatus(
  client: Client,
  containerId: string
): Promise<void> {
  const maxAttempts = 30
  const delayMs = 2000
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const statusRequest = client.newGetContainerRequest(containerId)
        .withFields(['status_code'])
      
      const statusResponse = await statusRequest.execute()
      const status = statusResponse.getStatusCode() as ContainerStatus

      console.log(`📊 Status do container: ${status} (tentativa ${attempts + 1}/${maxAttempts})`)

      if (status === ContainerStatus.FINISHED) {
        return
      }

      if (status === ContainerStatus.ERROR) {
        throw new Error('Container creation failed')
      }

      await new Promise(resolve => setTimeout(resolve, delayMs))
      attempts++
    } catch (error) {
      console.error(`⚠️ Erro ao verificar status:`, error)
      throw error
    }
  }

  throw new Error('Timeout: Container não foi processado em tempo hábil')
}

/**
 * Valida se as credenciais do Instagram estão corretas
 */
export async function validateInstagramCredentials(
  credentials: InstagramCredentials
): Promise<boolean> {
  try {
    const client = new Client(
      credentials.accessToken,
      credentials.accountId
    )

    // Tenta buscar informações da conta
    const pageInfoRequest = client.newGetPageInfoRequest()
      .withFields(['id', 'username', 'name'])
    
    const response = await pageInfoRequest.execute()
    
    console.log(`✅ Credenciais válidas para: @${response.getUsername()}`)
    return true
  } catch (error) {
    console.error('❌ Credenciais inválidas:', error)
    return false
  }
}

/**
 * Busca informações da conta do Instagram
 */
export async function getInstagramAccountInfo(
  credentials: InstagramCredentials
) {
  const client = new Client(
    credentials.accessToken,
    credentials.accountId
  )

  const pageInfoRequest = client.newGetPageInfoRequest()
    .withFields(['id', 'username', 'name', 'followers_count', 'follows_count', 'media_count'])
  
  const response = await pageInfoRequest.execute()

  return {
    id: response.getId(),
    username: response.getUsername(),
    name: response.getName(),
    followers: response.getFollowers(),
    following: response.getFollowing(),
    mediaCount: response.getMediaCount()
  }
}
```

---

## 📦 **Instalar a Biblioteca**

```bash
cd /Users/Izadora1/Desktop/programacao/projetos/catbytes-2.0
npm install instagram-graph-api
```

---

## ⚠️ **IMPORTANTE: Você Ainda Precisa do Token!**

A biblioteca **NÃO RESOLVE** o problema de conseguir o token de acesso.

Você ainda precisa:
1. ✅ Criar Página do Facebook
2. ✅ Conectar Instagram à Página
3. ✅ Criar App no Facebook Developers
4. ✅ Gerar Token de Página no Graph API Explorer
5. ✅ Trocar por token de 60 dias
6. ✅ Adicionar no Vercel

**A biblioteca só facilita o código depois que você tem o token!**

---

## 🧪 **Testar Primeiro**

Antes de integrar a biblioteca, teste se seu token funciona:

Veja: `TEST_INSTAGRAM_TOKEN.md`

Se os testes funcionarem, você pode:
- ✅ **OPÇÃO 1**: Usar a biblioteca (código mais limpo)
- ✅ **OPÇÃO 2**: Manter nosso código atual (funciona igualmente)

Ambas as opções precisam do **mesmo token**!

---

## 🤔 **Vale a Pena Mudar?**

**SIM, se:**
- ✅ Você quer código mais limpo e manutenível
- ✅ Prefere TypeScript tipado
- ✅ Vai adicionar mais funcionalidades (insights, stories, etc.)

**NÃO, se:**
- ✅ Nosso código atual já funciona
- ✅ Você prefere não adicionar dependências extras
- ✅ Não quer mexer no código que já está pronto

**Minha recomendação:** Teste o token PRIMEIRO (TEST_INSTAGRAM_TOKEN.md). Se funcionar, podemos integrar a biblioteca depois!

---

## 📝 **Resumo**

1. ✅ Biblioteca facilita o código, mas não resolve autenticação
2. ✅ Você AINDA precisa obter token no Graph API Explorer
3. ✅ Permissões de `pages_*` são suficientes para Instagram
4. ✅ App em modo desenvolvimento funciona normalmente
5. ✅ NÃO precisa publicar o app

**Foco agora:** Conseguir o token funcionando! 🎯
