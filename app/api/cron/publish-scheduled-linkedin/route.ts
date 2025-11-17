import { NextRequest, NextResponse } from 'next/server'
import { linkedInDB } from '@/lib/linkedin-db'
import { startCronLog } from '@/lib/cron-logger'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST - Publica posts agendados do LinkedIn
 * Chamado pelo cron job diariamente
 */
export async function POST(request: NextRequest) {
  const linkedinPublishLog = startCronLog('instagram')
  
  try {
    // Verificação de segurança
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Publish Scheduled LinkedIn] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Publish Scheduled LinkedIn] Starting scheduled posts publication...')

    // Buscar posts aprovados que estão prontos para publicar
    const readyPosts = await linkedInDB.getApprovedPostsReadyToPublish()

    console.log(`[Publish Scheduled LinkedIn] Found ${readyPosts.length} posts ready to publish`)

    const results = {
      total: readyPosts.length,
      published: 0,
      failed: 0,
      errors: [] as any[]
    }

    // Publicar cada post
    for (const post of readyPosts) {
      try {
        console.log(`[Publish Scheduled LinkedIn] Publishing post ${post.id}...`)

        const accessToken = process.env.LINKEDIN_ACCESS_TOKEN

        if (!accessToken) {
          throw new Error('LinkedIn API não configurada - Token ausente')
        }

        // Determinar URN (pessoa ou organização)
        let authorUrn: string
        
        if (post.as_organization) {
          const organizationUrn = process.env.LINKEDIN_ORGANIZATION_URN
          if (!organizationUrn) {
            throw new Error('LINKEDIN_ORGANIZATION_URN não configurado')
          }
          authorUrn = organizationUrn
        } else {
          const personUrn = process.env.LINKEDIN_PERSON_URN
          if (!personUrn) {
            throw new Error('LINKEDIN_PERSON_URN não configurado')
          }
          authorUrn = personUrn
        }

        // Preparar payload do post
        const payload: any = {
          author: authorUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: post.text
              },
              shareMediaCategory: post.image_url ? 'IMAGE' : 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        }

        // Se tiver imagem, fazer upload primeiro
        if (post.image_url) {
          console.log('[Publish Scheduled LinkedIn] Uploading image...')
          
          // Registrar upload
          const registerResponse = await fetch(
            'https://api.linkedin.com/v2/assets?action=registerUpload',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
              },
              body: JSON.stringify({
                registerUploadRequest: {
                  recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                  owner: authorUrn,
                  serviceRelationships: [{
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent'
                  }]
                }
              })
            }
          )

          if (!registerResponse.ok) {
            const error = await registerResponse.json()
            throw new Error(`Erro ao registrar upload: ${JSON.stringify(error)}`)
          }

          const registerData = await registerResponse.json()
          const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
          const asset = registerData.value.asset

          // Baixar imagem do Supabase/DALL-E
          const imageResponse = await fetch(post.image_url)
          const imageBuffer = await imageResponse.arrayBuffer()

          // Upload da imagem
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/octet-stream'
            },
            body: imageBuffer
          })

          if (!uploadResponse.ok) {
            throw new Error('Erro ao fazer upload da imagem')
          }

          // Adicionar imagem ao payload
          payload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
            status: 'READY',
            description: {
              text: 'Post Image'
            },
            media: asset,
            title: {
              text: 'Post Image'
            }
          }]
        }

        // Publicar no LinkedIn
        const publishResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify(payload)
        })

        if (!publishResponse.ok) {
          const errorText = await publishResponse.text()
          throw new Error(`LinkedIn API error: ${errorText}`)
        }

        const publishData = await publishResponse.json()
        const linkedInPostId = publishData.id

        // Marcar como publicado
        await linkedInDB.markAsPublished(post.id, linkedInPostId)

        console.log(`[Publish Scheduled LinkedIn] ✅ Post ${post.id} published: ${linkedInPostId}`)
        results.published++

      } catch (error) {
        console.error(`[Publish Scheduled LinkedIn] ❌ Error publishing post ${post.id}:`, error)
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        
        // Marcar como falho
        await linkedInDB.markAsFailed(post.id, errorMessage)
        
        results.failed++
        results.errors.push({
          postId: post.id,
          error: errorMessage
        })
      }
    }

    console.log(`[Publish Scheduled LinkedIn] Finished: ${results.published} published, ${results.failed} failed`)

    // Log resultado final
    if (results.failed === 0 && results.total > 0) {
      await linkedinPublishLog.success({ instagram_posts: results.published })
    } else if (results.failed > 0) {
      await linkedinPublishLog.fail(
        `${results.failed} posts failed out of ${results.total}`,
        { published: results.published, errors: results.errors }
      )
    } else {
      await linkedinPublishLog.success({ instagram_posts: 0, message: 'No posts to publish' })
    }

    return NextResponse.json({
      success: true,
      message: `Published ${results.published}/${results.total} LinkedIn posts`,
      ...results
    })

  } catch (error) {
    console.error('[Publish Scheduled LinkedIn] Error:', error)
    await linkedinPublishLog.fail(error as Error)
    
    return NextResponse.json(
      {
        error: 'Erro ao publicar posts agendados',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
