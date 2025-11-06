/**
 * 📧 TEMPLATE: Notificação de Novo Post no Blog
 * 
 * Enviado automaticamente quando um novo post é publicado
 * 
 * SUPORTA i18n: ✅ Sim (pt-BR e en-US)
 * 
 * Variáveis disponíveis:
 * - name: Nome do assinante
 * - title: Título do post
 * - excerpt: Resumo do post
 * - coverImageUrl: URL da imagem de capa
 * - postUrl: Link para o blog
 * - locale: Idioma (pt-BR ou en-US)
 * - baseUrl: URL base do site
 */

export function getNewPostEmailHTML(
  name: string,
  title: string,
  excerpt: string,
  coverImageUrl: string,
  postUrl: string,
  locale: string,
  baseUrl: string
): string {
  const isPortuguese = locale === 'pt-BR'
  
  // 🌍 Traduções
  const t = {
    greeting: isPortuguese ? `Olá, ${name}!` : `Hello, ${name}!`,
    newPost: isPortuguese ? '🚀 Novo Artigo Publicado!' : '🚀 New Article Published!',
    readMore: isPortuguese ? 'Ler Artigo Completo' : 'Read Full Article',
    viewBlog: isPortuguese ? 'Ver Todos os Artigos' : 'View All Articles',
    unsubscribe: isPortuguese ? 'Cancelar inscrição' : 'Unsubscribe',
    footer: isPortuguese 
      ? 'Você está recebendo este email porque se inscreveu na newsletter da CatBytes.'
      : 'You are receiving this email because you subscribed to the CatBytes newsletter.',
    copyright: isPortuguese ? '© 2025 CatBytes. Todos os direitos reservados.' : '© 2025 CatBytes. All rights reserved.'
  }

  return `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <img src="${baseUrl}/images/catbytes-logo.webp" alt="CatBytes" style="width: 200px; height: auto; margin-bottom: 10px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${t.newPost}</h1>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding: 30px 40px 20px;">
                    <p style="color: #333333; font-size: 18px; margin: 0; font-weight: 500;">${t.greeting}</p>
                  </td>
                </tr>

                <!-- Cover Image -->
                ${coverImageUrl ? `
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <img src="${coverImageUrl}" alt="${title}" style="width: 100%; height: auto; border-radius: 8px; display: block;">
                  </td>
                </tr>
                ` : ''}

                <!-- Post Title -->
                <tr>
                  <td style="padding: 0 40px 15px;">
                    <h2 style="color: #1a1a1a; margin: 0; font-size: 26px; font-weight: 700; line-height: 1.3;">${title}</h2>
                  </td>
                </tr>

                <!-- Post Excerpt -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">${excerpt}</p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${postUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">${t.readMore}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- View All Posts -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px;">
                    <a href="${postUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">${t.viewBlog} →</a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-top: 1px solid #667eea;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 15px;">
                          <img src="${baseUrl}/images/logo-desenvolvedora.webp" alt="Developer Logo" style="height: 80px; width: auto;">
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="color: #a0a0a0; font-size: 13px; margin: 0 0 10px; line-height: 1.5;">${t.footer}</p>
                          <p style="margin: 0; font-size: 12px; color: #808080;">${t.copyright}</p>
                          <p style="margin: 5px 0 0; font-size: 12px;">
                            <a href="${baseUrl}/${locale}/newsletter/unsubscribe" style="color: #667eea; text-decoration: underline;">${t.unsubscribe}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
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
