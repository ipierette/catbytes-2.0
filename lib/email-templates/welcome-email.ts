/**
 * 📧 TEMPLATE: Email de Boas-Vindas
 * 
 * Template profissional otimizado para máxima compatibilidade
 * ✅ Testado em: Gmail, Outlook, Apple Mail, Yahoo, Thunderbird
 * ✅ Mobile-first design
 * ✅ Imagens com fallback
 * ✅ Inline CSS para compatibilidade
 * 
 * Variáveis:
 * - name: Nome do assinante
 * - token: Token de verificação
 * - locale: Idioma (pt-BR ou en-US)
 */

export function getWelcomeEmailHTML(name: string, token: string, locale: string = 'pt-BR'): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  const verifyUrl = `${baseUrl}/${locale}/newsletter/verify?token=${token}`
  
  const isPortuguese = locale === 'pt-BR'
  
  // 🌍 Traduções
  const t = {
    title: isPortuguese ? 'Bem-vindo à Newsletter CatBytes!' : 'Welcome to CatBytes Newsletter!',
    greeting: isPortuguese ? `Olá ${name}! 👋` : `Hello ${name}! 👋`,
    intro: isPortuguese 
      ? 'Que bom ter você por aqui! Estamos animados para compartilhar conteúdo exclusivo sobre tecnologia, IA, automação e desenvolvimento web.'
      : "Great to have you here! We're excited to share exclusive content about technology, AI, automation and web development.",
    
    whatYouGet: isPortuguese ? '🎁 O que você vai receber:' : '🎁 What you will receive:',
    list: isPortuguese ? [
      'Artigos exclusivos sobre IA e automação',
      'Dicas práticas de desenvolvimento web',
      'Novidades e tendências tech',
      'Conteúdo enviado 4x por semana (segunda, quinta, sábado, domingo)'
    ] : [
      'Exclusive articles about AI and automation',
      'Practical web development tips',
      'Tech news and trends',
      'Content sent 4x per week (Mon, Thu, Sat, Sun)'
    ],
    
    important: isPortuguese ? '📧 Importante:' : '📧 Important:',
    spamWarning: isPortuguese
      ? 'Para garantir que nossos emails não caiam no spam, adicione newsletter@catbytes.site aos seus contatos!'
      : 'To ensure our emails don\'t end up in spam, add newsletter@catbytes.site to your contacts!',
    
    confirmButton: isPortuguese ? '✓ Confirmar Inscrição' : '✓ Confirm Subscription',
    
    goodbye: isPortuguese ? 'Até breve! 🐱' : 'See you soon! 🐱',
    team: isPortuguese ? 'Izadora Cury Pierette - Criadora da CatBytes' : 'Izadora Cury Pierette - CatBytes Founder',
    
    footer: isPortuguese ? 'Você está recebendo este email porque se inscreveu em nosso site.' : 'You are receiving this email because you subscribed on our website.',
    unsubscribe: isPortuguese ? 'Cancelar inscrição' : 'Unsubscribe',
    copyright: isPortuguese ? '© 2025 CatBytes. Todos os direitos reservados.' : '© 2025 CatBytes. All rights reserved.'
  }

  return `<!DOCTYPE html>
<html lang="${locale}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${t.title}</title>
  <!--[if mso]>
  <style>
    * { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Mobile styles */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-padding { padding: 20px !important; }
      .mobile-center { text-align: center !important; }
      .mobile-full-width { width: 100% !important; max-width: 100% !important; display: block !important; }
      .mobile-hide { display: none !important; }
      .mobile-font-size { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  
  <!-- Preheader (hidden text) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${t.intro.substring(0, 100)}...
  </div>
  
  <!-- Email Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;" class="mobile-padding">
        
        <!-- Main Email Table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo and Gradient -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #8A2BE2 0%, #FF69B4 50%, #00BFFF 100%); padding: 40px 30px 30px 30px;">
              <!-- Logo CatBytes -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <img src="https://catbytes.site/images/catbytes-logo.png" alt="CatBytes" width="240" height="160" style="display: block; width: 240px; height: auto; max-width: 100%; margin: 0 auto;" class="mobile-full-width">
                  </td>
                </tr>
              </table>
              
              <!-- Title -->
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3; text-align: center;" class="mobile-font-size">
                ${t.title}
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;" class="mobile-padding">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 18px; line-height: 1.6; color: #111827; font-weight: 600;">
                ${t.greeting}
              </p>
              
              <!-- Intro -->
              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.7; color: #374151;">
                ${t.intro}
              </p>
              
              <!-- Benefits Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #fdf2f8 0%, #eff6ff 100%); border-left: 4px solid #8A2BE2; padding: 25px; border-radius: 8px;">
                    <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 700; color: #8A2BE2;">
                      ${t.whatYouGet}
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      ${t.list.map(item => `
                        <tr>
                          <td style="padding: 8px 0 8px 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="padding-right: 10px; vertical-align: top; color: #8A2BE2; font-size: 18px; line-height: 1.4;">✓</td>
                                <td style="font-size: 15px; line-height: 1.6; color: #4B5563;">${item}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      `).join('')}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Important Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400E;">
                      <strong>${t.important}</strong> ${t.spamWarning}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 700; font-size: 16px; line-height: 1.5; text-align: center; box-shadow: 0 4px 12px rgba(138, 43, 226, 0.3);">
                      ${t.confirmButton}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Closing -->
              <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.7; color: #6B7280;">
                ${t.goodbye}<br>
                <strong style="color: #111827;">${t.team}</strong>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #F9FAFB; padding: 30px; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 15px 0; font-size: 12px; line-height: 1.5; color: #6B7280; text-align: center;">
                ${t.footer}
              </p>
              <p style="margin: 0 0 15px 0; font-size: 12px; line-height: 1.5; color: #9CA3AF; text-align: center;">
                ${t.copyright}
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #9CA3AF; text-align: center;">
                <a href="${baseUrl}/${locale}/newsletter/unsubscribe?token=${token}" style="color: #8A2BE2; text-decoration: underline;">${t.unsubscribe}</a>
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>`
}
