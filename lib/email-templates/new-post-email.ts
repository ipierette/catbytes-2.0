/**
 * 📧 TEMPLATE: Notificação de Novo Post no Blog
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
  
  const t = {
    greeting: isPortuguese ? `Olá, ${name}!` : `Hello, ${name}!`,
    newPost: isPortuguese ? '🚀 Novo Artigo Publicado!' : '🚀 New Article Published!',
    intro: isPortuguese ? 'Acabamos de publicar um novo artigo que achamos que você vai adorar:' : 'We just published a new article that we think you will love:',
    readMore: isPortuguese ? 'Ler Artigo Completo' : 'Read Full Article',
    viewBlog: isPortuguese ? 'Ver Todos os Artigos' : 'View All Articles',
    unsubscribe: isPortuguese ? 'Cancelar inscrição' : 'Unsubscribe',
    footer: isPortuguese 
      ? 'Você está recebendo este email porque se inscreveu na newsletter da CatBytes.'
      : 'You are receiving this email because you subscribed to the CatBytes newsletter.',
    copyright: isPortuguese ? '© 2025 CatBytes. Todos os direitos reservados.' : '© 2025 CatBytes. All rights reserved.'
  }

  return `<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-padding { padding: 20px !important; }
      .mobile-full-width { width: 100% !important; max-width: 100% !important; display: block !important; }
      .mobile-font-title { font-size: 22px !important; line-height: 1.3 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">${title}</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px;">
              <img src="https://catbytes.site/images/catbytes-logo.webp" alt="CatBytes" width="200" height="133" style="display: block; width: 200px; height: auto; max-width: 100%; margin: 0 auto 15px auto;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; line-height: 1.3; text-align: center;">${t.newPost}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; line-height: 1.6; color: #111827; font-weight: 600;">${t.greeting}</p>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.7; color: #374151;">${t.intro}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 2px solid #E5E7EB; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                ${coverImageUrl ? `<tr><td style="padding: 0;"><img src="${coverImageUrl}" alt="${title}" width="540" style="display: block; width: 100%; height: auto; max-width: 100%;"></td></tr>` : ''}
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; line-height: 1.3; color: #111827;">${title}</h2>
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #6B7280;">${excerpt}</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                          <a href="${postUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700;">${t.readMore}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #E5E7EB; padding-top: 25px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #6B7280;">${isPortuguese ? 'Quer ver mais artigos?' : 'Want to see more articles?'}</p>
                    <a href="${baseUrl}/${locale}/blog" target="_blank" style="display: inline-block; padding: 10px 24px; font-size: 14px; color: #667eea; text-decoration: none; border: 2px solid #667eea; border-radius: 6px; font-weight: 600;">${t.viewBlog}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #F9FAFB; padding: 30px; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #6B7280; text-align: center;">${t.footer}</p>
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #9CA3AF; text-align: center;">${t.copyright}</p>
              <p style="margin: 0; font-size: 11px; color: #9CA3AF; text-align: center;"><a href="${baseUrl}/${locale}/newsletter/unsubscribe" style="color: #667eea; text-decoration: underline;">${t.unsubscribe}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
