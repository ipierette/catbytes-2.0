/**
 * 📧 EMAIL: Boas-Vindas - Design harmonizado com logo CatBytes
 * Cores: Cinza escuro (#1F2937) + Ciano vibrante (#06B6D4)
 */

export function getWelcomeEmailHTML(name: string, token: string, locale: string = 'pt-BR'): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  const verifyUrl = `${baseUrl}/${locale}/newsletter/verify?token=${token}`
  const isPortuguese = locale === 'pt-BR'
  
  const c = { primary: '#06B6D4', dark: '#1F2937', darkHover: '#374151', text: '#111827', textLight: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' }
  
  const t = {
    title: isPortuguese ? 'Bem-vindo à Newsletter CatBytes!' : 'Welcome to CatBytes Newsletter!',
    greeting: isPortuguese ? `Olá ${name}! 👋` : `Hello ${name}! 👋`,
    intro: isPortuguese ? 'Que bom ter você por aqui! Estou animada para compartilhar conteúdo exclusivo sobre tecnologia, IA, automação e desenvolvimento web.' : "Great to have you here! I'm excited to share exclusive content about technology, AI, automation and web development.",
    whatYouGet: isPortuguese ? '🎁 O que você vai receber:' : '🎁 What you will receive:',
    list: isPortuguese ? ['✨ Artigos exclusivos sobre IA e automação', '💻 Dicas práticas de desenvolvimento web', '🚀 Novidades e tendências tech', '📬 Conteúdo enviado 4x por semana'] : ['✨ Exclusive articles about AI and automation', '💻 Practical web development tips', '🚀 Tech news and trends', '�� Content sent 4x per week'],
    important: isPortuguese ? '📧 Importante:' : '📧 Important:',
    spamWarning: isPortuguese ? 'Para garantir que meus emails não caiam no spam, adicione contato@catbytes.site.site aos seus contatos!' : 'To ensure my emails dont end up in spam, add contato@catbytes.site.site to your contacts!',
    confirmButton: isPortuguese ? '✓ Confirmar Inscrição' : '✓ Confirm Subscription',
    goodbye: isPortuguese ? 'Até breve! 🐱💻' : 'See you soon! 🐱💻',
    signature: isPortuguese ? 'Izadora Cury Pierette - Criadora da CatBytes' : 'Izadora Cury Pierette - CatBytes Founder',
    footer: isPortuguese ? 'Você está recebendo este email porque se inscreveu na newsletter.' : 'You are receiving this email because you subscribed to the newsletter.',
    unsubscribe: isPortuguese ? 'Cancelar inscrição' : 'Unsubscribe',
    copyright: '© 2025 CatBytes'
  }

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}@media only screen and (max-width:600px){.email-container{width:100%!important;}.mobile-padding{padding:20px!important;}.mobile-full-width{width:100%!important;}.mobile-font-size{font-size:24px!important;}}
  </style>
</head>
<body style="margin:0;padding:0;background-color:${c.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${t.intro}</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${c.bg};">
    <tr><td align="center" style="padding:40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <tr><td align="center" style="background:linear-gradient(135deg,${c.dark} 0%,${c.darkHover} 100%);padding:50px 30px;border-radius:16px 16px 0 0;">
              <img src="https://catbytes.site/images/catbytes-logo.png" alt="CatBytes" width="240" height="160" style="display:block;width:240px;height:auto;max-width:100%;margin:0 auto 20px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;text-align:center;" class="mobile-font-size">${t.title}</h1>
            </td></tr>
          <tr><td style="padding:40px 30px;" class="mobile-padding">
              <p style="margin:0 0 20px 0;font-size:20px;line-height:1.6;color:${c.text};font-weight:600;">${t.greeting}</p>
              <p style="margin:0 0 30px 0;font-size:16px;line-height:1.7;color:${c.textLight};">${t.intro}</p>
              <div style="background:linear-gradient(135deg,${c.primary}15 0%,${c.primary}10 100%);border-left:4px solid ${c.primary};padding:25px;margin:30px 0;border-radius:8px;">
                <p style="margin:0 0 15px 0;font-size:18px;font-weight:700;color:${c.text};">${t.whatYouGet}</p>
                ${t.list.map(item => `<p style="margin:8px 0;font-size:15px;line-height:1.6;color:${c.textLight};">${item}</p>`).join('')}
              </div>
              <div style="background:${c.bg};border:2px solid ${c.border};padding:20px;margin:30px 0;border-radius:8px;">
                <p style="margin:0;font-size:14px;color:${c.textLight};"><strong style="color:${c.text};">${t.important}</strong><br>${t.spamWarning}</p>
              </div>
              <div style="text-align:center;margin:40px 0;">
                <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,${c.primary} 0%,${c.primary}dd 100%);color:#ffffff;text-decoration:none;padding:18px 45px;border-radius:8px;font-weight:700;font-size:16px;box-shadow:0 4px 15px ${c.primary}40;">${t.confirmButton}</a>
              </div>
              <p style="margin:30px 0 0;font-size:16px;line-height:1.6;color:${c.textLight};text-align:center;">${t.goodbye}<br><strong style="color:${c.text};">${t.signature}</strong></p>
            </td></tr>
          <tr><td style="background-color:${c.bg};padding:30px;text-align:center;border-top:1px solid ${c.border};border-radius:0 0 16px 16px;">
              <div style="margin-bottom:20px;">
                <a href="https://www.linkedin.com/in/izadora-cury-pierette-7a7754253/" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="32" height="32" style="width:32px;height:32px;"></a>
                <a href="https://github.com/ipierette" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="GitHub" width="32" height="32" style="width:32px;height:32px;"></a>
                <a href="https://www.instagram.com/catbytes_izadora_pierette/" target="_blank" style="display:inline-block;margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="32" height="32" style="width:32px;height:32px;"></a>
              </div>
              <p style="margin:0 0 10px;font-size:12px;color:${c.textLight};">${t.footer}</p>
              <p style="margin:0 0 10px;font-size:12px;color:${c.textLight};">${t.copyright}</p>
              <p style="margin:0;font-size:11px;"><a href="${baseUrl}/${locale}/newsletter/unsubscribe?token=${token}" style="color:${c.primary};text-decoration:none;font-weight:600;">${t.unsubscribe}</a></p>
            </td></tr>
        </table>
      </td></tr>
  </table>
</body>
</html>`
}
