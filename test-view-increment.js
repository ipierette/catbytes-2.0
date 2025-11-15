require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testando incremento de visualizações...')
console.log('Supabase URL:', supabaseUrl)
console.log('Service Role Key configurado:', !!serviceRoleKey)

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testViewIncrement() {
  try {
    // 1. Buscar um post real
    console.log('\n1️⃣ Buscando post mais recente...')
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, slug, title, views')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Erro ao buscar post:', fetchError)
      return
    }
    
    if (!posts || posts.length === 0) {
      console.error('❌ Nenhum post encontrado')
      return
    }
    
    const post = posts[0]
    console.log('✅ Post encontrado:')
    console.log('   ID:', post.id)
    console.log('   Slug:', post.slug)
    console.log('   Título:', post.title)
    console.log('   Views atuais:', post.views)
    
    // 2. Testar incremento
    console.log('\n2️⃣ Testando incremento de views...')
    const { data: rpcData, error: rpcError } = await supabase.rpc('increment_post_views', {
      post_id: post.id
    })
    
    if (rpcError) {
      console.error('❌ Erro ao incrementar views:', rpcError)
      console.error('   Code:', rpcError.code)
      console.error('   Message:', rpcError.message)
      console.error('   Details:', rpcError.details)
      return
    }
    
    console.log('✅ RPC executado com sucesso')
    console.log('   Retorno:', rpcData)
    
    // 3. Verificar se incrementou
    console.log('\n3️⃣ Verificando se views foram incrementadas...')
    const { data: updatedPosts, error: verifyError } = await supabase
      .from('blog_posts')
      .select('views')
      .eq('id', post.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Erro ao verificar:', verifyError)
      return
    }
    
    console.log('✅ Views após incremento:', updatedPosts.views)
    console.log('   Diferença:', updatedPosts.views - post.views)
    
    if (updatedPosts.views > post.views) {
      console.log('\n🎉 SUCESSO! As views estão sendo incrementadas corretamente!')
    } else {
      console.log('\n⚠️  PROBLEMA! As views não foram incrementadas!')
    }
    
  } catch (err) {
    console.error('\n❌ Erro inesperado:', err)
  }
}

testViewIncrement()
