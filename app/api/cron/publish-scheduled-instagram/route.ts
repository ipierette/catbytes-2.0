import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { startCronLog } from '@/lib/cron-logger'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST - Publica posts agendados do Instagram
 * Chamado pelo cron job diariamente
 */
export async function POST(request: NextRequest) {
  const instagramPublishLog = startCronLog('instagram')
  
  try {
    // Verificação de segurança
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Publish Scheduled Instagram] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Publish Scheduled Instagram] Starting scheduled posts publication...')

    // Buscar posts aprovados que estão prontos para publicar
    const readyPosts = await instagramDB.getApprovedPostsReadyToPublish()

    console.log(`[Publish Scheduled Instagram] Found ${readyPosts.length} posts ready to publish`)

    const results = {
      total: readyPosts.length,
      published: 0,
      failed: 0,
      errors: [] as any[]
    }

    // Publicar cada post
    for (const post of readyPosts) {
      try {
        console.log(`[Publish Scheduled Instagram] Publishing post ${post.id}...`)

        const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
        const accountId = process.env.INSTAGRAM_ACCOUNT_ID

        if (!accessToken || !accountId) {
          throw new Error('Instagram API não configurada')
        }

        // Criar container (apenas imagem única)
        const containerParams = {
          image_url: post.image_url,
          caption: post.caption,
          access_token: accessToken
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
        if (post.id) {
          await instagramDB.markAsPublished(post.id, instagramPostId)
        }

        console.log(`[Publish Scheduled Instagram] ✅ Post ${post.id} published: ${instagramPostId}`)
        results.published++

      } catch (error) {
        console.error(`[Publish Scheduled Instagram] ❌ Error publishing post ${post.id}:`, error)
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        
        // Marcar como falho
        if (post.id) {
          await instagramDB.markAsFailed(post.id, errorMessage)
        }
        
        results.failed++
        results.errors.push({
          postId: post.id,
          error: errorMessage
        })
      }
    }

    console.log(`[Publish Scheduled Instagram] Finished: ${results.published} published, ${results.failed} failed`)

    // Log resultado final
    if (results.failed === 0 && results.total > 0) {
      await instagramPublishLog.success({ instagram_posts: results.published })
    } else if (results.failed > 0) {
      await instagramPublishLog.fail(
        `${results.failed} posts failed out of ${results.total}`,
        { published: results.published, errors: results.errors }
      )
    } else {
      await instagramPublishLog.success({ instagram_posts: 0, message: 'No posts to publish' })
    }

    return NextResponse.json({
      success: true,
      message: `Published ${results.published}/${results.total} Instagram posts`,
      ...results
    })

  } catch (error) {
    console.error('[Publish Scheduled Instagram] Error:', error)
    await instagramPublishLog.fail(error as Error)
    
    return NextResponse.json(
      {
        error: 'Erro ao publicar posts agendados',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}


