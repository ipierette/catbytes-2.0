/**
 * LinkedIn Direct Publish API
 * Publica diretamente no LinkedIn (para blog promoter)
 * Bypass do sistema de aprovação - usado apenas para divulgação de artigos
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação (aceita CRON_SECRET)
    const authHeader = request.headers.get('authorization')
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isCronJob) {
      return NextResponse.json(
        { error: 'Unauthorized - Only cron jobs can use this endpoint' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { text, image_url, publish_now = true, blog_category } = body

    if (!text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      )
    }

    console.log('[LinkedIn Publish] Publishing blog promotion post...')
    console.log('[LinkedIn Publish] Text length:', text.length)
    console.log('[LinkedIn Publish] Has image:', !!image_url)
    console.log('[LinkedIn Publish] Blog category:', blog_category)

    // Salva no banco para tracking
    let dbRecord = null
    if (!supabaseAdmin) {
      console.warn('[LinkedIn Publish] Supabase not configured - skipping database save')
    } else {
      const { data, error: dbError } = await supabaseAdmin
        .from('linkedin_posts')
        .insert({
          content: text,
          image_url: image_url || null,
          status: publish_now ? 'approved' : 'pending',
          scheduled_for: publish_now ? new Date().toISOString() : null,
          post_type: blog_category ? `blog-${blog_category}` : 'blog-promotion'
        })
        .select()
        .single()

      if (dbError) {
        console.error('[LinkedIn Publish] Database error:', dbError)
        // Continue mesmo com erro de DB (não é crítico)
      } else {
        dbRecord = data
        console.log('[LinkedIn Publish] Post saved to database:', dbRecord?.id)
      }
    }

    // Se publish_now está ativado, publica no LinkedIn
    if (publish_now && process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PERSON_URN) {
      try {
        console.log('[LinkedIn Publish] Publishing to LinkedIn API...')
        
        let postPayload: any = {
          owner: process.env.LINKEDIN_PERSON_URN,
          text: {
            text
          },
          distribution: {
            linkedInDistributionTarget: {}
          }
        }

        // Se tem imagem, adiciona ao payload (Share API v2 format)
        if (image_url) {
          postPayload.content = {
            contentEntities: [{
              entityLocation: image_url,
              thumbnails: [{
                resolvedUrl: image_url
              }]
            }],
            title: text.substring(0, 200)
          }
          console.log('[LinkedIn Publish] Adding image to share:', image_url)
        }

        // Publica o post usando REST API (v2/shares)
        const publishResponse = await fetch(
          'https://api.linkedin.com/v2/shares',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(postPayload)
          }
        )

        if (!publishResponse.ok) {
          const error = await publishResponse.json()
          throw new Error(`Failed to publish: ${JSON.stringify(error)}`)
        }

        const publishData = await publishResponse.json()
        const postId = publishData.id
        console.log('[LinkedIn Publish] ✅ Published to LinkedIn:', postId)

        // Atualiza no banco
        if (dbRecord && supabaseAdmin) {
          await supabaseAdmin
            .from('linkedin_posts')
            .update({
              linkedin_post_id: postId,
              status: 'published',
              published_at: new Date().toISOString()
            })
            .eq('id', dbRecord.id)
        }

        return NextResponse.json({
          success: true,
          id: dbRecord?.id,
          post_id: postId,
          status: 'published'
        })

      } catch (publishError) {
        console.error('[LinkedIn Publish] Error publishing to LinkedIn:', publishError)
        
        return NextResponse.json({
          success: false,
          id: dbRecord?.id,
          error: publishError instanceof Error ? publishError.message : 'Unknown publish error',
          status: 'approved_not_published',
          message: 'Post saved but LinkedIn API failed - retry manually'
        }, { status: 500 })
      }
    }

    // Sem publish_now ou sem credenciais do LinkedIn
    return NextResponse.json({
      success: true,
      id: dbRecord?.id,
      status: publish_now ? 'approved' : 'pending',
      message: publish_now 
        ? 'Post approved - waiting for manual publish (LinkedIn credentials not configured)'
        : 'Post created as pending - needs manual approval'
    })

  } catch (error) {
    console.error('[LinkedIn Publish] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
