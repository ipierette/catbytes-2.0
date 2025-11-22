import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import { getNewPostEmailHTML } from '@/lib/email-templates'
import { promoteArticle } from '@/lib/blog-social-promoter'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * CRON: Publish Scheduled Blog Posts
 * Runs every hour to check and publish scheduled posts
 * Should be configured in vercel.json as: "cron": "0 * * * *"
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Publish Scheduled] Starting cron job...')

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Buscar posts agendados que já passaram da hora
    const now = new Date().toISOString()
    const { data: scheduledPosts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('status', 'scheduled')
      .not('scheduled_at', 'is', null)
      .lte('scheduled_at', now)
      .is('deleted_at', null)

    if (error) {
      console.error('[Publish Scheduled] Error fetching posts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('[Publish Scheduled] No posts to publish')
      return NextResponse.json({ 
        success: true, 
        message: 'No scheduled posts to publish',
        published: 0
      })
    }

    console.log(`[Publish Scheduled] Found ${scheduledPosts.length} posts to publish`)

    const results = []

    for (const post of scheduledPosts) {
      try {
        console.log(`[Publish Scheduled] Publishing post: ${post.title}`)

        // Atualizar status do post
        const { error: updateError } = await supabaseAdmin
          .from('blog_posts')
          .update({ 
            published: true, 
            status: 'published',
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)

        if (updateError) {
          console.error(`[Publish Scheduled] Error updating post ${post.id}:`, updateError)
          results.push({ id: post.id, success: false, error: updateError.message })
          continue
        }

        // Enviar newsletter
        if (resend) {
          try {
            const { data: subscribers } = await supabaseAdmin
              .from('newsletter_subscribers')
              .select('email, name, locale')
              .eq('verified', true)
              .eq('subscribed', true)
              .eq('locale', post.locale || 'pt-BR')

            if (subscribers && subscribers.length > 0) {
              console.log(`[Publish Scheduled] Sending newsletter to ${subscribers.length} subscribers`)
              
              const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
              const batchSize = 50
              
              for (let i = 0; i < subscribers.length; i += batchSize) {
                const batch = subscribers.slice(i, i + batchSize)
                
                const emailPromises = batch.map(subscriber => {
                  const locale = subscriber.locale || post.locale
                  const isEnglish = locale === 'en-US'
                  const postUrl = `${baseUrl}/${locale}/blog/${post.slug}`
                  
                  return resend.emails.send({
                    from: 'CatBytes <contato@catbytes.site>',
                    to: subscriber.email,
                    subject: isEnglish 
                      ? `🚀 New Article: ${post.title}`
                      : `🚀 Novo Artigo: ${post.title}`,
                    html: getNewPostEmailHTML(
                      subscriber.name || (isEnglish ? 'Friend' : 'Amigo'),
                      post.title,
                      post.excerpt,
                      post.cover_image_url,
                      postUrl,
                      locale,
                      baseUrl
                    ),
                  })
                })
                
                await Promise.allSettled(emailPromises)
              }
              
              console.log('[Publish Scheduled] Newsletter sent')
            }
          } catch (emailError) {
            console.error('[Publish Scheduled] Newsletter error:', emailError)
          }
        }

        // Promover nas redes sociais
        if (post.cover_image_url) {
          try {
            console.log('[Publish Scheduled] Promoting on social media...')
            await promoteArticle(post)
            console.log('[Publish Scheduled] Social media promotion completed')
          } catch (socialError) {
            console.error('[Publish Scheduled] Social media error:', socialError)
          }
        }

        results.push({ id: post.id, title: post.title, success: true })
        console.log(`[Publish Scheduled] ✅ Published: ${post.title}`)

      } catch (postError) {
        console.error(`[Publish Scheduled] Error processing post ${post.id}:`, postError)
        results.push({ 
          id: post.id, 
          success: false, 
          error: postError instanceof Error ? postError.message : 'Unknown error' 
        })
      }
    }

    const successCount = results.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      message: `Published ${successCount}/${scheduledPosts.length} scheduled posts`,
      published: successCount,
      results
    })

  } catch (error) {
    console.error('[Publish Scheduled] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
