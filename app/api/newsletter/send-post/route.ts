import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'

/**
 * POST /api/newsletter/send-post
 * Sends a new blog post to all verified newsletter subscribers
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (cron secret or admin token)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get blog post ID from request
    const { blogPostId } = await request.json()

    if (!blogPostId) {
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    // Fetch the blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', blogPostId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Fetch all verified and subscribed newsletter subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('verified', true)
      .eq('subscribed', true)

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        message: 'No verified subscribers to send to',
        sentCount: 0
      })
    }

    // Send emails to subscribers in batches to avoid rate limits
    const batchSize = 50
    let sentCount = 0
    let failedCount = 0

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      try {
        await Promise.all(
          batch.map(async (subscriber) => {
            try {
              await resend.emails.send({
                from: 'CatBytes <contato@catbytes.site>',
                to: [subscriber.email],
                subject: `🐱 Novo artigo: ${post.title}`,
                html: getPostEmailHTML(post, subscriber.name, subscriber.email),
              })
              sentCount++

              // Update subscriber stats
              await supabase
                .from('newsletter_subscribers')
                .update({
                  emails_sent_count: supabase.rpc('increment', { x: 1 })
                })
                .eq('email', subscriber.email)

            } catch (error) {
              console.error(`Failed to send to ${subscriber.email}:`, error)
              failedCount++
            }
          })
        )
      } catch (batchError) {
        console.error('Batch send error:', batchError)
        failedCount += batch.length
      }
    }

    // Create campaign record
    await supabase.from('newsletter_campaigns').insert({
      blog_post_id: blogPostId,
      subject: `🐱 Novo artigo: ${post.title}`,
      recipients_count: sentCount,
      opened_count: 0
    })

    return NextResponse.json({
      message: 'Newsletter sent successfully',
      sentCount,
      failedCount,
      totalSubscribers: subscribers.length
    })

  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generates the HTML email for a blog post
 */
function getPostEmailHTML(post: any, subscriberName: string | null, email: string): string {
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
  const readMoreUrl = `${baseUrl}/pt-BR/blog`

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${post.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

              <!-- Header with gradient -->
              <tr>
                <td align="center" style="padding: 40px 30px; background: linear-gradient(135deg, #8A2BE2 0%, #FF69B4 50%, #00BFFF 100%);">
                  <img src="${baseUrl}/images/logo-desenvolvedora.png" alt="CatBytes" style="width: 80px; height: auto; margin-bottom: 20px;" />
                  <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold;">
                    Novo Artigo no Blog! 🚀
                  </h1>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                    Olá${subscriberName ? ' ' + subscriberName : ''}! 👋
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                    Acabamos de publicar um novo artigo que pode te interessar:
                  </p>
                </td>
              </tr>

              <!-- Post preview with cover image -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="border: 2px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
                    <img src="${post.cover_image_url}" alt="${post.title}" style="width: 100%; height: auto; display: block;" />

                    <div style="padding: 20px;">
                      <!-- Category badge -->
                      <div style="margin-bottom: 12px;">
                        <span style="display: inline-block; padding: 4px 12px; background: linear-gradient(135deg, #8A2BE2, #FF69B4); color: white; font-size: 12px; font-weight: bold; border-radius: 20px;">
                          ${post.category}
                        </span>
                      </div>

                      <!-- Title -->
                      <h2 style="margin: 0 0 12px 0; font-size: 24px; color: #1F2937; line-height: 1.3;">
                        ${post.title}
                      </h2>

                      <!-- Excerpt -->
                      <p style="margin: 0 0 20px 0; font-size: 15px; color: #6B7280; line-height: 1.6;">
                        ${post.excerpt}
                      </p>

                      <!-- Tags -->
                      ${post.tags && post.tags.length > 0 ? `
                        <div style="margin-bottom: 20px;">
                          ${post.tags.map((tag: string) => `
                            <span style="display: inline-block; margin: 0 4px 4px 0; padding: 4px 10px; background-color: #F3F4F6; color: #6B7280; font-size: 12px; border-radius: 6px;">
                              ${tag}
                            </span>
                          `).join('')}
                        </div>
                      ` : ''}

                      <!-- Read more button -->
                      <a href="${readMoreUrl}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #8A2BE2, #00BFFF); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Ler artigo completo →
                      </a>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- Anti-spam reminder -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #92400E;">
                      <strong>📧 Importante:</strong> Para garantir que nossos emails não caiam no spam,
                      adicione <strong>contato@catbytes.site</strong> aos seus contatos!
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #6B7280; text-align: center;">
                    Você está recebendo este email porque se inscreveu na newsletter do CatBytes.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center;">
                    <a href="${unsubscribeUrl}" style="color: #6B7280; text-decoration: underline;">
                      Cancelar inscrição
                    </a>
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #9CA3AF; text-align: center;">
                    © 2025 CatBytes. Todos os direitos reservados.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
