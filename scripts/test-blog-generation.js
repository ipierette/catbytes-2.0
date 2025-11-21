#!/usr/bin/env node

/**
 * Script de teste para APIs de geração de artigos
 * Testa: /api/blog/topics/unique e /api/blog/generate
 */

require('dotenv').config({ path: '.env.local' })

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

async function testTopicsAPI() {
  console.log('🎯 Testando API de Tópicos Únicos\n')
  console.log('=' .repeat(60))
  
  const categories = [
    'Automação e Negócios',
    'Programação e IA',
    'Cuidados Felinos',
    'Tech Aleatório'
  ]
  
  for (const category of categories) {
    console.log(`\n📂 Categoria: ${category}`)
    console.log('-'.repeat(60))
    
    try {
      const url = `${BASE_URL}/api/blog/topics/unique?category=${encodeURIComponent(category)}&similarity_threshold=0.85&recent_days=90`
      console.log(`🔗 URL: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log('✅ Tópico único encontrado:')
        console.log(`   ID: ${data.topic.id}`)
        console.log(`   Texto: "${data.topic.text}"`)
        console.log(`   Vezes usado: ${data.topic.times_used}`)
        console.log(`   Prioridade: ${data.topic.priority}`)
        console.log(`   Tags: ${data.topic.tags.join(', ') || 'nenhuma'}`)
      } else {
        console.log(`❌ Erro: ${data.error || 'Resposta inválida'}`)
        if (data.availableCount !== undefined) {
          console.log(`   Tópicos disponíveis: ${data.availableCount}`)
        }
      }
    } catch (error) {
      console.error(`❌ Erro na requisição: ${error.message}`)
    }
  }
}

async function testBlogGeneration(textOnly = true) {
  console.log('\n\n🚀 Testando Geração de Artigo')
  console.log('=' .repeat(60))
  console.log(`Modo: ${textOnly ? 'Texto apenas (rápido)' : 'Texto + Imagem (completo)'}`)
  
  try {
    const url = `${BASE_URL}/api/blog/generate`
    console.log(`🔗 URL: ${url}`)
    console.log('⏳ Enviando requisição (pode levar 30-60 segundos)...\n')
    
    const startTime = Date.now()
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        textOnly,
        generateOnly: false  // true = não salva no banco
      })
    })
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    console.log(`⏱️  Tempo de resposta: ${duration}s\n`)
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Artigo gerado com sucesso!')
      console.log('─'.repeat(60))
      console.log(`📝 Título: ${data.post.title}`)
      console.log(`🔗 Slug: ${data.post.slug}`)
      console.log(`📂 Categoria: ${data.post.category}`)
      console.log(`🎯 Tópico usado: "${data.topicUsed || 'N/A'}"`)
      console.log(`🆔 Topic ID: ${data.topicId || 'N/A'}`)
      console.log(`📊 Palavras: ${data.post.content?.split(' ').length || 0}`)
      console.log(`🌐 Tradução EN: ${data.translationCreated ? '✅' : '❌'}`)
      console.log(`📧 Newsletter enviada: ${data.newsletterSent ? '✅' : '❌'}`)
      console.log(`🔍 Google indexing: ${data.googleIndexing ? '✅' : '❌'}`)
      
      if (data.imageGeneration) {
        console.log(`🖼️  Imagem gerada: ${data.imageGeneration.success ? '✅' : '❌'}`)
      }
      
      if (data.socialPromotion) {
        console.log(`📱 Promoção social: ${data.socialPromotion.success ? '✅' : '❌'}`)
        if (data.socialPromotion.platforms) {
          console.log(`   Plataformas: ${data.socialPromotion.platforms.join(', ')}`)
        }
      }
      
      console.log(`\n🔗 URL PT: ${BASE_URL}/pt-BR/blog/${data.post.slug}`)
      if (data.translationCreated && data.translationSlug) {
        console.log(`🔗 URL EN: ${BASE_URL}/en-US/blog/${data.translationSlug}`)
      }
    } else {
      console.log('❌ Erro na geração:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Erro: ${data.error || 'Erro desconhecido'}`)
      if (data.details) {
        console.log(`   Detalhes: ${data.details}`)
      }
      if (data.suggestion) {
        console.log(`   💡 Sugestão: ${data.suggestion}`)
      }
    }
  } catch (error) {
    console.error(`❌ Erro na requisição: ${error.message}`)
  }
}

async function testMarkTopicAsUsed(topicId) {
  console.log('\n\n✓ Testando Marcar Tópico como Usado')
  console.log('=' .repeat(60))
  
  try {
    const url = `${BASE_URL}/api/blog/topics/mark-used`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topicId })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log(`✅ Tópico ${topicId} marcado como usado`)
      console.log(`   Vezes usado: ${data.timesUsed}`)
    } else {
      console.log(`❌ Erro: ${data.error}`)
    }
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`)
  }
}

async function main() {
  console.log('\n🧪 TESTE COMPLETO DAS APIs DE GERAÇÃO DE ARTIGOS')
  console.log('=' .repeat(60))
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Data/Hora: ${new Date().toLocaleString('pt-BR')}`)
  console.log('\n')
  
  const args = process.argv.slice(2)
  const mode = args[0] || 'topics'
  
  if (mode === 'all' || mode === 'topics') {
    await testTopicsAPI()
  }
  
  if (mode === 'all' || mode === 'generate') {
    await testBlogGeneration(true)  // textOnly = true (rápido)
  }
  
  if (mode === 'full') {
    await testBlogGeneration(false)  // Com imagem
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('✅ Testes concluídos!')
  console.log('\nUso:')
  console.log('  node scripts/test-blog-generation.js topics    # Testa só tópicos')
  console.log('  node scripts/test-blog-generation.js generate  # Testa geração (texto)')
  console.log('  node scripts/test-blog-generation.js all       # Testa tudo')
  console.log('  node scripts/test-blog-generation.js full      # Geração completa (texto + imagem)')
  console.log('')
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error)
  process.exit(1)
})
