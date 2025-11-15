/**
 * Instagram Direct Publish API
 * Publica diretamente no Instagram (para blog promoter)
 * Bypass do sistema de aprovação - usado apenas para divulgação de artigos
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação (aceita CRON_SECRET ou admin cookie)
    const authHeader = request.headers.get('authorization')
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isCronJob) {
      return NextResponse.json(
        { error: 'Unauthorized - Only cron jobs can use this endpoint' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { image_url, caption, auto_publish = true } = body

    if (!image_url || !caption) {
      return NextResponse.json(
        { error: 'Missing required fields: image_url, caption' },
        { status: 400 }
      )
    }

    console.log('[Instagram Publish] Publishing blog promotion post...')
    console.log('[Instagram Publish] Image URL:', image_url)
    console.log('[Instagram Publish] Caption length:', caption.length)

    // Salva no banco como aprovado e agenda para publicação
    const dbRecord = await instagramDB.savePost({
      nicho: 'blog-promotion',
      titulo: 'Divulgação de Artigo do Blog',
      texto_imagem: '',
      caption,
      image_url,
      status: auto_publish ? 'approved' : 'pending',
      scheduled_for: auto_publish ? new Date() : undefined
    })

    console.log('[Instagram Publish] Post saved to database:', dbRecord.id)

    // Se auto_publish está ativado, publica imediatamente
    if (auto_publish && process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID) {
      try {
        console.log('[Instagram Publish] Publishing to Instagram Graph API...')
        
        // Step 1: Create media container
        const containerResponse = await fetch(
          `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_USER_ID}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url,
              caption,
              access_token: process.env.INSTAGRAM_ACCESS_TOKEN
            })
          }
        )

        if (!containerResponse.ok) {
          const error = await containerResponse.json()
          throw new Error(`Failed to create media container: ${JSON.stringify(error)}`)
        }

        const { id: creationId } = await containerResponse.json()
        console.log('[Instagram Publish] Media container created:', creationId)

        // Step 2: Publish the media
        const publishResponse = await fetch(
          `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_USER_ID}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: creationId,
              access_token: process.env.INSTAGRAM_ACCESS_TOKEN
            })
          }
        )

        if (!publishResponse.ok) {
          const error = await publishResponse.json()
          throw new Error(`Failed to publish media: ${JSON.stringify(error)}`)
        }

        const { id: postId } = await publishResponse.json()
        console.log('[Instagram Publish] ✅ Published to Instagram:', postId)

        // Atualiza no banco com ID do Instagram
        await instagramDB.updatePost(dbRecord.id, {
          instagram_post_id: postId,
          status: 'published',
          published_at: new Date()
        })

        return NextResponse.json({
          success: true,
          id: dbRecord.id,
          instagram_post_id: postId,
          status: 'published'
        })

      } catch (publishError) {
        console.error('[Instagram Publish] Error publishing to Instagram:', publishError)
        
        // Mesmo com erro, mantém no banco como approved para retry manual
        return NextResponse.json({
          success: false,
          id: dbRecord.id,
          error: publishError instanceof Error ? publishError.message : 'Unknown publish error',
          status: 'approved_not_published',
          message: 'Post saved but Instagram API failed - retry manually'
        }, { status: 500 })
      }
    }

    // Sem auto_publish ou sem credenciais do Instagram
    return NextResponse.json({
      success: true,
      id: dbRecord.id,
      status: auto_publish ? 'approved' : 'pending',
      message: auto_publish 
        ? 'Post approved - waiting for manual publish (Instagram credentials not configured)'
        : 'Post created as pending - needs manual approval'
    })

  } catch (error) {
    console.error('[Instagram Publish] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
