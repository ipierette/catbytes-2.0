import { getWelcomeEmailHTML } from '@/lib/email-templates/welcome-email'
import { getNewPostEmailHTML } from '@/lib/email-templates/new-post-email'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Preview de templates de email
 * 
 * Acesse no navegador:
 * - /api/email-preview?template=welcome&locale=pt-BR
 * - /api/email-preview?template=welcome&locale=en-US
 * - /api/email-preview?template=new-post&locale=pt-BR
 * - /api/email-preview?template=new-post&locale=en-US
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const template = searchParams.get('template') || 'welcome'
  const locale = searchParams.get('locale') || 'pt-BR'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'

  let html = ''

  if (template === 'welcome') {
    // Preview do email de boas-vindas
    const name = 'Preview Teste'
    const token = 'preview-token-123456'
    html = getWelcomeEmailHTML(name, token, locale)
  } else if (template === 'new-post') {
    // Preview do email de novo post
    const name = 'Preview Teste'
    const title = 'Exemplo de Post: Como a IA está Transformando o Desenvolvimento Web'
    const excerpt = 'Descubra as principais tendências de IA que estão revolucionando a forma como criamos aplicações web modernas e como você pode aproveitar essas tecnologias no seu próximo projeto.'
    const coverImageUrl = `${baseUrl}/images/catbytes-logo.webp` // Imagem de placeholder
    const postUrl = `${baseUrl}/${locale}/blog`
    
    html = getNewPostEmailHTML(name, title, excerpt, coverImageUrl, postUrl, locale, baseUrl)
  } else {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Email Preview</title></head>
        <body style="font-family: sans-serif; padding: 40px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
            <h1>📧 Preview de Emails CatBytes</h1>
            <p>Selecione um template para visualizar:</p>
            <ul>
              <li><a href="/api/email-preview?template=welcome&locale=pt-BR">🎉 Boas-vindas (PT-BR)</a></li>
              <li><a href="/api/email-preview?template=welcome&locale=en-US">🎉 Welcome (EN-US)</a></li>
              <li><a href="/api/email-preview?template=new-post&locale=pt-BR">🚀 Novo Post (PT-BR)</a></li>
              <li><a href="/api/email-preview?template=new-post&locale=en-US">🚀 New Post (EN-US)</a></li>
            </ul>
          </div>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, locale = 'pt-BR' } = body
    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_EMAIL não configurado no .env.local' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
    let html = ''
    let subject = ''

    if (type === 'welcome') {
      html = getWelcomeEmailHTML('Izadora (TESTE)', 'test-token-123', locale)
      subject = locale === 'pt-BR' 
        ? '🎉 Bem-vindo à Newsletter CatBytes! [TESTE]'
        : '🎉 Welcome to CatBytes Newsletter! [TEST]'
    } else if (type === 'new-post') {
      html = getNewPostEmailHTML(
        'Izadora (TESTE)',
        locale === 'pt-BR' 
          ? 'Machine Learning: Entenda de Forma Simples e Prática'
          : 'Machine Learning: Simple and Practical Understanding',
        locale === 'pt-BR'
          ? 'Descubra como o Machine Learning funciona e como ele pode mudar sua vida. Vamos desmistificar essa tecnologia incrível!'
          : 'Discover how Machine Learning works and how it can change your life. Let\'s demystify this amazing technology!',
        `${baseUrl}/images/catbytes-logo.webp`,
        `${baseUrl}/${locale}/blog`,
        locale,
        baseUrl
      )
      subject = locale === 'pt-BR'
        ? '🚀 Novo Artigo Publicado! [TESTE]'
        : '🚀 New Article Published! [TEST]'
    } else {
      return NextResponse.json(
        { success: false, error: 'Tipo de email inválido. Use "welcome" ou "new-post"' },
        { status: 400 }
      )
    }

    // Enviar email de teste via Resend
    const { error } = await resend.emails.send({
      from: 'CatBytes Newsletter <contato@catbytes.site>',
      to: adminEmail,
      subject,
      html
    })

    if (error) {
      console.error('Error sending test email:', error)
      return NextResponse.json(
        { success: false, error: `Erro ao enviar email: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `✅ Email de teste enviado com sucesso para ${adminEmail}`
    })
  } catch (error) {
    console.error('Error in POST /api/email-preview:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
