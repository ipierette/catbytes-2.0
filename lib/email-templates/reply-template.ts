/**
 * Template de email de resposta personalizado
 * Design harmonizado com newsletter CatBytes
 */

interface ReplyEmailParams {
  recipientName: string
  message: string
  locale?: string
}

export function getReplyEmailHTML(
  { recipientName, message, locale = 'pt-BR' }: ReplyEmailParams,
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
    greeting: isEnglish ? `Hello ${recipientName}` : `Olá ${recipientName}`,
    goodbye: isEnglish ? 'Best regards' : 'Atenciosamente',
    signature: isEnglish ? 'Izadora Cury Pierette - CatBytes Founder' : 'Izadora Cury Pierette - Criadora da CatBytes',
    website: isEnglish ? 'Visit Website' : 'Visitar Site',
    followMe: isEnglish ? 'Follow me' : 'Me siga',
    copyright: '© 2025 CatBytes'
  }

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>CatBytes</title>
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

          <!-- Saudação -->
          <tr><td style="padding:40px 30px 20px;" class="mobile-padding">
              <p style="margin:0 0 20px 0;font-size:20px;line-height:1.6;color:${c.text};font-weight:600;">${t.greeting} 👋</p>
            </td></tr>

          <!-- Mensagem -->
          <tr><td style="padding:0 30px 40px;" class="mobile-padding">
              <div style="color:${c.textLight};font-size:16px;line-height:1.7;white-space:pre-wrap;">${message}</div>
            </td></tr>

          <!-- Assinatura -->
          <tr><td style="padding:0 30px 40px;" class="mobile-padding">
              <div style="border-top:2px solid ${c.border};padding-top:25px;">
                <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:${c.textLight};">${t.goodbye},</p>
                <p style="margin:0;font-size:16px;line-height:1.6;color:${c.text};font-weight:700;">${t.signature}</p>
              </div>
            </td></tr>

          <!-- Footer -->
          <tr><td style="background-color:${c.bg};padding:30px;text-align:center;border-top:1px solid ${c.border};border-radius:0 0 16px 16px;">
              <div style="margin-bottom:20px;">
                <a href="https://www.linkedin.com/in/izadora-cury-pierette-7a7754253/" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="32" height="32" style="width:32px;height:32px;"></a>
                <a href="https://github.com/ipierette" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="GitHub" width="32" height="32" style="width:32px;height:32px;"></a>
                <a href="https://www.instagram.com/catbytes_izadora_pierette/" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="32" height="32" style="width:32px;height:32px;"></a>
              </div>
              <div style="margin-bottom:15px;">
                <a href="${baseUrl}/${locale}" style="display:inline-block;background:linear-gradient(135deg,${c.primary} 0%,${c.primary}dd 100%);color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:8px;font-weight:600;font-size:14px;box-shadow:0 4px 15px ${c.primary}40;">${t.website}</a>
              </div>
              <p style="margin:0;font-size:12px;color:${c.textLight};">${t.copyright}</p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`.trim()
}
