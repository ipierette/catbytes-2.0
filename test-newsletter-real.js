const fs = require('fs')
const path = require('path')

// Carregar ENV
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length) {
        const value = valueParts.join('=').trim().replace(/^["'](.*)["']$/, '$1')
        process.env[key.trim()] = value
      }
    }
  })
}

async function sendTestNewsletter() {
  console.log('📧 Enviando newsletter de teste para assinante EN-US real...\n')

  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Importar template
    const { getTranslationNotificationEmailHTML } = require('./lib/email-templates/translation-notification-email')

    const baseUrl = 'https://catbytes.site'
    const testData = {
      translatedTitle: 'TEST: Online Portfolio - Your Professional Digital Showcase',
      originalTitle: 'TESTE: Portfolio Online - Sua Vitrine Digital Profissional', 
      excerpt: 'This is a test translation notification to verify our EN-US newsletter system is working. We are testing the automatic newsletter system for translated blog posts.',
      coverImageUrl: 'https://lbjekucdxgouwgegpdhi.supabase.co/storage/v1/object/public/blog-images/blog-covers/portfolio-online-sua-vitrine-digital-profissional-1762702751408.webp',
      postUrl: `${baseUrl}/en-US/blog/test-translation-en`,
      originalUrl: `${baseUrl}/blog/test-translation`
    }

    const htmlContent = getTranslationNotificationEmailHTML(
      'Dear Reader',
      testData.translatedTitle,
      testData.originalTitle,
      testData.excerpt,
      testData.coverImageUrl,
      testData.postUrl,
      testData.originalUrl,
      'en-US',
      baseUrl
    )

    console.log('📤 Enviando email de teste...')
    console.log(`Para: valterzjr@gmail.com`)
    console.log(`Assunto: 🌐 TEST - Translation Available: ${testData.translatedTitle}`)

    const result = await resend.emails.send({
      from: 'newsletter@catbytes.com',
      to: ['valterzjr@gmail.com'],
      subject: `🌐 TEST - Translation Available: ${testData.translatedTitle}`,
      html: htmlContent,
    })

    console.log('\n✅ EMAIL ENVIADO!')
    console.log('Resultado:', result)

    if (result.data?.id) {
      console.log(`\n📧 Email ID: ${result.data.id}`)
      console.log('📋 Instruções:')
      console.log('1. Verifique a caixa de entrada do email valterzjr@gmail.com')
      console.log('2. Verifique também a pasta de SPAM')
      console.log('3. Se não recebeu, pode ser problema de entrega do Resend')
    }

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
  }
}

sendTestNewsletter()
  .then(() => process.exit(0))
  .catch(console.error)