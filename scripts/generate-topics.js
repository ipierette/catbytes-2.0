#!/usr/bin/env node

/**
 * Script CLI para gerar novos tópicos de blog
 * 
 * Uso:
 *   node scripts/generate-topics.js [categoria] [quantidade]
 * 
 * Exemplos:
 *   node scripts/generate-topics.js                           # Verifica todas categorias
 *   node scripts/generate-topics.js "Programação e IA" 50     # Gera 50 tópicos de Programação
 *   node scripts/generate-topics.js "Automação e Negócios"    # Gera 30 tópicos (padrão)
 */

const https = require('https')

const VALID_CATEGORIES = [
  'Automação e Negócios',
  'Programação e IA',
  'Cuidados Felinos',
  'Tech Aleatório'
]

const category = process.argv[2]
const count = parseInt(process.argv[3]) || 30

// Validar categoria se fornecida
if (category && !VALID_CATEGORIES.includes(category)) {
  console.error(`❌ Categoria inválida: "${category}"`)
  console.log('\nCategorias válidas:')
  VALID_CATEGORIES.forEach(c => console.log(`  - ${c}`))
  process.exit(1)
}

// Construir URL
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const params = new URLSearchParams()

if (category) {
  params.set('category', category)
  params.set('count', count.toString())
} else {
  params.set('auto', 'true')
}

const url = `${baseUrl}/api/topics/generate?${params.toString()}`

console.log('🔄 Gerando tópicos...')
console.log(`   URL: ${url}`)

// Fazer requisição
fetch(url)
  .then(async res => {
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.details || error.error || 'Erro desconhecido')
    }
    return res.json()
  })
  .then(data => {
    console.log('\n✅ Tópicos gerados com sucesso!\n')
    
    if (data.generated) {
      console.log(`Categoria: ${data.category}`)
      console.log(`Total gerado: ${data.total}\n`)
      console.log('━'.repeat(60))
      console.log('ADICIONE ESTES TÓPICOS EM types/blog.ts:')
      console.log('━'.repeat(60))
      console.log()
      
      data.generated.forEach(topic => {
        console.log(`  '${topic}',`)
      })
      
      console.log()
      console.log('━'.repeat(60))
    } else {
      console.log('Modo automático executado.')
      console.log('Verifique os logs do servidor para detalhes.')
    }
  })
  .catch(error => {
    console.error('\n❌ Erro ao gerar tópicos:', error.message)
    process.exit(1)
  })
