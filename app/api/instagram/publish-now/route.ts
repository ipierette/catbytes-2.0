import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'

/**
 * POST - Publica um post imediatamente no Instagram
 * Body: { postId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'postId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar post
    const posts = await instagramDB.getPendingPosts()
    const approvedPosts = await instagramDB.getApprovedPostsReadyToPublish()
    const post = [...posts, ...approvedPosts].find(p => p.id === postId)

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Publicar no Instagram via API
    console.log('[Instagram Publish Now] Publishing post:', postId)
    
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

    if (!accessToken || !accountId) {
      throw new Error('Instagram API não configurada')
    }

    // Criar container
    let containerParams: any

    if (post.carousel_images && post.carousel_images.length > 0) {
      // Carrossel
      const childrenIds = await createCarouselChildren(post.carousel_images, accessToken, accountId)
      containerParams = {
        caption: post.caption,
        media_type: 'CAROUSEL',
        children: childrenIds,
        access_token: accessToken
      }
    } else {
      // Imagem única
      containerParams = {
        image_url: post.image_url,
        caption: post.caption,
        access_token: accessToken
      }
    }

    const containerResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(containerParams)
      }
    )

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json()
      throw new Error(errorData.error?.message || 'Erro ao criar container')
    }

    const { id: containerId } = await containerResponse.json()

    // Publicar container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken
        })
      }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      throw new Error(errorData.error?.message || 'Erro ao publicar')
    }

    const { id: instagramPostId } = await publishResponse.json()

    // Marcar como publicado
    await instagramDB.markAsPublished(postId, instagramPostId)

    console.log('[Instagram Publish Now] ✅ Post published:', instagramPostId)

    return NextResponse.json({
      success: true,
      message: 'Post publicado com sucesso no Instagram!',
      instagramId: instagramPostId
    })
  } catch (error) {
    console.error('[Instagram Publish Now] Error:', error)

    return NextResponse.json(
      { 
        error: 'Erro ao publicar no Instagram',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

async function createCarouselChildren(imageUrls: string[], accessToken: string, accountId: string) {
  const childrenIds: string[] = []

  for (const imageUrl of imageUrls) {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          is_carousel_item: true,
          access_token: accessToken
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Erro ao criar item do carrossel: ${error.error?.message}`)
    }

    const { id } = await response.json()
    childrenIds.push(id)
  }

  return childrenIds
}
