import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin, generateSlug } from '@/lib/supabase'
import { Resend } from 'resend'
import { getTranslationNotificationEmailHTML } from '@/lib/email-templates'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

// =====================================================
// POST /api/admin/blog/posts/[id]/translate
// Create translation of existing post and notify EN-US subscribers
// =====================================================

export const runtime = 'edge'

interface TranslatePostRequest {
  title: string
  content: string
  excerpt?: string
  targetLocale: 'en-US' | 'pt-BR'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { id } = await params
    const body: TranslatePostRequest = await request.json()
    const { title, content, excerpt, targetLocale } = body

    // Validate input
    if (!title || !content || !targetLocale) {
      return NextResponse.json(
        { error: 'Title, content, and targetLocale are required' },
        { status: 400 }
      )
    }

    // Get original post
    const { data: originalPost, error: originalError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (originalError || !originalPost) {
      return NextResponse.json(
        { error: 'Original post not found' },
        { status: 404 }
      )
    }

    // Generate new slug for translation
    const baseSlug = generateSlug(title)
    const localeSlug = targetLocale === 'en-US' ? `${baseSlug}-en` : baseSlug

    // Check if translation already exists
    const { data: existingTranslation } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', localeSlug)
      .eq('locale', targetLocale)
      .single()

    if (existingTranslation) {
      return NextResponse.json(
        { error: 'Translation already exists for this post' },
        { status: 409 }
      )
    }

    // Create translation
    const translatedPost = {
      title,
      slug: localeSlug,
      excerpt: excerpt || content.substring(0, 200),
      content,
      cover_image_url: originalPost.cover_image_url,
      highlight: originalPost.highlight,
      tags: originalPost.tags || [],
      category: originalPost.category,
      author: originalPost.author,
      locale: targetLocale,
      published: true,
      ai_model: 'manual_translation',
      generation_prompt: `Manual translation from ${originalPost.locale} to ${targetLocale}`,
      seo_title: title,
      seo_description: excerpt || content.substring(0, 160),
      keywords: originalPost.keywords || [],
      translated_from: originalPost.id, // Link to original
    }

    console.log('[Translation] Creating translated post:', JSON.stringify(translatedPost, null, 2))

    // Insert translated post
    const { data: newPost, error: insertError } = await supabaseAdmin
      .from('blog_posts')
      .insert(translatedPost)
      .select()
      .single()

    if (insertError) {
      console.error('[Translation] Error creating translation:', insertError)
      return NextResponse.json(
        { error: 'Failed to create translation', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('[Translation] Translation created successfully:', newPost.id)

    // ====== NOTIFICAR ASSINANTES DO IDIOMA ALVO ======
    if (resend && newPost.published) {
      try {
        console.log('[Translation] Fetching subscribers for:', targetLocale)
        
        const { data: subscribers, error: subError } = await supabaseAdmin
          .from('newsletter_subscribers')
          .select('email, name, locale')
          .eq('verified', true)
          .eq('subscribed', true)
          .eq('locale', targetLocale)

        if (subError) {
          console.error('[Translation] Error fetching subscribers:', subError)
        } else if (subscribers && subscribers.length > 0) {
          console.log(`[Translation] ✅ Sending translation notification to ${subscribers.length} ${targetLocale} subscribers...`)
          
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
          const postUrl = `${baseUrl}/${targetLocale}/blog/${newPost.slug}`
          const originalUrl = `${baseUrl}/${originalPost.locale}/blog/${originalPost.slug}`
          
          // Send emails in batches
          const batchSize = 50
          for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize)
            
            const emailPromises = batch.map(subscriber => {
              const isEnglish = targetLocale === 'en-US'
              
              return resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'CatBytes <contato@catbytes.site>',
                to: subscriber.email,
                subject: isEnglish 
                  ? `📝 New Translation Available: ${newPost.title}`
                  : `📝 Nova Tradução Disponível: ${newPost.title}`,
                html: getTranslationNotificationEmailHTML(
                  subscriber.name || (isEnglish ? 'Friend' : 'Amigo'),
                  newPost.title,
                  originalPost.title,
                  newPost.excerpt,
                  newPost.cover_image_url,
                  postUrl,
                  originalUrl,
                  targetLocale,
                  baseUrl
                ),
              })
            })
            
            await Promise.allSettled(emailPromises)
            console.log(`[Translation] ✅ Sent batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(subscribers.length / batchSize)}`)
          }
          
          console.log('[Translation] ✅✅✅ Translation notification emails sent successfully!')
        } else {
          console.log('[Translation] ⚠️ No verified subscribers for', targetLocale)
        }
      } catch (emailError) {
        console.error('[Translation] ❌ Error sending notification emails:', emailError)
        // Don't fail translation creation if email fails
      }
    } else {
      console.log('[Translation] ⚠️ Resend not configured or post not published')
    }

    return NextResponse.json({ 
      success: true, 
      post: newPost,
      originalPost: originalPost 
    })
  } catch (error) {
    console.error('[Translation] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}