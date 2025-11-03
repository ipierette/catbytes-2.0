import { getWelcomeEmailHTML } from '@/lib/email-templates/welcome-email'
import { getNewPostEmailHTML } from '@/lib/email-templates/new-post-email'
import { NextRequest, NextResponse } from 'next/server'

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
    const coverImageUrl = `${baseUrl}/images/catbytes-logo.png` // Imagem de placeholder
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
