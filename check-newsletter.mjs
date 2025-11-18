import 'dotenv/config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function checkSubscriber(email) {
  console.log('🔍 Verificando assinante:', email)
  console.log('📍 Supabase URL:', SUPABASE_URL)
  console.log('')
  
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=*`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  const data = await response.json()
  
  if (!data || data.length === 0) {
    console.log('❌ Email NÃO encontrado na base de assinantes')
    console.log('')
    console.log('💡 Solução:')
    console.log('1. Acesse: https://catbytes.site/pt-BR')
    console.log('2. Role até o rodapé')
    console.log('3. Inscreva-se na newsletter com seu email')
    console.log('4. Verifique seu email e clique no link de confirmação')
  } else {
    const sub = data[0]
    console.log('✅ Assinante encontrado!')
    console.log('')
    console.log('📊 Status da assinatura:')
    console.log('  - Email:', sub.email)
    console.log('  - Nome:', sub.name || '(não informado)')
    console.log('  - Verificado:', sub.verified ? '✅ SIM' : '❌ NÃO - verifique seu email!')
    console.log('  - Ativo:', sub.subscribed ? '✅ SIM' : '❌ NÃO - reative a assinatura')
    console.log('  - Idioma:', sub.locale || 'pt-BR')
    console.log('  - Cadastrado em:', new Date(sub.created_at).toLocaleString('pt-BR'))
    console.log('')
    
    if (!sub.verified) {
      console.log('⚠️  PROBLEMA: Email não verificado!')
      console.log('📧 Verifique sua caixa de entrada (e spam) para o email de confirmação')
    } else if (!sub.subscribed) {
      console.log('⚠️  PROBLEMA: Assinatura desativada!')
      console.log('🔄 Você pode ter cancelado a assinatura anteriormente')
    } else {
      console.log('🎉 Tudo OK! Você deveria receber as newsletters')
      console.log('')
      console.log('💡 Possíveis causas de não receber:')
      console.log('  1. Email foi para a pasta de spam/lixo eletrônico')
      console.log('  2. Filtros do Gmail/Outlook bloquearam')
      console.log('  3. Verifique a pasta "Promoções" (Gmail)')
    }
  }
}

const email = process.argv[2] || 'ipierette@gmail.com'
checkSubscriber(email).catch(console.error)
