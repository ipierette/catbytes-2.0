require('dotenv').config({ path: '.env.local' })

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Tópicos específicos para gerar
const topics = [
  'Chatbots com IA: Como Revolucionar o Atendimento ao Cliente',
  '5 Tendências de Desenvolvimento Web para 2025',
  'Automação Inteligente: Como Reduzir Custos Operacionais',
  'PWA: O Futuro das Aplicações Mobile',
]

console.log(`🤖 Gerando ${topics.length} posts de blog...\n`)

async function generateMultiplePosts() {
  const results = []

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i]
    console.log(`\n[${i + 1}/${topics.length}] 📝 Gerando: "${topic}"`)
    console.log('⏳ Aguarde 30-60 segundos...')

    try {
      const response = await fetch(`${baseUrl}/api/blog/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`❌ Erro: ${errorData.error}`)
        results.push({ topic, success: false, error: errorData.error })
        continue
      }

      const data = await response.json()

      if (data.success) {
        console.log(`✅ Sucesso! Título: "${data.post.title}"`)
        console.log(`   ⏱️  Tempo: ${(data.generationTime / 1000).toFixed(2)}s`)
        console.log(`   🏷️  Categoria: ${data.post.category}`)
        results.push({
          topic,
          success: true,
          title: data.post.title,
          slug: data.post.slug,
          time: data.generationTime,
        })
      } else {
        console.error(`❌ Falha: ${data.error}`)
        results.push({ topic, success: false, error: data.error })
      }

      // Pequeno delay entre requisições para não sobrecarregar a API
      if (i < topics.length - 1) {
        console.log('   ⏸️  Aguardando 3 segundos antes do próximo...')
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    } catch (error) {
      console.error(`❌ Erro na requisição: ${error.message}`)
      results.push({ topic, success: false, error: error.message })
    }
  }

  // Resumo final
  console.log('\n' + '═'.repeat(70))
  console.log('📊 RESUMO DA GERAÇÃO')
  console.log('═'.repeat(70))

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log(`✅ Posts criados: ${successful.length}/${topics.length}`)
  console.log(`❌ Falhas: ${failed.length}`)

  if (successful.length > 0) {
    const avgTime = successful.reduce((sum, r) => sum + (r.time || 0), 0) / successful.length
    console.log(`⏱️  Tempo médio: ${(avgTime / 1000).toFixed(2)}s`)
  }

  console.log('\n📝 Posts criados:')
  successful.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.title}`)
    console.log(`      Slug: ${r.slug}`)
  })

  if (failed.length > 0) {
    console.log('\n❌ Falhas:')
    failed.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.topic}`)
      console.log(`      Erro: ${r.error}`)
    })
  }

  console.log('\n🌐 Ver todos os posts: ' + `${baseUrl}/pt-BR/blog`)
  console.log('═'.repeat(70))
}

generateMultiplePosts()
