/**
 * 📧 TEMPLATE: Email de Boas-Vindas
 * 
 * Enviado quando alguém se inscreve na newsletter
 * 
 * SUPORTA i18n: ✅ Sim (pt-BR e en-US)
 * 
 * Variáveis disponíveis:
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
    greeting: isPortuguese ? `Olá <strong>${name}</strong>! 👋` : `Hello <strong>${name}</strong>! 👋`,
    intro: isPortuguese 
      ? 'Que bom ter você por aqui! Estamos animados para compartilhar conteúdo exclusivo sobre <strong>tecnologia, IA, automação e desenvolvimento web</strong>.'
      : "Great to have you here! We're excited to share exclusive content about <strong>technology, AI, automation and web development</strong>.",
    
    whatYouGet: isPortuguese ? '🎁 O que você vai receber:' : '🎁 What you will receive:',
    list: isPortuguese ? [
      'Artigos exclusivos sobre IA e automação',
      'Dicas práticas de desenvolvimento web',
      'Novidades e tendências tech',
      'Conteúdo enviado 3x por semana (terça, quinta, sábado)'
    ] : [
      'Exclusive articles about AI and automation',
      'Practical web development tips',
      'Tech news and trends',
      'Content sent 3x per week (Tue, Thu, Sat)'
    ],
    
    important: isPortuguese ? '<strong>📧 Importante:</strong>' : '<strong>📧 Important:</strong>',
    spamWarning: isPortuguese
      ? 'Para garantir que nossos emails não caiam no spam, adicione <strong>contato@catbytes.site</strong> aos seus contatos!'
      : 'To ensure our emails don\'t end up in spam, add <strong>contato@catbytes.site</strong> to your contacts!',
    
    confirmButton: isPortuguese ? '✓ Confirmar Inscrição' : '✓ Confirm Subscription',
    
    goodbye: isPortuguese ? 'Até breve! 🐱' : 'See you soon! 🐱',
    team: isPortuguese ? 'Equipe CatBytes' : 'CatBytes Team',
    
    footer: isPortuguese ? 'Você está recebendo este email porque se inscreveu em nosso site.' : 'You are receiving this email because you subscribed on our website.',
    unsubscribe: isPortuguese ? 'Cancelar inscrição' : 'Unsubscribe',
    copyright: isPortuguese ? '© 2025 CatBytes. Todos os direitos reservados.' : '© 2025 CatBytes. All rights reserved.'
  }

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8A2BE2 0%, #FF69B4 50%, #00BFFF 100%); padding: 40px 30px; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 12px; text-align: center;">
                    <img src="${baseUrl}/images/logo-desenvolvedora.png" alt="Logo Desenvolvedora" style="height: 70px; width: 200px; display: block;">
                  </td>
                  <td style="padding: 0 12px; text-align: center;">
                    <img src="${baseUrl}/images/catbytes-logo.png" alt="CatBytes" style="height: 140px; width: 250px; display: block;">
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${t.title}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                ${t.greeting}
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                ${t.intro}
              </p>

              <div style="background: linear-gradient(135deg, #fdf2f8 0%, #eff6ff 100%); border-left: 4px solid #8A2BE2; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #8A2BE2;">
                  ${t.whatYouGet}
                </p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #4B5563;">
                  ${t.list.map(item => `<li style="margin: 8px 0;">${item}</li>`).join('')}
                </ul>
              </div>

              <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #92400E;">
                  ${t.important} ${t.spamWarning}
                </p>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #8A2BE2 0%, #00BFFF 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ${t.confirmButton}
                </a>
              </div>

              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #6B7280;">
                ${t.goodbye}<br>
                <strong>${t.team}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #9CA3AF;">
                ${t.copyright}
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                ${t.footer}<br>
                <a href="${baseUrl}/${locale}/newsletter/unsubscribe" style="color: #8A2BE2; text-decoration: none;">${t.unsubscribe}</a>
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
