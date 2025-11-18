/**
 * Script de Emergência - Forçar Execução do Cron AGORA
 * Executa localmente todas as tarefas que o cron faria
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY

console.log('🚨 EXECUÇÃO MANUAL DO CRON - TERÇA-FEIRA')
console.log('=========================================\n')

async function main() {
  // Verificar variáveis
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_KEY) {
    console.error('❌ Variáveis de ambiente faltando!')
    console.error('Verifique: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY')
    process.exit(1)
  }

  console.log('✅ Variáveis de ambiente OK\n')
  console.log('📝 Gerando artigo do blog...')
  console.log('Tema: Automação e Negócios (terça-feira)\n')

  try {
    const response = await fetch('http://localhost:3000/api/blog/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: 'Automação e Negócios',
        topic: 'Como pequenas empresas estão usando IA para competir com grandes corporações em 2025'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }

    const data = await response.json()

    if (data.success) {
      console.log('\n✅✅✅ ARTIGO GERADO COM SUCESSO!\n')
      console.log('📰 Título:', data.post.title)
      console.log('🔗 Slug:', data.post.slug)
      console.log('📅 Criado em:', new Date(data.post.created_at).toLocaleString('pt-BR'))
      console.log('\n📱 Divulgação Social:')
      
      if (data.socialPromotion?.attempted) {
        if (data.socialPromotion.successes?.length > 0) {
          console.log('  ✅ Publicado em:', data.socialPromotion.successes.join(', '))
        }
        if (data.socialPromotion.failures?.length > 0) {
          console.log('  ❌ Falhou em:', data.socialPromotion.failures.join(', '))
        }
      } else {
        console.log('  ⚠️ Não tentou divulgar:', data.socialPromotion?.reason || 'Unknown')
      }

      console.log('\n⏱️  Tempo de geração:', data.generationTime, 'ms')
      console.log('\n🎉 MISSÃO CUMPRIDA! Artigo de terça-feira gerado.\n')
      
      return data
    } else {
      throw new Error(data.error || 'Geração falhou')
    }

  } catch (error) {
    console.error('\n❌ ERRO NA GERAÇÃO:')
    console.error(error.message)
    console.error('\n💡 Possíveis causas:')
    console.error('  - Servidor Next.js não está rodando (execute: npm run dev)')
    console.error('  - OpenAI API key inválida')
    console.error('  - Supabase não configurado')
    console.error('  - Timeout (geração demora ~60-90s)')
    process.exit(1)
  }
}

// Executar
main().then(() => {
  console.log('✅ Script finalizado')
  process.exit(0)
}).catch(err => {
  console.error('💥 Erro fatal:', err)
  process.exit(1)
})
