import { NextRequest, NextResponse } from 'next/server'
import { db, generateSlug, supabaseAdmin } from '@/lib/supabase'
import { translatePostToEnglish } from '@/lib/translation-service'
import type { BlogPostInsert } from '@/types/blog'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for translation

/**
 * POST /api/admin/blog/translate
 * Traduz um post existente do português para inglês
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminKey = request.headers.get('x-admin-key')
    const isAdmin = adminKey === process.env.NEXT_PUBLIC_ADMIN_API_KEY
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Missing postId parameter' },
        { status: 400 }
      )
    }

    console.log('[Translate] Starting translation for post:', postId)

    // Fetch the original post using db helper
    const originalPost = await db.getPostById(postId)

    if (!originalPost) {
      console.error('[Translate] Post not found:', postId)
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if post is in Portuguese
    if (originalPost.locale !== 'pt-BR') {
      return NextResponse.json(
        { success: false, error: 'Only Portuguese posts can be translated' },
        { status: 400 }
      )
    }

    // Check if translation already exists
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { data: existingTranslations } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug')
      .eq('translated_from', postId)
      .eq('locale', 'en-US')

    if (existingTranslations && existingTranslations.length > 0) {
      const existing = existingTranslations[0]
      return NextResponse.json({
        success: true,
        message: 'Translation already exists',
        translatedPost: {
          id: existing.id,
          title: existing.title,
          slug: existing.slug,
          locale: 'en-US',
        },
      })
    }

    console.log('[Translate] Translating content for:', originalPost.title)

    // Translate the post content
    const translatedContent = await translatePostToEnglish({
      title: originalPost.title,
      content: originalPost.content,
      excerpt: originalPost.excerpt,
      category: originalPost.category,
    })

    // Create English slug
    const enSlug = `${originalPost.slug}-en`

    // Create the translated post in database
    const enPostData: BlogPostInsert = {
      title: translatedContent.title,
      slug: enSlug,
      excerpt: translatedContent.excerpt,
      content: translatedContent.content,
      cover_image_url: originalPost.cover_image_url, // Same image
      keywords: originalPost.keywords,
      seo_title: translatedContent.title,
      seo_description: translatedContent.excerpt,
      published: true,
      category: translatedContent.category,
      tags: originalPost.tags || [],
      author: originalPost.author,
      ai_model: originalPost.ai_model,
      generation_prompt: originalPost.generation_prompt || undefined,
      locale: 'en-US',
      translated_from: originalPost.id,
    }

    const translatedPost = await db.createPost(enPostData)

    if (!translatedPost) {
      console.error('[Translate] Failed to create translated post')
      return NextResponse.json(
        { success: false, error: 'Failed to create translation in database' },
        { status: 500 }
      )
    }

    console.log('[Translate] Translation successful:', translatedPost.id)

    return NextResponse.json({
      success: true,
      message: 'Post translated successfully',
      translatedPost: {
        id: translatedPost.id,
        title: translatedPost.title,
        slug: translatedPost.slug,
        locale: translatedPost.locale,
      },
    })
  } catch (error) {
    console.error('[Translate] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
