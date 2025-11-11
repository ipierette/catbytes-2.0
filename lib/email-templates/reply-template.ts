/**
 * Template de email de resposta personalizado
 * Otimizado para evitar spam com design simples e profissional
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

  const colors = {
    primary: '#9333EA', // purple-600
    secondary: '#3B82F6', // blue-500
    background: '#FFFFFF',
    text: '#1F2937', // gray-800
    textLight: '#6B7280', // gray-500
    border: '#E5E7EB', // gray-200
  }

  const texts = {
    greeting: isEnglish ? `Hi ${recipientName}` : `Olá ${recipientName}`,
    signature: isEnglish ? 'Best regards' : 'Atenciosamente',
    izadora: 'Izadora Cury Pierette',
    title: isEnglish 
      ? 'Full Stack Developer | AI & Automation Specialist' 
      : 'Desenvolvedora Full Stack | Especialista em IA e Automação',
    website: 'catbytes.site',
    viewWebsite: isEnglish ? 'Visit Website' : 'Visitar Site',
    followMe: isEnglish ? 'Follow me' : 'Me siga',
  }

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset básico */
    body, table, td, a { 
      -webkit-text-size-adjust: 100%; 
      -ms-text-size-adjust: 100%; 
    }
    table, td { 
      mso-table-lspace: 0pt; 
      mso-table-rspace: 0pt; 
    }
    img { 
      -ms-interpolation-mode: bicubic; 
      border: 0; 
      height: auto; 
      line-height: 100%; 
      outline: none; 
      text-decoration: none; 
    }
    body { 
      margin: 0; 
      padding: 0; 
      width: 100% !important; 
      height: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Responsivo */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 20px !important;
      }
      .logo {
        width: 120px !important;
        height: auto !important;
      }
      .banner {
        height: 100px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F9FAFB;">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="container" align="center" style="max-width: 600px; width: 100%; background-color: ${colors.background}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Logo -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);">
              <img 
                src="${baseUrl}/images/catbytes-logo-email.png" 
                alt="CatBytes" 
                class="logo"
                width="150" 
                height="auto"
                style="display: block; margin: 0 auto; max-width: 150px; height: auto;"
              />
            </td>
          </tr>

          <!-- Saudação -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h2 style="margin: 0 0 20px 0; color: ${colors.text}; font-size: 24px; font-weight: 600; line-height: 1.3;">
                ${texts.greeting},
              </h2>
            </td>
          </tr>

          <!-- Mensagem Customizada -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="color: ${colors.text}; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
${message}
              </div>
            </td>
          </tr>

          <!-- Assinatura -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-top: 20px; border-top: 2px solid ${colors.border};">
                    <p style="margin: 0 0 10px 0; color: ${colors.text}; font-size: 16px; font-weight: 500;">
                      ${texts.signature},
                    </p>
                    <p style="margin: 0; color: ${colors.primary}; font-size: 18px; font-weight: 700;">
                      ${texts.izadora}
                    </p>
                    <p style="margin: 5px 0 0 0; color: ${colors.textLight}; font-size: 14px;">
                      ${texts.title}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner de Assinatura -->
          <tr>
            <td style="padding: 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%);">
                <tr>
                  <td style="padding: 30px 40px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <!-- Logo pequeno -->
                      <tr>
                        <td style="text-align: center; padding-bottom: 15px;">
                          <img 
                            src="${baseUrl}/favicon-64x64.png" 
                            alt="CatBytes" 
                            width="48" 
                            height="48"
                            style="display: block; margin: 0 auto; border-radius: 8px;"
                          />
                        </td>
                      </tr>
                      
                      <!-- Links -->
                      <tr>
                        <td style="text-align: center; padding-bottom: 10px;">
                          <a href="${baseUrl}/${locale}" style="display: inline-block; padding: 12px 30px; background-color: ${colors.primary}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 5px;">
                            ${texts.viewWebsite}
                          </a>
                        </td>
                      </tr>
                      
                      <!-- Social Links -->
                      <tr>
                        <td style="text-align: center; padding-top: 15px;">
                          <p style="margin: 0 0 10px 0; color: ${colors.textLight}; font-size: 13px;">
                            ${texts.followMe}:
                          </p>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tr>
                              <td style="padding: 0 8px;">
                                <a href="https://github.com/izadoracury" style="text-decoration: none; color: ${colors.textLight}; font-size: 12px;">
                                  GitHub
                                </a>
                              </td>
                              <td style="padding: 0 8px; color: ${colors.border};">•</td>
                              <td style="padding: 0 8px;">
                                <a href="https://linkedin.com/in/izadoracury" style="text-decoration: none; color: ${colors.textLight}; font-size: 12px;">
                                  LinkedIn
                                </a>
                              </td>
                              <td style="padding: 0 8px; color: ${colors.border};">•</td>
                              <td style="padding: 0 8px;">
                                <a href="https://instagram.com/catbytes.dev" style="text-decoration: none; color: ${colors.textLight}; font-size: 12px;">
                                  Instagram
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #F9FAFB;">
              <p style="margin: 0; color: ${colors.textLight}; font-size: 12px; line-height: 1.5;">
                © ${new Date().getFullYear()} CatBytes - Izadora Cury Pierette<br>
                <a href="${baseUrl}/${locale}" style="color: ${colors.primary}; text-decoration: none;">${texts.website}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
