/**
 * Resend newsletter to specific emails that didn't receive it
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!resend) {
      return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { emails, postSlug } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ 
        error: 'emails array required' 
      }, { status: 400 })
    }

    console.log(`[Resend-Specific] Resending to ${emails.length} emails...`)

    // Get post
    let post
    if (postSlug) {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .single()
      
      if (error || !data) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      post = data
    } else {
      // Get today's post
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'No post found for today' }, { status: 404 })
      }
      post = data
    }

    console.log(`[Resend-Specific] Sending post: ${post.title}`)

    // Get subscriber info for each email
    const { data: subscribers } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, name, verified, subscribed')
      .in('email', emails)

    console.log(`[Resend-Specific] Found ${subscribers?.length || 0} subscribers in DB`)

    const results = []

    for (const email of emails) {
      const subscriber = subscribers?.find(s => s.email === email)
      
      if (!subscriber) {
        console.warn(`[Resend-Specific] Email ${email} não encontrado no banco`)
        results.push({ email, status: 'not_found', sent: false })
        continue
      }

      if (!subscriber.verified) {
        console.warn(`[Resend-Specific] Email ${email} não verificado`)
        results.push({ email, status: 'not_verified', sent: false })
        continue
      }

      if (!subscriber.subscribed) {
        console.warn(`[Resend-Specific] Email ${email} não inscrito`)
        results.push({ email, status: 'unsubscribed', sent: false })
        continue
      }

      // Send email
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.catbytes.site'}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="text-align: center; padding: 32px 0;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        🐱 CatBytes
      </h1>
      <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">Seu resumo diário de tecnologia</p>
    </div>

    <!-- Main Content Card -->
    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      ${post.cover_image_url ? `
        <img src="${post.cover_image_url}" alt="${post.title}" style="width: 100%; height: auto; display: block;" />
      ` : ''}
      
      <div style="padding: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827; line-height: 1.3;">
          ${post.title}
        </h2>
        
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
          ${post.excerpt}
        </p>
        
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.catbytes.site'}/blog/${post.slug}" 
           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Ler artigo completo →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 0;">
      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
        Você está recebendo porque se inscreveu na newsletter CatBytes
      </p>
      <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 12px; text-decoration: underline;">
        Cancelar inscrição
      </a>
    </div>
  </div>
</body>
</html>`

      try {
        const result = await resend.emails.send({
          from: 'CatBytes <newsletter@catbytes.site>',
          to: email,
          subject: `📰 ${post.title}`,
          html: htmlContent
        })

        console.log(`[Resend-Specific] ✅ Enviado para ${email}`)
        results.push({ 
          email, 
          status: 'sent', 
          sent: true, 
          resendId: result.data?.id || 'unknown' 
        })

      } catch (error: any) {
        console.error(`[Resend-Specific] ❌ Erro ao enviar para ${email}:`, error)
        results.push({ email, status: 'error', sent: false, error: error.message })
      }
    }

    const successCount = results.filter(r => r.sent).length

    return NextResponse.json({
      success: true,
      post: {
        title: post.title,
        slug: post.slug
      },
      results,
      summary: {
        total: emails.length,
        sent: successCount,
        failed: emails.length - successCount
      }
    })

  } catch (error: any) {
    console.error('[Resend-Specific] ❌ Fatal error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
