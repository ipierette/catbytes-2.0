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

const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function investigateNewsletter() {
  console.log('🕵️ Investigando o problema da newsletter...\n')

  try {
    // 1. Verificar se a tradução foi criada
    console.log('1️⃣ Verificando tradução criada recentemente...')
    const { data: recentTranslations } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('locale', 'en-US')
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentTranslations?.length > 0) {
      console.log('✅ Traduções recentes encontradas:')
      recentTranslations.forEach(post => {
        console.log(`   - ${post.title} (${post.id})`)
        console.log(`     Created: ${post.created_at}`)
        console.log(`     From: ${post.translated_from}`)
      })
    } else {
      console.log('❌ Nenhuma tradução recente encontrada')
    }

    // 2. Verificar assinantes EN-US em detalhes
    console.log('\n2️⃣ Verificando assinantes EN-US em detalhes...')
    const { data: enSubscribers } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('locale', 'en-US')

    if (enSubscribers?.length > 0) {
      console.log('✅ Assinantes EN-US encontrados:')
      enSubscribers.forEach(sub => {
        console.log(`   Email: ${sub.email}`)
        console.log(`   Verified: ${sub.verified}`)
        console.log(`   Subscribed: ${sub.subscribed}`)
        console.log(`   Last email: ${sub.last_email_sent_at || 'Never'}`)
        console.log(`   Locale: ${sub.locale}`)
        console.log('   ---')
      })
    } else {
      console.log('❌ Nenhum assinante EN-US encontrado')
    }

    // 3. Verificar configurações de email
    console.log('\n3️⃣ Verificando configurações Resend...')
    console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ Missing'}`)
    console.log(`   NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'Missing'}`)

    // 4. Teste direto do Resend
    if (process.env.RESEND_API_KEY) {
      console.log('\n4️⃣ Testando Resend API diretamente...')
      try {
        const { Resend } = require('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        const testEmail = await resend.emails.send({
          from: 'newsletter@catbytes.com',
          to: ['ipierettecury@gmail.com'], // Email de teste
          subject: '🧪 Teste Resend API - Newsletter System',
          html: `
            <h1>Teste do Sistema de Newsletter</h1>
            <p>Este é um teste para verificar se o Resend está funcionando.</p>
            <p>Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
          `
        })
        
        console.log('✅ Teste Resend enviado com sucesso!')
        console.log('   ID:', testEmail.data?.id)
      } catch (resendError) {
        console.log('❌ Erro no teste Resend:', resendError.message)
      }
    }

    // 5. Verificar logs do servidor (se estiver rodando)
    console.log('\n5️⃣ Para verificar se a newsletter foi enviada:')
    console.log('   - Verifique os logs do servidor Next.js')
    console.log('   - Procure por "[Translate]" nos logs')
    console.log('   - Verifique a caixa de spam do email val***@gmail.com')

  } catch (error) {
    console.error('❌ Erro na investigação:', error)
  }
}

investigateNewsletter()
  .then(() => process.exit(0))
  .catch(console.error)