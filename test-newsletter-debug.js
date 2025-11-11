// Script de debug para testar newsletter
const { supabaseAdmin } = require('./lib/supabase')

async function debugNewsletter() {
  if (!supabaseAdmin) {
    console.error('❌ supabaseAdmin não configurado')
    return
  }

  console.log('🔍 Verificando assinantes da newsletter...')
  
  // Buscar todos os assinantes
  const { data: allSubscribers, error: allError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, locale, confirmed, verified, subscribed')

  if (allError) {
    console.error('❌ Erro ao buscar assinantes:', allError)
    return
  }

  console.log(`📊 Total de assinantes: ${allSubscribers?.length || 0}`)
  
  // Contar por locale
  const byLocale = allSubscribers?.reduce((acc, sub) => {
    acc[sub.locale] = (acc[sub.locale] || 0) + 1
    return acc
  }, {})
  
  console.log('📍 Por locale:', byLocale)
  
  // Contar confirmados por locale
  const confirmedByLocale = allSubscribers
    ?.filter(sub => sub.confirmed || sub.verified)
    ?.reduce((acc, sub) => {
      acc[sub.locale] = (acc[sub.locale] || 0) + 1
      return acc
    }, {})
  
  console.log('✅ Confirmados por locale:', confirmedByLocale)
  
  // Buscar especificamente EN-US ativos
  const { data: enUsSubscribers, error: enUsError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, confirmed, verified, subscribed, created_at')
    .eq('locale', 'en-US')
    .eq('confirmed', true) // ou verified, dependendo do campo que você usa

  if (enUsError) {
    console.error('❌ Erro ao buscar assinantes EN-US:', enUsError)
  } else {
    console.log(`🇺🇸 Assinantes EN-US confirmados: ${enUsSubscribers?.length || 0}`)
    enUsSubscribers?.forEach((sub, i) => {
      console.log(`  ${i+1}. ${sub.email} (criado: ${sub.created_at})`)
    })
  }

  // Verificar a estrutura da tabela
  console.log('\n🔍 Verificando estrutura da tabela...')
  const { data: sample, error: sampleError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*')
    .limit(1)

  if (sample && sample.length > 0) {
    console.log('📋 Campos disponíveis:', Object.keys(sample[0]))
    console.log('📝 Exemplo de registro:', sample[0])
  }
}

debugNewsletter().catch(console.error)