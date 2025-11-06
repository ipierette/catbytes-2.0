/**
 * 📧 EMAIL: Novo Post - Design harmonizado com logo CatBytes
 * Cores: Cinza escuro (#1F2937) + Ciano vibrante (#06B6D4)
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
  
  const c = { primary: '#06B6D4', dark: '#1F2937', darkHover: '#374151', text: '#111827', textLight: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }
  
  const t = {
    greeting: isPortuguese ? `Olá, ${name}!` : `Hello, ${name}!`,
    newPost: isPortuguese ? '🚀 Novo Artigo Publicado!' : '🚀 New Article Published!',
    intro: isPortuguese ? 'Acabamos de publicar um novo artigo que acho que você vai adorar:' : 'I just published a new article that I think you will love:',
    readMore: isPortuguese ? 'Ler Artigo Completo →' : 'Read Full Article →',
    viewBlog: isPortuguese ? 'Ver Todos os Artigos' : 'View All Articles',
    moreArticles: isPortuguese ? 'Quer ver mais artigos?' : 'Want to see more articles?',
    signature: isPortuguese ? 'Izadora Cury Pierette - Criadora da CatBytes' : 'Izadora Cury Pierette - CatBytes Founder',
    unsubscribe: isPortuguese ? 'Cancelar inscrição' : 'Unsubscribe',
    footer: isPortuguese ? 'Você está recebendo este email porque se inscreveu na newsletter.' : 'You are receiving this email because you subscribed to the newsletter.',
    copyright: '© 2025 CatBytes'
  }

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}@media only screen and (max-width:600px){.email-container{width:100%!important;}.mobile-padding{padding:20px!important;}.mobile-full-width{width:100%!important;}.mobile-font-title{font-size:22px!important;}}
  </style>
</head>
<body style="margin:0;padding:0;background-color:${c.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${title}</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${c.bg};">
    <tr><td align="center" style="padding:40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <tr><td align="center" style="background:linear-gradient(135deg,${c.dark} 0%,${c.darkHover} 100%);padding:40px 30px;border-radius:16px 16px 0 0;">
              <img src="https://catbytes.site/images/catbytes-logo.png" alt="CatBytes" width="240" height="160" style="display:block;width:240px;height:auto;max-width:100%;margin:0 auto 15px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;text-align:center;">${t.newPost}</h1>
            </td></tr>
          <tr><td style="padding:40px 30px;" class="mobile-padding">
              <p style="margin:0 0 20px 0;font-size:18px;line-height:1.6;color:${c.text};font-weight:600;">${t.greeting}</p>
              <p style="margin:0 0 30px 0;font-size:16px;line-height:1.7;color:${c.textLight};">${t.intro}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border:2px solid ${c.border};border-radius:12px;overflow:hidden;margin-bottom:30px;">
                ${coverImageUrl ? `<tr><td style="padding:0;"><img src="${coverImageUrl}" alt="${title}" width="540" style="display:block;width:100%;height:auto;max-width:100%;"></td></tr>` : ''}
                <tr><td style="padding:25px;">
                    <h2 style="margin:0 0 15px 0;font-size:24px;font-weight:700;line-height:1.3;color:${c.text};" class="mobile-font-title">${title}</h2>
                    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.7;color:${c.textLight};">${excerpt}</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr><td style="border-radius:8px;background:linear-gradient(135deg,${c.primary} 0%,${c.primary}dd 100%);">
                          <a href="${postUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;box-shadow:0 4px 12px ${c.primary}40;">${t.readMore}</a>
                        </td></tr>
                    </table>
                  </td></tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:1px solid ${c.border};padding-top:25px;">
                <tr><td align="center">
                    <p style="margin:0 0 15px 0;font-size:14px;color:${c.textLight};">${t.moreArticles}</p>
                    <a href="${baseUrl}/${locale}/blog" target="_blank" style="display:inline-block;padding:10px 24px;font-size:14px;color:${c.primary};text-decoration:none;border:2px solid ${c.primary};border-radius:6px;font-weight:600;">${t.viewBlog}</a>
                  </td></tr>
              </table>
              <p style="margin:30px 0 0;font-size:16px;line-height:1.6;color:${c.textLight};text-align:center;"><strong style="color:${c.text};">${t.signature}</strong></p>
            </td></tr>
          <tr><td style="background-color:${c.bg};padding:30px;text-align:center;border-top:1px solid ${c.border};border-radius:0 0 16px 16px;">
              <p style="margin:0 0 10px;font-size:12px;color:${c.textLight};">${t.footer}</p>
              <p style="margin:0 0 10px;font-size:12px;color:${c.textLight};">${t.copyright}</p>
              <p style="margin:0;font-size:11px;"><a href="${baseUrl}/${locale}/newsletter/unsubscribe" style="color:${c.primary};text-decoration:none;font-weight:600;">${t.unsubscribe}</a></p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
}
