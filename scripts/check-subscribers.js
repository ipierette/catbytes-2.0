require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSubscribers() {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, name, locale, verified, subscribed')
    
    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }
    
    console.log('📧 Assinantes da newsletter:')
    console.log('Total:', data.length)
    console.log('\nLista:')
    data.forEach(sub => {
      const status = sub.verified && sub.subscribed ? '✅ Ativo' : '⏳ Pendente'
      console.log(`${status} - ${sub.email} (${sub.name || 'Sem nome'}) - Locale: ${sub.locale}`)
    })
    
    const verified = data.filter(s => s.verified && s.subscribed)
    console.log(`\n✅ Assinantes verificados que recebem emails: ${verified.length}`)
    
    if (verified.length === 0) {
      console.log('\n⚠️  Nenhum assinante verificado! Você precisa:')
      console.log('1. Se inscrever na newsletter pelo site')
      console.log('2. Clicar no link de verificação no email')
    }
  } catch (err) {
    console.error('❌ Erro:', err.message)
  }
}

checkSubscribers()
