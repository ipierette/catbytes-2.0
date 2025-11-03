import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'
import crypto from 'crypto'

// =====================================================
// POST /api/newsletter/subscribe
// Subscribe to newsletter
// =====================================================

export const runtime = 'nodejs'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source = 'website' } = body

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
        await resend.emails.send({
          from: 'CatBytes <contato@catbytes.site>',
          to: [email],
          subject: '🐱 Bem-vindo à Newsletter CatBytes!',
          html: getWelcomeEmailHTML(name || 'Amigo', verificationToken),
        })
      } catch (emailError) {
        console.error('[Newsletter] Welcome email error:', emailError)
        // Don't fail the subscription if email fails
      }
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

// Welcome Email HTML Template
function getWelcomeEmailHTML(name: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  const verifyUrl = `${baseUrl}/newsletter/verify?token=${token}`

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Newsletter CatBytes</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8A2BE2 0%, #FF69B4 50%, #00BFFF 100%); padding: 40px 30px; text-align: center;">
              <img src="${baseUrl}/images/catbytes-logo.webp" alt="CatBytes" style="width: 120px; height: auto; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Bem-vindo à Newsletter CatBytes!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Olá <strong>${name}</strong>! 👋
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Que bom ter você por aqui! Estamos animados para compartilhar conteúdo exclusivo sobre
                <strong>tecnologia, IA, automação e desenvolvimento web</strong>.
              </p>

              <div style="background: linear-gradient(135deg, #fdf2f8 0%, #eff6ff 100%); border-left: 4px solid #8A2BE2; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #8A2BE2;">
                  🎁 O que você vai receber:
                </p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #4B5563;">
                  <li style="margin: 8px 0;">Artigos exclusivos sobre IA e automação</li>
                  <li style="margin: 8px 0;">Dicas práticas de desenvolvimento web</li>
                  <li style="margin: 8px 0;">Novidades e tendências tech</li>
                  <li style="margin: 8px 0;">Conteúdo enviado 3x por semana (terça, quinta, sábado)</li>
                </ul>
              </div>

              <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #92400E;">
                  <strong>📧 Importante:</strong> Para garantir que nossos emails não caiam no spam,
                  adicione <strong>contato@catbytes.site</strong> aos seus contatos!
                </p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ✓ Confirmar Inscrição
                </a>
              </div>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6B7280;">
                Até breve! 🐱<br>
                <strong>Equipe CatBytes</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #9CA3AF;">
                © 2025 CatBytes. Todos os direitos reservados.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                Você está recebendo este email porque se inscreveu em nosso site.<br>
                <a href="${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(name)}" style="color: #8A2BE2; text-decoration: none;">Cancelar inscrição</a>
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
