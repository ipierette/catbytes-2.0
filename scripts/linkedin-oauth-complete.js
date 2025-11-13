#!/usr/bin/env node

/**
 * Script completo para obter tokens do LinkedIn com escopo w_member_social
 * Este é o único escopo necessário para publicar no LinkedIn
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

// Gerar state para segurança
const state = crypto.randomBytes(16).toString('hex')

// Escopo necessário para postar
const scopes = 'w_member_social'

console.log('🚀 LinkedIn OAuth - Share on LinkedIn')
console.log('=' .repeat(60))
console.log('\n📋 Escopo solicitado:')
console.log('   • w_member_social - Publicar posts no LinkedIn')
console.log('\n✅ Este escopo permite postar como perfil pessoal e como página')

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent(scopes)}`

console.log('\n' + '='.repeat(60))
console.log('🔗 URL DE AUTORIZAÇÃO')
console.log('='.repeat(60))
console.log('\n' + authUrl)
console.log('\n' + '='.repeat(60))

console.log('\n📝 INSTRUÇÕES:')
console.log('\n1️⃣  Copie a URL acima e abra no navegador')

console.log('\n2️⃣  Autorize o aplicativo no LinkedIn')

console.log('\n3️⃣  Você será redirecionado para:', REDIRECT_URI)
console.log('   A página mostrará o access token')

console.log('\n4️⃣  Copie o token e cole no .env.local:')
console.log('   LINKEDIN_ACCESS_TOKEN=...')

console.log('\n5️⃣  Execute o script para obter os URNs:')
console.log('   node scripts/get-linkedin-urns.js')

console.log('\n' + '='.repeat(60))
console.log('💾 State gerado para esta sessão:', state)
console.log('='.repeat(60))
console.log('\n')
