/**
 * Script para migrar tópicos do blog.ts para o Supabase
 * Com geração de embeddings para detecção de similaridade
 */

import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'
import 'dotenv/config'

const BLOG_TOPICS = {
  'Automação e Negócios': [
    // Copiar do blog.ts...
  ],
  'Programação e IA': [
    // ...
  ],
  'Cuidados Felinos': [
    // ...
  ],
  'Tech Aleatório': [
    // ...
  ]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('❌ Erro ao gerar embedding:', error.message)
    return null
  }
}

async function migrateTopics() {
  console.log('🚀 Iniciando migração de tópicos para o banco de dados...\n')

  let totalInserted = 0
  let totalErrors = 0

  for (const [category, topics] of Object.entries(BLOG_TOPICS)) {
    console.log(`\n📂 Categoria: ${category}`)
    console.log(`   Total de tópicos: ${topics.length}`)

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      
      process.stdout.write(`   [${i + 1}/${topics.length}] ${topic.substring(0, 50)}... `)

      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('blog_topics')
          .select('id')
          .eq('topic', topic)
          .eq('category', category)
          .single()

        if (existing) {
          console.log('⏭️  já existe')
          continue
        }

        // Gerar embedding
        const embedding = await generateEmbedding(topic)

        if (!embedding) {
          console.log('❌ erro no embedding')
          totalErrors++
          continue
        }

        // Inserir no banco
        const { error } = await supabase
          .from('blog_topics')
          .insert({
            topic,
            category,
            status: 'available',
            embedding,
            source: 'imported',
            approved: true,
            approved_at: new Date().toISOString()
          })

        if (error) {
          console.log(`❌ ${error.message}`)
          totalErrors++
        } else {
          console.log('✅')
          totalInserted++
        }

        // Rate limit da OpenAI (3000 RPM)
        await new Promise(resolve => setTimeout(resolve, 50))

      } catch (error) {
        console.log(`❌ ${error.message}`)
        totalErrors++
      }
    }
  }

  console.log('\n\n📊 RESUMO DA MIGRAÇÃO:')
  console.log(`   ✅ Tópicos inseridos: ${totalInserted}`)
  console.log(`   ❌ Erros: ${totalErrors}`)
  console.log(`   📈 Total processado: ${totalInserted + totalErrors}`)

  // Calcular similaridades
  console.log('\n\n🔍 Calculando similaridades entre tópicos...')
  
  const { data: similarityResult, error: similarityError } = await supabase
    .rpc('calculate_topic_similarities', { p_threshold: 0.85 })

  if (similarityError) {
    console.error('❌ Erro ao calcular similaridades:', similarityError)
  } else {
    console.log(`✅ ${similarityResult} pares de tópicos similares detectados`)
  }

  // Estatísticas finais
  console.log('\n\n📈 ESTATÍSTICAS POR CATEGORIA:')
  
  const { data: stats } = await supabase
    .from('blog_topics_stats')
    .select('*')

  if (stats) {
    console.table(stats)
  }

  console.log('\n✨ Migração concluída com sucesso!')
}

// Executar
migrateTopics().catch(console.error)
