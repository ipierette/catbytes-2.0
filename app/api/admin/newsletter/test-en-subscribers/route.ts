import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'

// =====================================================
// GET /api/admin/newsletter/test-en-subscribers
// Testa se há assinantes EN-US e envia email de teste
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
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

    console.log('[Test EN Subscribers] Checking EN-US newsletter subscribers...')

    // Buscar todos os assinantes para debug
    const { data: allSubscribers, error: allError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, locale, verified, subscribed, subscribed_at')
      .order('subscribed_at', { ascending: false })

    if (allError) {
      console.error('[Test EN Subscribers] Error fetching all subscribers:', allError)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    // Buscar assinantes EN-US específicos
    const { data: enSubscribers, error: enError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, locale, verified, subscribed, subscribed_at')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'en-US')

    if (enError) {
      console.error('[Test EN Subscribers] Error fetching EN-US subscribers:', enError)
    }

    // Análise dos dados
    const stats = {
      total: allSubscribers?.length || 0,
      byLocale: {
        'pt-BR': allSubscribers?.filter(s => s.locale === 'pt-BR' || !s.locale).length || 0,
        'en-US': allSubscribers?.filter(s => s.locale === 'en-US').length || 0,
        'other': allSubscribers?.filter(s => s.locale && s.locale !== 'pt-BR' && s.locale !== 'en-US').length || 0
      },
      byStatus: {
        verified: allSubscribers?.filter(s => s.verified).length || 0,
        unverified: allSubscribers?.filter(s => !s.verified).length || 0,
        subscribed: allSubscribers?.filter(s => s.subscribed).length || 0,
        unsubscribed: allSubscribers?.filter(s => !s.subscribed).length || 0
      },
      eligible: {
        ptBR: allSubscribers?.filter(s => s.verified && s.subscribed && (s.locale === 'pt-BR' || !s.locale)).length || 0,
        enUS: enSubscribers?.length || 0
      }
    }

    const recentSubscribers = allSubscribers?.slice(0, 10).map(s => ({
      email: s.email.replace(/(.{3}).*(@.*)/, '$1***$2'), // mask email for privacy
      locale: s.locale || 'pt-BR (default)',
      verified: s.verified,
      subscribed: s.subscribed,
      date: s.subscribed_at
    })) || []

    console.log('[Test EN Subscribers] Stats:', stats)

    return NextResponse.json({
      success: true,
      stats,
      recentSubscribers,
      enSubscribersReady: (enSubscribers?.length || 0) > 0,
      message: `Found ${stats.eligible.enUS} EN-US subscribers ready for newsletters`,
      recommendations: [
        stats.eligible.enUS === 0 ? 'No EN-US subscribers found. Check if users are subscribing with EN locale.' : null,
        stats.byStatus.unverified > 0 ? `${stats.byStatus.unverified} subscribers need email verification.` : null,
        stats.total === 0 ? 'No newsletter subscribers found at all.' : null
      ].filter(Boolean)
    })

  } catch (error: any) {
    console.error('[Test EN Subscribers] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check EN-US subscribers' },
      { status: 500 }
    )
  }
}

// =====================================================
// POST /api/admin/newsletter/test-en-subscribers
// Envia email de teste para assinantes EN-US
// =====================================================

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

    console.log('[Test EN Email] Sending test translation notification...')

    // Buscar assinantes EN-US
    const { data: enSubscribers, error: fetchError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'en-US')
      .limit(5) // Limitar para teste

    if (fetchError) {
      console.error('[Test EN Email] Error fetching subscribers:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch EN-US subscribers' },
        { status: 500 }
      )
    }

    if (!enSubscribers || enSubscribers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No EN-US subscribers found to test with',
        action: 'Subscribe with an EN-US locale first or check subscriber data'
      })
    }

    // Configurar Resend
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      )
    }

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Importar template de email
    const { getTranslationNotificationEmailHTML } = await import('@/lib/email-templates/translation-notification-email')

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
    
    // Dados de teste
    const testData = {
      translatedTitle: 'Test: How to Build Amazing Web Applications',
      originalTitle: 'Teste: Como Construir Aplicações Web Incríveis',
      excerpt: 'This is a test translation notification to verify that our EN-US newsletter system is working correctly. Learn about modern web development techniques and best practices.',
      coverImageUrl: `${baseUrl}/images/test-newsletter.jpg`,
      postUrl: `${baseUrl}/en-US/blog/test-translation-en`,
      originalUrl: `${baseUrl}/blog/test-translation`
    }

    const htmlContent = getTranslationNotificationEmailHTML(
      'Dear Reader',
      testData.translatedTitle,
      testData.originalTitle,
      testData.excerpt,
      testData.coverImageUrl,
      testData.postUrl,
      testData.originalUrl,
      'en-US',
      baseUrl
    )

    try {
      // Enviar email de teste
      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'newsletter@catbytes.com',
        to: enSubscribers.map(sub => sub.email),
        subject: `🧪 TEST: Translation Available - ${testData.translatedTitle}`,
        html: htmlContent,
      })

      console.log('[Test EN Email] Email sent:', emailResult)

      return NextResponse.json({
        success: true,
        message: `Test email sent to ${enSubscribers.length} EN-US subscribers`,
        recipients: enSubscribers.length,
        emailId: emailResult.data?.id,
        testData
      })

    } catch (emailError) {
      console.error('[Test EN Email] Email sending error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send test email', details: emailError },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[Test EN Email] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    )
  }
}