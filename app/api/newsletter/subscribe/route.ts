import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import crypto from 'crypto'
import { getWelcomeEmailHTML } from '@/lib/email-templates'

// =====================================================
// POST /api/newsletter/subscribe
// Subscribe to newsletter
// =====================================================

export const runtime = 'nodejs'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source = 'website', locale = 'pt-BR' } = body

    // Validate email
    if (!email || !email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Check if already subscribed
    const { data: existing } = await supabaseAdmin!
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (existing && existing.subscribed) {
      return NextResponse.json({
        success: true,
        message: 'Este email já está inscrito na newsletter!',
        alreadySubscribed: true,
      })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Get metadata
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    // Insert or update subscriber
    const { data: subscriber, error } = await supabaseAdmin!
      .from('newsletter_subscribers')
      .upsert(
        {
          email: email.toLowerCase(),
          name: name || null,
          subscribed: true,
          source,
          locale,
          verification_token: verificationToken,
          verified: false,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (error) {
      console.error('[Newsletter] Subscription error:', error)
      return NextResponse.json({ error: 'Erro ao processar inscrição' }, { status: 500 })
    }

    // Send welcome email with Resend
    if (resend) {
      try {
        console.log('[Newsletter] Sending welcome email to:', email)
        const emailResponse = await resend.emails.send({
          from: 'CatBytes <contato@catbytes.site>',
          to: [email],
          subject: '🐱 Bem-vindo à Newsletter CatBytes!',
          html: getWelcomeEmailHTML(name || 'Amigo', verificationToken, locale),
        })
        console.log('[Newsletter] Email sent successfully:', emailResponse)
      } catch (emailError) {
        console.error('[Newsletter] Welcome email error:', emailError)
        // Don't fail the subscription if email fails
      }
    } else {
      console.warn('[Newsletter] Resend client not initialized - RESEND_API_KEY missing')
    }

    return NextResponse.json({
      success: true,
      message: 'Inscrição realizada com sucesso! Verifique seu email.',
      subscriber: { email: subscriber.email, name: subscriber.name },
    })
  } catch (error) {
    console.error('[Newsletter] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar inscrição', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
