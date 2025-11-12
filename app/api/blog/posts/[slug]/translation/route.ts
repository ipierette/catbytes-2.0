import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// =====================================================
// GET /api/blog/posts/[slug]/translation?targetLocale=en-US
// Get translation of a blog post (if exists)
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const targetLocale = searchParams.get('targetLocale')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    if (!targetLocale) {
      return NextResponse.json({ error: 'targetLocale query param is required' }, { status: 400 })
    }

    // First, get the current post
    const { data: currentPost, error: currentError } = await supabase
      .from('blog_posts')
      .select('id, locale, translated_from')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (currentError || !currentPost) {
      return NextResponse.json({ error: 'Current post not found' }, { status: 404 })
    }

    // If already in target locale, return the same post
    if (currentPost.locale === targetLocale) {
      return NextResponse.json({
        exists: true,
        slug: slug,
        locale: targetLocale,
        isSame: true
      })
    }

    let translationSlug = null

    // Case 1: Current post is original (PT), looking for translation (EN)
    if (currentPost.locale === 'pt-BR' && targetLocale === 'en-US') {
      const { data: translation, error: translationError } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('translated_from', currentPost.id)
        .eq('locale', 'en-US')
        .eq('published', true)
        .single()

      if (!translationError && translation) {
        translationSlug = translation.slug
      }
    }
    
    // Case 2: Current post is translation (EN), looking for original (PT)
    else if (currentPost.locale === 'en-US' && targetLocale === 'pt-BR' && currentPost.translated_from) {
      const { data: original, error: originalError } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('id', currentPost.translated_from)
        .eq('locale', 'pt-BR')
        .eq('published', true)
        .single()

      if (!originalError && original) {
        translationSlug = original.slug
      }
    }
    
    // Case 3: Current post is translation (EN), looking for another translation
    else if (currentPost.translated_from && targetLocale !== currentPost.locale) {
      // First get the original post
      const { data: original, error: originalError } = await supabase
        .from('blog_posts')
        .select('id, slug, locale')
        .eq('id', currentPost.translated_from)
        .eq('published', true)
        .single()

      if (!originalError && original) {
        // If target locale matches original, return original
        if (original.locale === targetLocale) {
          translationSlug = original.slug
        } else {
          // Look for translation in target locale
          const { data: translation, error: translationError } = await supabase
            .from('blog_posts')
            .select('slug')
            .eq('translated_from', original.id)
            .eq('locale', targetLocale)
            .eq('published', true)
            .single()

          if (!translationError && translation) {
            translationSlug = translation.slug
          }
        }
      }
    }

    if (translationSlug) {
      return NextResponse.json({
        exists: true,
        slug: translationSlug,
        locale: targetLocale,
        isSame: false
      })
    } else {
      return NextResponse.json({
        exists: false,
        locale: targetLocale,
        message: `No translation available in ${targetLocale}`
      })
    }

  } catch (error) {
    console.error('[API] Error finding translation:', error)
    return NextResponse.json(
      {
        error: 'Failed to find translation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}