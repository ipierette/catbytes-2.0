import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { jwtVerify } from 'jose'
import { getReplyEmailHTML } from '@/lib/email-templates/reply-template'

export const runtime = 'nodejs'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this')

/**
 * POST /api/admin/send-custom-email
 * Envia email personalizado para um destinatário
 */
export async function POST(request: NextRequest) {
  try {
    // Verificação de autenticação admin usando cookie JWT
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    try {
      await jwtVerify(token, JWT_SECRET)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Verificar se Resend está configurado
    if (!resend) {
      return NextResponse.json(
        { success: false, error: 'Email service not configured (RESEND_API_KEY missing)' },
        { status: 500 }
      )
    }

    // Pegar dados do body
    const body = await request.json()
    const { 
      recipientEmail, 
      recipientName, 
      subject, 
      message,
      locale = 'pt-BR'
    } = body

    // Validação
    if (!recipientEmail || !recipientName || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: recipientEmail, recipientName, subject, message' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.log('[Custom Email] Sending email to:', recipientEmail)
    console.log('[Custom Email] Subject:', subject)
    console.log('[Custom Email] Message length:', message.length)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'

    // Gerar HTML do email
    const emailHtml = getReplyEmailHTML(
      {
        recipientName,
        message,
        locale
      },
      baseUrl
    )

    // Enviar email
    const result = await resend.emails.send({
      from: 'CatBytes - Izadora Pierette <contato@catbytes.site>',
      to: recipientEmail,
      subject: subject,
      html: emailHtml,
    })

    console.log('[Custom Email] Email sent successfully!', result)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: result.data?.id,
      recipient: recipientEmail
    })

  } catch (error) {
    console.error('[Custom Email] Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
