/**
 * Teste Manual do Cron de Token Check
 * Execute: node test-token-check.js
 */

const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-here'
const BASE_URL = 'https://catbytes.site'

async function testTokenCheck() {
  console.log('🧪 Testando Cron de Token Check...\n')
  console.log('URL:', `${BASE_URL}/api/cron/check-instagram-token`)
  console.log('Auth:', `Bearer ${CRON_SECRET.substring(0, 10)}...`)
  console.log('')

  try {
    const response = await fetch(`${BASE_URL}/api/cron/check-instagram-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    })

    console.log('📡 Status:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('\n📦 Resposta:')
    console.log(JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('\n✅ Teste bem-sucedido!')
      
      if (data.daysRemaining !== undefined) {
        console.log(`\n⏰ Token expira em: ${data.daysRemaining} dias`)
        console.log(`📅 Data de expiração: ${data.expiryDate}`)
      }
    } else {
      console.log('\n❌ Teste falhou!')
    }

  } catch (error) {
    console.error('\n💥 Erro ao testar:', error.message)
  }
}

// Verificar histórico
async function checkHistory() {
  console.log('\n\n📜 Verificando Histórico de Execuções...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/cron/history?limit=5&type=token-check`)
    
    if (!response.ok) {
      console.log('❌ Não foi possível acessar histórico (pode precisar autenticação)')
      return
    }

    const data = await response.json()
    
    if (data.success && data.logs) {
      console.log(`✅ Total de execuções: ${data.stats.total}`)
      console.log(`✅ Sucessos: ${data.stats.success}`)
      console.log(`❌ Falhas: ${data.stats.failed}`)
      
      if (data.logs.length > 0) {
        console.log('\n🔍 Últimas execuções:')
        data.logs.forEach((log, i) => {
          const date = new Date(log.executed_at)
          console.log(`  ${i + 1}. ${log.status} - ${date.toLocaleString('pt-BR')}`)
        })
      } else {
        console.log('\n⚠️ Nenhuma execução registrada ainda')
      }
    }
  } catch (error) {
    console.error('Erro ao buscar histórico:', error.message)
  }
}

// Executar testes
testTokenCheck()
  .then(() => checkHistory())
  .catch(err => console.error('Erro:', err))
