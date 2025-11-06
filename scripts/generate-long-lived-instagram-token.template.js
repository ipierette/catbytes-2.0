/**
 * Script para gerar Instagram Long-Lived Access Token
 * Token de longa duração (60 dias) a partir do token de curta duração (2 horas)
 * 
 * INSTRUÇÕES:
 * 1. Copie este arquivo para: generate-long-lived-instagram-token.js
 * 2. Substitua 'YOUR_APP_ID' pelo seu App ID
 * 3. Substitua 'YOUR_APP_SECRET' pelo seu App Secret
 * 4. Execute: node scripts/generate-long-lived-instagram-token.js SEU_TOKEN_CURTO
 */

const SHORT_LIVED_TOKEN = process.argv[2] || process.env.INSTAGRAM_ACCESS_TOKEN

if (!SHORT_LIVED_TOKEN) {
  console.error('❌ Token não fornecido!')
  console.log('\n📖 COMO USAR:')
  console.log('node scripts/generate-long-lived-instagram-token.js SEU_TOKEN_AQUI')
  console.log('\nOu defina INSTAGRAM_ACCESS_TOKEN no .env.local')
  process.exit(1)
}

async function generateLongLivedToken() {
  try {
    console.log('🔄 Gerando Long-Lived Access Token...\n')

    // 1. Trocar token de curta duração por token de longa duração
    const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    url.searchParams.append('grant_type', 'fb_exchange_token')
    url.searchParams.append('client_id', 'YOUR_APP_ID') // ⚠️ SUBSTITUA pelo seu App ID
    url.searchParams.append('client_secret', 'YOUR_APP_SECRET') // ⚠️ SUBSTITUA pelo seu App Secret
    url.searchParams.append('fb_exchange_token', SHORT_LIVED_TOKEN)

    console.log('📡 Fazendo requisição para Facebook Graph API...')
    
    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.error) {
      console.error('❌ Erro ao gerar token:', data.error.message)
      console.log('\n💡 DICA: Certifique-se de que:')
      console.log('1. O token fornecido é válido e não expirou')
      console.log('2. O App ID e App Secret estão corretos')
      console.log('3. O App tem permissões instagram_basic, instagram_content_publish')
      return
    }

    const longLivedToken = data.access_token
    const expiresIn = data.expires_in // ~5184000 segundos (60 dias)

    console.log('✅ Long-Lived Token gerado com sucesso!\n')
    console.log('📋 COPIE ESTE TOKEN:')
    console.log('─────────────────────────────────────────────────────')
    console.log(longLivedToken)
    console.log('─────────────────────────────────────────────────────')
    console.log(`⏰ Expira em: ${Math.floor(expiresIn / 86400)} dias\n`)

    console.log('📝 Adicione ao .env.local:')
    console.log(`INSTAGRAM_ACCESS_TOKEN=${longLivedToken}\n`)

    // Salvar em arquivo temporário
    const fs = require('fs')
    const path = require('path')
    const tokenFile = path.join(__dirname, '..', '.instagram-token.txt')
    
    const tokenInfo = `
# Instagram Long-Lived Access Token
# Gerado em: ${new Date().toISOString()}
# Expira em: ~60 dias

INSTAGRAM_ACCESS_TOKEN=${longLivedToken}

# Para renovar antes de expirar, execute novamente:
# node scripts/generate-long-lived-instagram-token.js ${longLivedToken}
`
    
    fs.writeFileSync(tokenFile, tokenInfo)
    console.log(`💾 Token salvo em: ${tokenFile}`)
    console.log('   (Adicione este arquivo ao .gitignore!)\n')

    console.log('🔄 IMPORTANTE: Para renovar o token antes de expirar:')
    console.log('   Execute este script novamente usando o long-lived token atual')
    console.log('   Isso resetará o contador de 60 dias\n')

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

// Executar
generateLongLivedToken()
