import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'
import { translatePostToEnglish } from '@/lib/translation-service'
import type { BlogPostInsert } from '@/types/blog'

// =====================================================
// POST /api/admin/blog/bulk-translate
// Traduz múltiplos posts para inglês e envia newsletters
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutos para tradução em lote

interface BulkTranslateRequest {
  postIds: string[]
  autoSendNewsletter?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    const { postIds, autoSendNewsletter = true } = await request.json() as BulkTranslateRequest

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Post IDs array is required' },
        { status: 400 }
      )
    }

    console.log(`[Bulk Translate] Starting bulk translation for ${postIds.length} posts`)

    const results = []
    let successCount = 0
    let errorCount = 0
    let newsletterCount = 0

    for (const postId of postIds) {
      try {
        console.log(`[Bulk Translate] Processing post ${postId}...`)

        // Buscar post original
        const { data: originalPost, error: fetchError } = await supabaseAdmin
          .from('blog_posts')
          .select('*')
          .eq('id', postId)
          .eq('locale', 'pt-BR')
          .single()

        if (fetchError || !originalPost) {
          console.error(`[Bulk Translate] Post ${postId} not found:`, fetchError)
          results.push({
            postId,
            success: false,
            error: 'Post not found',
            originalTitle: 'Unknown'
          })
          errorCount++
          continue
        }

        // Verificar se já existe tradução
        const { data: existingTranslation } = await supabaseAdmin
          .from('blog_posts')
          .select('id, title')
          .eq('translated_from', postId)
          .eq('locale', 'en-US')
          .single()

        if (existingTranslation) {
          console.log(`[Bulk Translate] Translation already exists for ${originalPost.title}`)
          results.push({
            postId,
            success: true,
            skipped: true,
            originalTitle: originalPost.title,
            translatedTitle: existingTranslation.title,
            message: 'Translation already exists'
          })
          successCount++
          continue
        }

        // Traduzir conteúdo
        console.log(`[Bulk Translate] Translating "${originalPost.title}"...`)
        const translatedContent = await translatePostToEnglish({
          title: originalPost.title,
          content: originalPost.content,
          excerpt: originalPost.excerpt,
          category: originalPost.category,
        })

        // Criar post em inglês
        const enSlug = `${originalPost.slug}-en`
        const enPostData: BlogPostInsert = {
          title: translatedContent.title,
          slug: enSlug,
          excerpt: translatedContent.excerpt,
          content: translatedContent.content,
          cover_image_url: originalPost.cover_image_url,
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

        const { data: translatedPost, error: createError } = await supabaseAdmin
          .from('blog_posts')
          .insert(enPostData)
          .select()
          .single()

        if (createError || !translatedPost) {
          console.error(`[Bulk Translate] Error creating translation:`, createError)
          results.push({
            postId,
            success: false,
            error: 'Failed to create translation',
            originalTitle: originalPost.title
          })
          errorCount++
          continue
        }

        console.log(`[Bulk Translate] ✅ Translation created: ${translatedPost.title}`)

        // Enviar newsletter para assinantes EN-US
        let newsletterSent = false
        if (autoSendNewsletter) {
          try {
            console.log(`[Bulk Translate] Sending newsletter for "${translatedPost.title}"...`)

            // Buscar assinantes EN-US
            const { data: subscribers, error: subError } = await supabaseAdmin
              .from('newsletter_subscribers')
              .select('email')
              .eq('verified', true)
              .eq('subscribed', true)
              .eq('locale', 'en-US')

            if (subError) {
              console.error('[Bulk Translate] Error fetching subscribers:', subError)
            } else if (subscribers && subscribers.length > 0) {
              const { Resend } = await import('resend')
              const resend = new Resend(process.env.RESEND_API_KEY)

              if (process.env.RESEND_API_KEY) {
                const { getTranslationNotificationEmailHTML } = await import('@/lib/email-templates/translation-notification-email')

                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
                const htmlContent = getTranslationNotificationEmailHTML(
                  'Dear Reader',
                  translatedPost.title,
                  originalPost.title,
                  translatedPost.excerpt,
                  translatedPost.cover_image_url,
                  `${baseUrl}/en-US/blog/${translatedPost.slug}`,
                  `${baseUrl}/blog/${originalPost.slug}`,
                  'en-US',
                  baseUrl
                )

                // Enviar em lotes
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

                newsletterSent = true
                newsletterCount++
                console.log(`[Bulk Translate] ✅ Newsletter sent to ${subscribers.length} EN-US subscribers`)
              }
            }
          } catch (newsletterError) {
            console.error(`[Bulk Translate] Newsletter error for ${translatedPost.title}:`, newsletterError)
          }
        }

        results.push({
          postId,
          success: true,
          originalTitle: originalPost.title,
          translatedTitle: translatedPost.title,
          translatedSlug: translatedPost.slug,
          newsletterSent,
          subscribersNotified: newsletterSent ? 'EN-US subscribers' : 'none'
        })

        successCount++
        console.log(`[Bulk Translate] ✅ Completed ${postId} - ${successCount}/${postIds.length}`)

      } catch (postError: any) {
        console.error(`[Bulk Translate] Error processing ${postId}:`, postError)
        results.push({
          postId,
          success: false,
          error: postError.message || 'Unknown error',
          originalTitle: 'Error fetching'
        })
        errorCount++
      }
    }

    const summary = {
      totalRequested: postIds.length,
      successful: successCount,
      failed: errorCount,
      newslettersSent: newsletterCount,
      completionRate: Math.round((successCount / postIds.length) * 100)
    }

    console.log(`[Bulk Translate] ✅ Bulk translation complete:`, summary)

    return NextResponse.json({
      success: true,
      summary,
      results,
      message: `Bulk translation completed: ${successCount}/${postIds.length} successful`
    })

  } catch (error: any) {
    console.error('[Bulk Translate] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk translation' },
      { status: 500 }
    )
  }
}