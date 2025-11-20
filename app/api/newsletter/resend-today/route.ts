/**
 * Emergency endpoint to resend today's newsletter
 * Use when Resend fails to process emails during outages
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
  {
    auth: { persistSession: false }
  }
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

    console.log('[Resend-Today] 🔄 Starting emergency newsletter resend...')

    // Get today's post
    const today = new Date().toISOString().split('T')[0]
    
    const { data: post, error: postError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (postError || !post) {
      console.error('[Resend-Today] ❌ No post found for today:', postError)
      return NextResponse.json({ 
        error: 'No post found for today',
        date: today 
      }, { status: 404 })
    }

    console.log('[Resend-Today] ✅ Found post:', post.title)

    // Get verified subscribers (only pt-BR for Portuguese posts)
    const { data: subscribers, error: subsError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'pt-BR') // Only Portuguese subscribers

    if (subsError || !subscribers || subscribers.length === 0) {
      console.error('[Resend-Today] ❌ No verified subscribers:', subsError)
      return NextResponse.json({ 
        error: 'No verified subscribers found' 
      }, { status: 404 })
    }

    console.log(`[Resend-Today] 📧 Sending to ${subscribers.length} subscribers...`)

    // Send emails
    const emailPromises = subscribers.map((subscriber) => {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.catbytes.site'}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
      
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

      return resend.emails.send({
        from: 'CatBytes <newsletter@catbytes.site>',
        to: subscriber.email,
        subject: `📰 ${post.title}`,
        html: htmlContent
      })
    })

    const results = await Promise.allSettled(emailPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`[Resend-Today] ✅ Sent: ${successful} | ❌ Failed: ${failed}`)

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[Resend-Today] Failed for ${subscribers[index].email}:`, result.reason)
      }
    })

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug
      },
      emailStats: {
        total: subscribers.length,
        successful,
        failed
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[Resend-Today] ❌ Fatal error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
