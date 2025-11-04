import { NextRequest, NextResponse } from 'next/server'
import { db, generateSlug, supabaseAdmin } from '@/lib/supabase'
import { translatePostToEnglish } from '@/lib/translation-service'
import type { BlogPostInsert } from '@/types/blog'

// =====================================================
// POST /api/blog/translate
// Translate a post to English (on-demand)
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    console.log('[Translate] Translating post:', postId)

    // Get original PT post
    const originalPost = await db.getPostById(postId)

    if (!originalPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if translation already exists
    if (supabaseAdmin) {
      const { data: existingTranslation } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('translated_from', postId)
        .eq('locale', 'en-US')
        .single()

      if (existingTranslation) {
        console.log('[Translate] Translation already exists:', existingTranslation.id)
        return NextResponse.json({
          success: true,
          message: 'Translation already exists',
          post: existingTranslation,
        })
      }
    }

    // Translate content
    console.log('[Translate] Translating content...')
    const translatedContent = await translatePostToEnglish({
      title: originalPost.title,
      content: originalPost.content,
      excerpt: originalPost.excerpt,
      category: originalPost.category,
    })

    // Create English post
    const enSlug = `${originalPost.slug}-en`

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
      generation_prompt: originalPost.generation_prompt,
      locale: 'en-US',
      translated_from: originalPost.id,
    }

    const translatedPost = await db.createPost(enPostData)
    console.log('[Translate] Translation created:', translatedPost.id)

    return NextResponse.json({
      success: true,
      post: translatedPost,
    })
  } catch (error) {
    console.error('[Translate] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to translate post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
