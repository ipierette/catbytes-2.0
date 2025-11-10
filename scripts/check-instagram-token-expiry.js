/**
 * Script para verificar validade do token Instagram
 * Usa a API do Facebook para debug do token
 */

require('dotenv').config({ path: '.env.local' })

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN

if (!TOKEN) {
  console.error('❌ INSTAGRAM_ACCESS_TOKEN não encontrado')
  process.exit(1)
}

async function checkTokenExpiry() {
  try {
    console.log('🔍 Verificando token Instagram...\n')

    // Tenta obter informações do usuário (se o token estiver válido, funciona)
    const userUrl = `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${TOKEN}`
    
    const userResponse = await fetch(userUrl)
    const userData = await userResponse.json()

    if (userData.error) {
      console.error('❌ Token inválido ou expirado!')
      console.error('Erro:', userData.error.message)
      console.log('\n🔄 Você precisa gerar um novo token.')
      console.log('\n📝 Como gerar novo token:')
      console.log('1. Acesse: https://developers.facebook.com/tools/explorer/')
      console.log('2. Selecione seu App')
      console.log('3. Gere um token com permissões: instagram_basic, instagram_content_publish')
      console.log('4. Clique em "Extend Access Token" para obter token de 60 dias')
      return
    }

    console.log('✅ Token VÁLIDO!')
    console.log(`\n📊 Informações da Conta:`)
    console.log(`─────────────────────────────────`)
    console.log(`✓ Username: @${userData.username}`)
    console.log(`✓ Account Type: ${userData.account_type}`)
    console.log(`✓ ID: ${userData.id}`)

    console.log(`\n⚠️  IMPORTANTE:`)
    console.log(`─────────────────────────────────`)
    console.log(`Como o token atual está funcionando, mas não conseguimos verificar`)
    console.log(`a data exata de expiração via API, você tem 2 opções:\n`)
    
    console.log(`OPÇÃO 1 - Definir data estimada (se lembra quando gerou):`)
    console.log(`   → Acesse /admin/settings`)
    console.log(`   → Clique em "Definir Data de Expiração"`)
    console.log(`   → O sistema contará 60 dias a partir de hoje\n`)
    
    console.log(`OPÇÃO 2 - Gerar token novo e configurar (recomendado):`)
    console.log(`   1. Acesse: https://developers.facebook.com/tools/explorer/`)
    console.log(`   2. Selecione seu App Instagram`)
    console.log(`   3. Gere novo User Token com permissões necessárias`)
    console.log(`   4. Clique em "Extend Access Token" (ícone de 🔧)`)
    console.log(`   5. Copie o novo token (válido por 60 dias)`)
    console.log(`   6. Atualize em /admin/settings`)
    console.log(`   7. Clique em "Definir Data de Expiração"\n`)

    const todayPlus60 = new Date()
    todayPlus60.setDate(todayPlus60.getDate() + 60)
    console.log(`📅 Se você gerar um novo token HOJE, expirará em:`)
    console.log(`   ${todayPlus60.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    })}`)
    console.log(`\n   Data ISO: ${todayPlus60.toISOString()}`)

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

checkTokenExpiry()
