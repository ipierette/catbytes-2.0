require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Verificando dados no Supabase...\n')
console.log('URL:', supabaseUrl ? '✅' : '❌')
console.log('Key:', supabaseKey ? '✅' : '❌')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  // Contar registros em cada tabela
  const { count: pageViewsCount } = await supabase
    .from('analytics_page_views')
    .select('*', { count: 'exact', head: true })
  
  const { count: blogViewsCount } = await supabase
    .from('analytics_blog_views')
    .select('*', { count: 'exact', head: true })
  
  const { count: eventsCount } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })

  console.log('\n📊 Total de registros:')
  console.log('  - analytics_page_views:', pageViewsCount)
  console.log('  - analytics_blog_views:', blogViewsCount)
  console.log('  - analytics_events:', eventsCount)

  // Buscar últimos 5 registros
  const { data: recentPages } = await supabase
    .from('analytics_page_views')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(5)

  console.log('\n📄 Últimas 5 page views:')
  if (recentPages?.length > 0) {
    recentPages.forEach(pv => {
      console.log(`  - ${pv.page} (${pv.timestamp})`)
    })
  } else {
    console.log('  (nenhum registro)')
  }

  const { data: recentBlogs } = await supabase
    .from('analytics_blog_views')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(5)

  console.log('\n📖 Últimas 5 blog views:')
  if (recentBlogs?.length > 0) {
    recentBlogs.forEach(bv => {
      console.log(`  - ${bv.post_slug} (${bv.read_time_seconds}s, ${bv.timestamp})`)
    })
  } else {
    console.log('  (nenhum registro)')
  }

  // Verificar Google Analytics config
  console.log('\n🔧 Configuração Google Analytics:')
  console.log('  - GOOGLE_ANALYTICS_PROPERTY_ID:', process.env.GOOGLE_ANALYTICS_PROPERTY_ID ? '✅ Configurado' : '❌ Não configurado')
  console.log('  - GOOGLE_ANALYTICS_CREDENTIALS:', process.env.GOOGLE_ANALYTICS_CREDENTIALS ? '✅ Configurado' : '❌ Não configurado')
}

checkData().catch(console.error)
