/**
 * Recalcular similaridades entre tópicos
 */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente faltando!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🔍 Recalculando similaridades entre tópicos...\n')
  
  const { data, error } = await supabase.rpc('calculate_topic_similarities', {
    p_threshold: 0.85
  })
  
  if (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
  
  console.log(`✅ ${data} pares de tópicos similares detectados!\n`)
  
  // Mostrar stats
  const { data: stats } = await supabase
    .from('blog_topic_similarity_blocks')
    .select('similarity_score')
  
  if (stats && stats.length > 0) {
    const scores = stats.map(s => s.similarity_score)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const max = Math.max(...scores)
    const min = Math.min(...scores)
    
    console.log('📊 Estatísticas de Similaridade:')
    console.log(`   Total de bloqueios: ${stats.length}`)
    console.log(`   Média: ${avg.toFixed(3)}`)
    console.log(`   Máxima: ${max.toFixed(3)}`)
    console.log(`   Mínima: ${min.toFixed(3)}`)
  }
}

main().catch(console.error)
