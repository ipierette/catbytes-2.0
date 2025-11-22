import { NextRequest, NextResponse } from 'next/server'
import { db, generateSlug, supabaseAdmin } from '@/lib/supabase'
import { translatePostToEnglish } from '@/lib/translation-service'
import { verifyAdminCookie } from '@/lib/api-security'
import type { BlogPostInsert } from '@/types/blog'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for translation

/**
 * POST /api/admin/blog/translate
 * Traduz um post existente do português para inglês
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access using cookie (same as other admin endpoints)
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
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

    // ========================================
    // SEND NEWSLETTER TO EN-US SUBSCRIBERS
    // ========================================
    try {
      console.log('[Translate] 📧 Checking EN-US newsletter subscribers...')
      
      // Get EN-US subscribers
      const { data: subscribers, error: fetchError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id, email, name, verified, subscribed')
        .eq('verified', true)
        .eq('subscribed', true)
        .eq('locale', 'en-US')

      if (fetchError) {
        console.error('[Translate] ❌ Error fetching EN-US subscribers:', fetchError)
      } else {
        console.log('[Translate] 📊 Found EN-US subscribers:', subscribers?.length || 0)
        
        if (!subscribers || subscribers.length === 0) {
          console.log('[Translate] ⚠️ No EN-US subscribers - newsletter skipped')
        } else {
          console.log('[Translate] ✅ Sending newsletter to', subscribers.length, 'EN-US subscribers')
          
          // Configure Resend
          if (!process.env.RESEND_API_KEY) {
            console.error('[Translate] ❌ RESEND_API_KEY not configured')
            throw new Error('RESEND_API_KEY not configured')
          }

          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)

          // Import email template
          const { getNewPostEmailHTML } = await import('@/lib/email-templates')

          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
          const postUrl = `${baseUrl}/en-US/blog/${translatedPost.slug}`

          // Send emails individually to each subscriber
          let totalSent = 0
          const errors: string[] = []
          
          for (const subscriber of subscribers) {
            try {
              const htmlContent = getNewPostEmailHTML(
                subscriber.name || 'Reader',
                translatedPost.title,
                translatedPost.excerpt,
                translatedPost.cover_image_url,
                postUrl,
                'en-US',
                baseUrl
              )

              const emailResult = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'CatBytes <contato@catbytes.site>',
                to: subscriber.email,
                subject: `🐱 New Post: ${translatedPost.title}`,
                html: htmlContent,
              })
              
              console.log(`[Translate] ✅ Email sent to ${subscriber.email}:`, emailResult.data?.id)
              totalSent++
              
              // Update last_email_sent_at timestamp
              await supabaseAdmin
                .from('newsletter_subscribers')
                .update({ last_email_sent_at: new Date().toISOString() })
                .eq('id', subscriber.id)
              
            } catch (emailError) {
              console.error(`[Translate] ❌ Failed to send to ${subscriber.email}:`, emailError)
              errors.push(`${subscriber.email}: ${emailError}`)
            }
          }

          console.log(`[Translate] 📧 Newsletter complete: ${totalSent}/${subscribers.length} sent`)
          
          return NextResponse.json({
            success: true,
            message: `Post translated and newsletter sent to ${totalSent} EN-US subscribers`,
            translatedPost: {
              id: translatedPost.id,
              title: translatedPost.title,
              slug: translatedPost.slug,
              locale: translatedPost.locale,
            },
            newsletter: {
              sent: true,
              totalSubscribers: subscribers.length,
              successfullySent: totalSent,
              errors: errors.length > 0 ? errors : undefined
            }
          })
        }
      }
    } catch (emailError) {
      console.error('[Translate] ❌ Newsletter error:', emailError)
      // Don't fail translation if newsletter fails
    }

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
