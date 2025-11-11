/**
 * Template de email para notificação de tradução de artigo
 * Usado quando um post é traduzido e está disponível em outro idioma
 */

interface TranslationNotificationParams {
  recipientName: string
  translatedTitle: string
  originalTitle: string
  excerpt: string
  coverImageUrl: string
  postUrl: string
  originalUrl: string
  locale: string
  baseUrl: string
}

export function getTranslationNotificationEmailHTML(
  recipientName: string,
  translatedTitle: string,
  originalTitle: string,
  excerpt: string,
  coverImageUrl: string,
  postUrl: string,
  originalUrl: string,
  locale: string = 'pt-BR',
  baseUrl: string = 'https://catbytes.site'
): string {
  const isEnglish = locale === 'en-US'

  const c = { 
    primary: '#06B6D4', // ciano CatBytes
    dark: '#1F2937', 
    darkHover: '#374151', 
    text: '#111827', 
    textLight: '#6B7280', 
    bg: '#F9FAFB', 
    border: '#E5E7EB' 
  }

  const t = {
    subject: isEnglish 
      ? `📝 Translation Available: ${translatedTitle}`
      : `📝 Tradução Disponível: ${translatedTitle}`,
    greeting: isEnglish ? `Hello ${recipientName}!` : `Olá ${recipientName}!`,
    newTranslation: isEnglish 
      ? 'New Translation Available!' 
      : 'Nova Tradução Disponível!',
    translationText: isEnglish
      ? 'Great news! The article has been translated and is now available in your language:'
      : 'Ótimas notícias! O artigo foi traduzido e agora está disponível em seu idioma:',
    originalText: isEnglish
      ? 'This is a translation of our article:'
      : 'Esta é uma tradução do nosso artigo:',
    readArticle: isEnglish ? 'Read Article' : 'Ler Artigo',
    viewOriginal: isEnglish ? 'View Original' : 'Ver Original',
    enjoyReading: isEnglish 
      ? 'Enjoy reading!' 
      : 'Boa leitura!',
    team: isEnglish ? 'CatBytes Team' : 'Equipe CatBytes',
    followUs: isEnglish ? 'Follow us' : 'Nos siga',
    copyright: '© 2025 CatBytes'
  }

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${t.subject}</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}@media only screen and (max-width:600px){.email-container{width:100%!important;}.mobile-padding{padding:20px!important;}}
  </style>
</head>
<body style="margin:0;padding:0;background-color:${c.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${c.bg};">
    <tr><td align="center" style="padding:40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header com logo -->
          <tr><td align="center" style="background:linear-gradient(135deg,${c.dark} 0%,${c.darkHover} 100%);padding:50px 30px;border-radius:16px 16px 0 0;">
              <img src="${baseUrl}/images/catbytes-logo-email.png" alt="CatBytes" width="240" height="160" style="display:block;width:240px;height:auto;max-width:100%;margin:0 auto;">
            </td></tr>

          <!-- Banner de nova tradução -->
          <tr><td align="center" style="background:linear-gradient(135deg,${c.primary} 0%,${c.primary}dd 100%);padding:25px 30px;">
              <h1 style="margin:0;color:white;font-size:24px;font-weight:bold;">📝 ${t.newTranslation}</h1>
            </td></tr>

          <!-- Saudação -->
          <tr><td style="padding:40px 30px 20px;" class="mobile-padding">
              <h2 style="margin:0 0 20px 0;font-size:20px;line-height:1.6;color:${c.text};font-weight:600;">${t.greeting}</h2>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.7;color:${c.textLight};">${t.translationText}</p>
            </td></tr>

          <!-- Article Preview -->
          <tr><td style="padding:0 30px;" class="mobile-padding">
              <div style="border:2px solid ${c.border};border-radius:12px;overflow:hidden;margin-bottom:30px;">
                <!-- Cover Image -->
                <div style="height:200px;background-color:${c.bg};background-image:url('${coverImageUrl}');background-size:cover;background-position:center;position:relative;">
                  <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.7));padding:20px;">
                    <h3 style="margin:0;color:white;font-size:18px;font-weight:bold;">${translatedTitle}</h3>
                  </div>
                </div>
                
                <!-- Article Content -->
                <div style="padding:25px;">
                  <p style="margin:0 0 20px 0;color:${c.textLight};font-size:14px;line-height:1.6;">${excerpt}</p>
                  
                  <div style="margin:20px 0;">
                    <a href="${postUrl}" style="display:inline-block;background:linear-gradient(135deg,${c.primary} 0%,${c.primary}dd 100%);color:white;text-decoration:none;padding:15px 30px;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 15px ${c.primary}40;">${t.readArticle}</a>
                  </div>
                  
                  <hr style="border:none;border-top:1px solid ${c.border};margin:20px 0;">
                  
                  <p style="margin:0 0 10px 0;color:${c.textLight};font-size:13px;">${t.originalText}</p>
                  <p style="margin:0 0 15px 0;color:${c.text};font-size:14px;font-weight:500;">${originalTitle}</p>
                  <a href="${originalUrl}" style="color:${c.primary};text-decoration:none;font-size:14px;font-weight:500;">${t.viewOriginal} →</a>
                </div>
              </div>
            </td></tr>

          <!-- Closing Message -->
          <tr><td style="padding:0 30px 40px;" class="mobile-padding">
              <p style="margin:0 0 20px;color:${c.textLight};font-size:16px;line-height:1.7;text-align:center;">${t.enjoyReading}</p>
              <p style="margin:0;color:${c.text};font-size:16px;font-weight:600;text-align:center;">${t.team}</p>
            </td></tr>

          <!-- Footer -->
          <tr><td style="background-color:${c.bg};padding:30px;text-align:center;border-top:1px solid ${c.border};border-radius:0 0 16px 16px;">
              <div style="margin-bottom:20px;">
                <a href="https://www.linkedin.com/in/izadora-cury-pierette-7a7754253/" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="32" height="32" style="width:32px;height:32px;"></a>
                <a href="https://github.com/ipierette" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="GitHub" width="32" height="32" style="width:32px;height:32px;"></a>
                <a href="https://www.instagram.com/catbytes_izadora_pierette/" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="32" height="32" style="width:32px;height:32px;"></a>
              </div>
              <p style="margin:0;font-size:12px;color:${c.textLight};">${t.copyright}</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`.trim()
}