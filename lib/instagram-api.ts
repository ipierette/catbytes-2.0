/**
 * Instagram Graph API Integration
 * Publica imagens e captions no Instagram Business Account
 */

export interface InstagramCredentials {
  accessToken: string
  accountId: string
}

export interface InstagramPostResult {
  postId: string
  permalink?: string
}

/**
 * Publica uma imagem no Instagram
 * 
 * Processo em 2 etapas:
 * 1. Cria um container de mídia
 * 2. Publica o container
 */
export async function publishInstagramPost(
  imageUrl: string,
  caption: string,
  credentials: InstagramCredentials
): Promise<InstagramPostResult> {
  const { accessToken, accountId } = credentials

  try {
    // Etapa 1: Criar container de mídia
    console.log('Creating Instagram media container...', { imageUrl, captionLength: caption.length })

    const containerResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken
        })
      }
    )

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json()
      console.error('Instagram container creation failed:', errorData)
      throw new Error(`Failed to create media container: ${JSON.stringify(errorData)}`)
    }

    const containerData = await containerResponse.json()
    const creationId = containerData.id

    console.log('Media container created', { creationId })

    // Aguarda processamento (Instagram precisa baixar a imagem)
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Etapa 2: Publicar container
    console.log('Publishing Instagram post...', { creationId })

    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken
        })
      }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error('Instagram publish failed:', errorData)
      throw new Error(`Failed to publish post: ${JSON.stringify(errorData)}`)
    }

    const publishData = await publishResponse.json()
    const postId = publishData.id

    console.log('Instagram post published successfully', { postId })

    // Busca permalink (opcional)
    let permalink: string | undefined
    try {
      const permalinkResponse = await fetch(
        `https://graph.facebook.com/v21.0/${postId}?fields=permalink&access_token=${accessToken}`
      )
      if (permalinkResponse.ok) {
        const permalinkData = await permalinkResponse.json()
        permalink = permalinkData.permalink
      }
    } catch (error) {
      console.warn('Could not fetch permalink:', error)
    }

    return {
      postId,
      permalink
    }
  } catch (error) {
    console.error('Error publishing to Instagram:', error)
    throw error
  }
}

/**
 * Verifica se as credenciais do Instagram são válidas
 */
export async function verifyInstagramCredentials(
  credentials: InstagramCredentials
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${credentials.accountId}?fields=username&access_token=${credentials.accessToken}`
    )

    return response.ok
  } catch {
    return false
  }
}

/**
 * Busca informações da conta do Instagram
 */
export async function getInstagramAccountInfo(
  credentials: InstagramCredentials
): Promise<{
  username: string
  followersCount: number
  mediaCount: number
}> {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${credentials.accountId}?fields=username,followers_count,media_count&access_token=${credentials.accessToken}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Instagram account info')
  }

  const data = await response.json()

  return {
    username: data.username,
    followersCount: data.followers_count,
    mediaCount: data.media_count
  }
}

/**
 * Valida se a URL da imagem é acessível pelo Instagram
 * Instagram precisa conseguir baixar a imagem de uma URL pública
 */
export async function validateImageForInstagram(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    
    // Verifica se é uma imagem e está acessível
    const contentType = response.headers.get('content-type')
    return response.ok && !!contentType && contentType.startsWith('image/')
  } catch {
    return false
  }
}
