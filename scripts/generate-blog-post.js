require('dotenv').config({ path: '.env.local' })

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

console.log('🤖 Gerando post de blog com IA...\n')
console.log(`📍 URL: ${baseUrl}/api/blog/generate\n`)

async function generatePost() {
  try {
    console.log('⏳ Iniciando geração (pode levar 30-60 segundos)...\n')

    const response = await fetch(`${baseUrl}/api/blog/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Opcional: você pode especificar tema, categoria e keywords
        // topic: 'Como a IA está revolucionando o atendimento ao cliente',
        // category: 'Inteligência Artificial',
        // keywords: ['IA', 'chatbot', 'atendimento', 'automação']
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erro na geração:', errorData)
      return
    }

    const data = await response.json()

    if (data.success) {
      console.log('✅ Post gerado com sucesso!\n')
      console.log('═'.repeat(60))
      console.log('📝 DETALHES DO POST')
      console.log('═'.repeat(60))
      console.log(`Título: ${data.post.title}`)
      console.log(`Slug: ${data.post.slug}`)
      console.log(`Categoria: ${data.post.category}`)
      console.log(`Tags: ${data.post.tags.join(', ')}`)
      console.log(`Keywords: ${data.post.keywords.join(', ')}`)
      console.log(`\nExcerto:\n${data.post.excerpt}`)
      console.log(`\nImagem de capa: ${data.post.cover_image_url.substring(0, 60)}...`)
      console.log(`\nConteúdo (primeiros 300 chars):\n${data.post.content.substring(0, 300)}...\n`)
      console.log('═'.repeat(60))
      console.log('⏱️  PERFORMANCE')
      console.log('═'.repeat(60))
      console.log(`Tempo de geração: ${(data.generationTime / 1000).toFixed(2)}s`)
      console.log(`Modelo de texto: ${data.metadata.model}`)
      console.log(`Modelo de imagem: ${data.metadata.imageModel}`)
      console.log(`Tópico usado: ${data.metadata.topic}`)
      console.log('═'.repeat(60))
      console.log(`\n🌐 Ver post: ${baseUrl}/pt-BR/blog\n`)
    } else {
      console.error('❌ Falha na geração:', data.error)
      if (data.details) {
        console.error('Detalhes:', data.details)
      }
    }
  } catch (error) {
    console.error('❌ Erro ao fazer requisição:', error.message)
  }
}

generatePost()
