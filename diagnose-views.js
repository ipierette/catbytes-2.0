require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function diagnoseViews() {
  console.log('\n🔍 DIAGNÓSTICO COMPLETO DE VISUALIZAÇÕES\n')
  console.log('=' .repeat(60))
  
  // 1. Buscar posts recentes
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, views, created_at')
    .gte('created_at', '2025-11-15T00:00:00')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }

  console.log('\n📊 POSTS RECENTES (últimas 24h):\n')
  
  for (const post of posts) {
    console.log(`\n📄 ${post.title}`)
    console.log(`   ID: ${post.id}`)
    console.log(`   Slug: ${post.slug}`)
    console.log(`   Views no DB: ${post.views}`)
    console.log(`   Criado em: ${new Date(post.created_at).toLocaleString('pt-BR')}`)
    
    // Verificar analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics_blog_views')
      .select('*')
      .eq('post_id', post.id)
    
    if (!analyticsError && analytics) {
      console.log(`   📈 Registros de analytics: ${analytics.length}`)
      
      // Agrupar por visitante único
      const uniqueVisitors = new Set(analytics.map(a => a.visitor_id || a.session_id))
      console.log(`   👤 Visitantes únicos: ${uniqueVisitors.size}`)
      
      // Mostrar últimos 3 acessos
      const recent = analytics
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
      
      console.log(`   🕐 Últimos acessos:`)
      recent.forEach((a, idx) => {
        const time = new Date(a.created_at).toLocaleString('pt-BR')
        console.log(`      ${idx + 1}. ${time} - Tempo: ${a.read_time_seconds || 0}s`)
      })
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('\n🔧 POSSÍVEIS PROBLEMAS:\n')
  
  console.log('1. ❌ PostModal não usa header "x-increment-views"')
  console.log('   → Busca dados em cache (60s) sem incrementar')
  console.log('   → Card mostra valor antigo\n')
  
  console.log('2. ✅ ViewCounter usa header correto')
  console.log('   → Incrementa na página individual')
  console.log('   → Página mostra valor correto\n')
  
  console.log('3. ⚠️  Cache da API de listagem')
  console.log('   → /api/blog/posts tem revalidate=10')
  console.log('   → Cards podem estar 10s desatualizados\n')
  
  console.log('4. ⚠️  Cache da API individual')
  console.log('   → /api/blog/posts/[slug] sem header tem cache de 60s')
  console.log('   → Modal pode mostrar valor antigo\n')
  
  console.log('=' .repeat(60))
  console.log('\n💡 SOLUÇÃO:\n')
  console.log('Opção 1: PostModal NÃO deve incrementar views (remover fetch)')
  console.log('Opção 2: PostModal deve usar header x-increment-views')
  console.log('Opção 3: Reduzir cache para 0 (sem cache)\n')
}

diagnoseViews().catch(console.error)
