/**
 * Instagram Publish Scheduled API
 * 
 * Publica posts aprovados que estão agendados para agora
 * Executado automaticamente: Segunda, Quarta, Sexta e Domingo às 10h
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { publishInstagramPost, verifyInstagramCredentials } from '@/lib/instagram-api'

export const maxDuration = 60

/**
 * POST: Publica posts aprovados e agendados
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação (cron apenas)
    const authHeader = request.headers.get('authorization')
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isCronJob) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('=== Scheduled Posts Publication Started ===')

    // Validações de ambiente
    if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.INSTAGRAM_ACCOUNT_ID) {
      throw new Error('Instagram credentials not configured')
    }

    // Verifica credenciais do Instagram
    const credentials = {
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      accountId: process.env.INSTAGRAM_ACCOUNT_ID
    }

    const isValid = await verifyInstagramCredentials(credentials)
    if (!isValid) {
      throw new Error('Invalid Instagram credentials')
    }

    // Busca posts prontos para publicar
    const postsToPublish = await instagramDB.getApprovedPostsReadyToPublish()
    console.log(`Found ${postsToPublish.length} posts ready to publish`)

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts ready to publish',
        published: 0
      })
    }

    const published: any[] = []
    const failed: any[] = []

    // Publica cada post
    for (const post of postsToPublish) {
      try {
        console.log(`\nPublishing post: ${post.titulo}`)
        console.log(`  Nicho: ${post.nicho}`)
        console.log(`  Scheduled for: ${post.scheduled_for}`)

        // Publica no Instagram
        const result = await publishInstagramPost(
          post.image_url,
          post.caption,
          credentials
        )

        // Atualiza status no banco
        await instagramDB.markAsPublished(post.id!, result.postId)

        published.push({
          id: post.id,
          titulo: post.titulo,
          nicho: post.nicho,
          instagramPostId: result.postId,
          permalink: result.permalink
        })

        console.log(`  ✓ Published successfully (Instagram ID: ${result.postId})`)

        // Aguarda entre publicações
        if (postsToPublish.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }

      } catch (error) {
        console.error(`  ✗ Failed to publish post ${post.id}:`, error)

        // Marca como falho no banco
        await instagramDB.markAsFailed(
          post.id!,
          error instanceof Error ? error.message : 'Unknown error'
        )

        failed.push({
          id: post.id,
          titulo: post.titulo,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`\n=== Publication Complete ===`)
    console.log(`Published: ${published.length}`)
    console.log(`Failed: ${failed.length}`)

    return NextResponse.json({
      success: true,
      published: published.length,
      failed: failed.length,
      posts: published,
      errors: failed.length > 0 ? failed : undefined
    })

  } catch (error) {
    console.error('=== Publication Failed ===')
    console.error('Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
