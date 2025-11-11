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
      const { data: existingTranslations, error: checkError } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('translated_from', postId)
        .eq('locale', 'en-US')

      if (!checkError && existingTranslations && existingTranslations.length > 0) {
        const existingTranslation = existingTranslations[0]
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
      generation_prompt: originalPost.generation_prompt || undefined,
      locale: 'en-US',
      translated_from: originalPost.id,
    }

    const translatedPost = await db.createPost(enPostData)
    console.log('[Translate] Translation created:', translatedPost.id)

    // Send newsletter to EN-US subscribers
    if (supabaseAdmin) {
      try {
        console.log('[Translate] Sending newsletter to EN-US subscribers...')
        
        // Get EN-US subscribers
        const { data: subscribers } = await supabaseAdmin
          .from('newsletter_subscribers')
          .select('email')
          .eq('confirmed', true)
          .eq('locale', 'en-US')

        if (subscribers && subscribers.length > 0) {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)

          // Import email template
          const { getTranslationNotificationEmailHTML } = await import('@/lib/email-templates/translation-notification-email')

          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
          const htmlContent = getTranslationNotificationEmailHTML(
            'Dear Reader', // recipientName
            translatedPost.title, // translatedTitle
            originalPost.title, // originalTitle
            translatedPost.excerpt, // excerpt
            translatedPost.cover_image_url, // coverImageUrl
            `${baseUrl}/en-US/blog/${translatedPost.slug}`, // postUrl
            `${baseUrl}/blog/${originalPost.slug}`, // originalUrl
            'en-US', // locale
            baseUrl // baseUrl
          )

          // Send emails in batches of 50
          const batchSize = 50
          for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize)
            
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'newsletter@catbytes.com',
              to: batch.map(sub => sub.email),
              subject: `🌐 New Translation Available: ${translatedPost.title}`,
              html: htmlContent,
            })
          }

          console.log('[Translate] Newsletter sent to', subscribers.length, 'EN-US subscribers')
        }
      } catch (emailError) {
        console.error('[Translate] Error sending newsletter:', emailError)
        // Don't fail the translation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      post: translatedPost,
      message: 'Post translated successfully and newsletter sent to EN-US subscribers'
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
