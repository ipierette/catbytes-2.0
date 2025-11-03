require('dotenv').config({ path: '.env.local' })
const { Resend } = require('resend')

async function testNewsletterEmail() {
  console.log('🧪 Testando envio de email da newsletter...\n')
  
  // Verificar configuração
  const apiKey = process.env.RESEND_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  
  if (!apiKey) {
    console.log('❌ RESEND_API_KEY não configurada')
    console.log('Configure no .env.local para testar emails')
    return
  }
  
  console.log('✅ API Key encontrada:', apiKey.substring(0, 10) + '...')
  console.log('✅ Base URL:', baseUrl)
  
  const resend = new Resend(apiKey)
  
  // Post de exemplo
  const testPost = {
    title: 'Testes Automatizados com IA: O Futuro da Qualidade de Software',
    excerpt: 'Descubra como os testes automatizados com IA estão revolucionando o desenvolvimento de software e como sua empresa pode se beneficiar.',
    cover_image_url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-test/img-test.png'
  }
  
  const subscriber = {
    email: 'ipierette2@gmail.com',
    name: 'Izadora',
    locale: 'pt-BR'
  }
  
  const locale = subscriber.locale || 'pt-BR'
  const postUrl = `${baseUrl}/${locale}/blog`
  
  console.log('\n📧 Enviando email de teste para:', subscriber.email)
  console.log('📝 Post:', testPost.title)
  console.log('🔗 URL do blog:', postUrl)
  
  try {
    const result = await resend.emails.send({
      from: 'CatBytes <contato@catbytes.site>',
      to: subscriber.email,
      subject: `🚀 Novo Artigo: ${testPost.title}`,
      html: getNewPostEmailHTML(
        subscriber.name || 'Amigo',
        testPost.title,
        testPost.excerpt,
        testPost.cover_image_url,
        postUrl,
        locale,
        baseUrl
      ),
    })
    
    console.log('\n✅ Email enviado com sucesso!')
    console.log('📬 ID do email:', result.data?.id || result.id)
    console.log('\n💡 Verifique sua caixa de entrada:', subscriber.email)
    console.log('⚠️  Se não chegar, verifique o spam/lixeira')
  } catch (error) {
    console.error('\n❌ Erro ao enviar email:', error.message)
    if (error.message.includes('domain')) {
      console.log('\n💡 Parece um erro de domínio. Verifique:')
      console.log('1. Domínio verificado no Resend: catbytes.site')
      console.log('2. DNS records configurados corretamente')
    }
  }
}

// Template de email (copiado da API)
function getNewPostEmailHTML(name, title, excerpt, coverImageUrl, postUrl, locale, baseUrl) {
  const isPortuguese = locale === 'pt-BR'
  
  const texts = {
    greeting: isPortuguese ? `Olá, ${name}!` : `Hello, ${name}!`,
    newPost: isPortuguese ? '🚀 Novo Artigo Publicado!' : '🚀 New Article Published!',
    readMore: isPortuguese ? 'Ler Artigo Completo' : 'Read Full Article',
    viewBlog: isPortuguese ? 'Ver Todos os Artigos' : 'View All Articles',
    unsubscribe: isPortuguese ? 'Cancelar inscrição' : 'Unsubscribe',
    footer: isPortuguese 
      ? 'Você está recebendo este email porque se inscreveu na newsletter da CatBytes.'
      : 'You are receiving this email because you subscribed to the CatBytes newsletter.'
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
                
                <tr>
                  <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <img src="${baseUrl}/images/catbytes-logo.png" alt="CatBytes" style="height: 80px; width: auto; margin-bottom: 20px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${texts.newPost}</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 30px 40px 20px;">
                    <p style="color: #333333; font-size: 18px; margin: 0; font-weight: 500;">${texts.greeting}</p>
                  </td>
                </tr>

                ${coverImageUrl ? `
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <img src="${coverImageUrl}" alt="${title}" style="width: 100%; height: auto; border-radius: 8px; display: block;">
                  </td>
                </tr>
                ` : ''}

                <tr>
                  <td style="padding: 0 40px 15px;">
                    <h2 style="color: #1a1a1a; margin: 0; font-size: 26px; font-weight: 700; line-height: 1.3;">${title}</h2>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">${excerpt}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 40px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${postUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">${texts.readMore}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding: 0 40px 40px;">
                    <a href="${postUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">${texts.viewBlog} →</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 15px;">
                          <img src="${baseUrl}/images/logo-desenvolvedora.png" alt="Developer Logo" style="height: 60px; width: auto;">
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px; line-height: 1.5;">${texts.footer}</p>
                          <a href="${baseUrl}/${locale}/newsletter/unsubscribe" style="color: #9ca3af; text-decoration: underline; font-size: 12px;">${texts.unsubscribe}</a>
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

testNewsletterEmail()
