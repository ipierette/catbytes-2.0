/**
 * Endpoint de teste para publicação de divulgação social
 * Testa a criação e publicação de posts no Instagram e LinkedIn
 */

import { NextRequest, NextResponse } from 'next/server'
import { promoteArticle } from '@/lib/blog-social-promoter'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Verificação de segurança
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      )
    }

    console.log('[Test Social Promotion] Testing social promotion for post:', postId)

    // Buscar dados do post no Supabase
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      console.error('[Test Social Promotion] Post not found:', postError)
      return NextResponse.json(
        { error: 'Post not found', details: postError },
        { status: 404 }
      )
    }

    console.log('[Test Social Promotion] Post found:', {
      id: post.id,
      title: post.title,
      slug: post.slug,
      cover_image_url: post.cover_image_url,
      category: post.category
    })

    // Testar promoteArticle
    console.log('[Test Social Promotion] Calling promoteArticle...')
    
    const promotionResults = await promoteArticle(
      {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        slug: post.slug,
        cover_image_url: post.cover_image_url,
        category: post.category,
        tags: post.tags || []
      },
      ['instagram', 'linkedin']
    )

    console.log('[Test Social Promotion] Promotion results:', JSON.stringify(promotionResults, null, 2))

    // Estruturar resposta detalhada
    const response = {
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        cover_image_url: post.cover_image_url
      },
      promotionResults: {
        instagram: {
          attempted: true,
          success: promotionResults.instagram?.success || false,
          postId: promotionResults.instagram?.postId || null,
          error: promotionResults.instagram?.error || null
        },
        linkedin: {
          attempted: true,
          success: promotionResults.linkedin?.success || false,
          postId: promotionResults.linkedin?.postId || null,
          error: promotionResults.linkedin?.error || null
        }
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Test Social Promotion] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
