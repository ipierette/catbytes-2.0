#!/usr/bin/env node

/**
 * Script para gerar novo token do LinkedIn
 * Gera URL de autorização OAuth 2.0 corretamente formatada
 */

require('dotenv').config({ path: '.env.local' })
const crypto = require('crypto')

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'https://catbytes.site/api/linkedin/callback'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ LINKEDIN_CLIENT_ID ou LINKEDIN_CLIENT_SECRET não encontrados no .env.local')
  process.exit(1)
}

// Gerar state aleatório para segurança CSRF
const state = 'catbytes-' + crypto.randomBytes(8).toString('hex')

// Escopo necessário para publicar posts
const scopes = 'w_member_social'

console.log('\n' + '='.repeat(70))
console.log('🚀 GERADOR DE TOKEN DO LINKEDIN - CatBytes')
console.log('='.repeat(70))

console.log('\n📋 CONFIGURAÇÕES DETECTADAS:')
console.log('   Client ID:     ' + CLIENT_ID)
console.log('   Redirect URI:  ' + REDIRECT_URI)
console.log('   Escopo:        ' + scopes + ' (publicar posts)')
console.log('   State:         ' + state)

// Construir URL usando URLSearchParams para encoding correto
const params = new URLSearchParams({
  response_type: 'code',
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  scope: scopes,
  state: state
})

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`

console.log('\n' + '='.repeat(70))
console.log('🔗 URL DE AUTORIZAÇÃO (COPIE E COLE NO NAVEGADOR)')
console.log('='.repeat(70))
console.log('\n' + authUrl + '\n')
console.log('='.repeat(70))

console.log('\n📝 PASSO A PASSO:')
console.log('\n1️⃣  Copie a URL acima')
console.log('\n2️⃣  Cole no navegador e faça login no LinkedIn')
console.log('\n3️⃣  Autorize o aplicativo "CatBytes" a postar em seu perfil')
console.log('\n4️⃣  Após autorizar, você será redirecionado para:')
console.log('   ' + REDIRECT_URI)
console.log('\n5️⃣  A página exibirá o ACCESS TOKEN automaticamente')
console.log('\n6️⃣  Copie o token e cole no .env.local:')
console.log('   LINKEDIN_ACCESS_TOKEN=AQUIRk...')
console.log('\n7️⃣  Teste a publicação no painel admin/linkedin')

console.log('\n' + '='.repeat(70))
console.log('⚠️  IMPORTANTE: ')
console.log('='.repeat(70))
console.log('• O token expira em ~60 dias')
console.log('• Quando expirar, execute este script novamente')
console.log('• O redirect_uri deve estar cadastrado no LinkedIn Developer App')
console.log('• Verifique se sua aplicação tem o escopo "Share on LinkedIn"')
console.log('='.repeat(70) + '\n')
