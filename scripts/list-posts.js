require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listPosts() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, category, created_at, views')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('❌ Erro:', error.message)
      return
    }
    
    console.log('📚 Posts do Blog (ordem decrescente - mais recente primeiro):\n')
    console.log(`Total de posts: ${posts.length}\n`)
    
    posts.forEach((post, index) => {
      const date = new Date(post.created_at).toLocaleString('pt-BR')
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   📁 Categoria: ${post.category}`)
      console.log(`   📅 Criado em: ${date}`)
      console.log(`   👁️  Visualizações: ${post.views}`)
      console.log(`   🆔 ID: ${post.id.substring(0, 8)}...`)
      console.log('')
    })
    
    console.log('✅ Posts listados com sucesso!')
    console.log('\n💡 O post no topo é o mais recente e deve aparecer primeiro na home!')
  } catch (err) {
    console.error('❌ Erro:', err.message)
  }
}

listPosts()
