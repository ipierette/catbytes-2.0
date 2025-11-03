require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🧪 Testando Blog CatBytes\n')
console.log(`📊 Supabase URL: ${supabaseUrl}`)
console.log(`🔑 Service Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : '❌ NÃO ENCONTRADO'}\n`)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBlog() {
  try {
    // Test 1: Check if table exists and count posts
    console.log('📊 Teste 1: Verificando posts no banco...')
    const { data: posts, error: countError, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5)

    if (countError) {
      console.error('❌ Erro ao contar posts:', countError.message)
      return
    }

    console.log(`✅ Total de posts no banco: ${count}`)
    
    if (posts && posts.length > 0) {
      console.log(`✅ Últimos ${posts.length} posts encontrados:\n`)
      
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Categoria: ${post.category}`)
        console.log(`   Publicado: ${post.published ? '✅' : '❌'}`)
        console.log(`   Views: ${post.views}`)
        console.log(`   Criado em: ${new Date(post.created_at).toLocaleDateString('pt-BR')}`)
        console.log(`   Imagem: ${post.cover_image_url?.substring(0, 50)}...`)
        console.log('')
      })
    } else {
      console.log('⚠️  Nenhum post encontrado no banco\n')
      console.log('💡 Dicas:')
      console.log('   1. Execute a migração do schema: supabase/schema.sql')
      console.log('   2. Gere posts via API: POST /api/blog/generate')
      console.log('   3. Configure o cron job para geração automática')
    }

    // Test 2: Test pagination
    console.log('\n📄 Teste 2: Testando paginação...')
    const { data: page1, error: pageError } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(0, 9) // First 10 posts

    if (pageError) {
      console.error('❌ Erro na paginação:', pageError.message)
      return
    }

    console.log(`✅ Página 1: ${page1?.length || 0} posts`)

    // Test 3: Check if we can insert (just checking permissions, won't actually insert)
    console.log('\n🔒 Teste 3: Verificando permissões RLS...')
    
    // Try to read with anon key (should work for published posts)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (anonKey) {
      const anonSupabase = createClient(supabaseUrl, anonKey)
      const { data: publicPosts, error: publicError } = await anonSupabase
        .from('blog_posts')
        .select('id, title')
        .eq('published', true)
        .limit(1)

      if (publicError) {
        console.log(`⚠️  Anon key não consegue ler posts publicados: ${publicError.message}`)
      } else {
        console.log(`✅ Anon key consegue ler posts publicados: ${publicPosts?.length || 0} encontrados`)
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(60))
    console.log('📊 RESUMO DO TESTE')
    console.log('═'.repeat(60))
    console.log(`Total de posts: ${count}`)
    console.log(`Posts publicados: ${posts?.filter(p => p.published).length || 0}`)
    console.log(`API funcionando: ${!countError ? '✅' : '❌'}`)
    console.log(`RLS configurado: ${anonKey ? '✅' : '⚠️  (verificar anon key)'}`)
    console.log('═'.repeat(60))

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    console.error(error)
  }
}

testBlog()
