#!/usr/bin/env node

/**
 * Script completo para obter tokens do LinkedIn com todos os escopos necessários
 * Inclui: profile, email, w_member_social, openid
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

// Escopos necessários para postar e obter informações do perfil
const scopes = [
  'profile',           // Informações do perfil
  'email',            // Email do usuário
  'openid',           // OpenID Connect (necessário para userinfo)
  'w_member_social'   // Postar como perfil pessoal
].join(' ')

console.log('🚀 LinkedIn OAuth - Configuração Completa')
console.log('=' .repeat(60))
console.log('\n📋 Escopos solicitados:')
console.log('   • profile - Informações do perfil')
console.log('   • email - Email do usuário')
console.log('   • openid - Acesso ao userinfo endpoint')
console.log('   • w_member_social - Publicar posts')
console.log('\n⚠️  IMPORTANTE: Estes escopos devem estar configurados no LinkedIn Developers')

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent(scopes)}`

console.log('\n' + '='.repeat(60))
console.log('🔗 URL DE AUTORIZAÇÃO')
console.log('='.repeat(60))
console.log('\n' + authUrl)
console.log('\n' + '='.repeat(60))

console.log('\n📝 INSTRUÇÕES:')
console.log('\n1️⃣  ANTES de abrir a URL, verifique no LinkedIn Developers:')
console.log('   https://www.linkedin.com/developers/apps/' + process.env.LINKEDIN_APP_ID)
console.log('   → Aba "Products" → Certifique-se que está selecionado:')
console.log('      ✓ Sign In with LinkedIn using OpenID Connect')
console.log('      ✓ Share on LinkedIn')

console.log('\n2️⃣  Verifique na aba "Auth" → OAuth 2.0 scopes:')
console.log('      ✓ profile')
console.log('      ✓ email')
console.log('      ✓ openid')
console.log('      ✓ w_member_social')

console.log('\n3️⃣  Copie a URL acima e abra no navegador')

console.log('\n4️⃣  Autorize o aplicativo')

console.log('\n5️⃣  Você será redirecionado para:', REDIRECT_URI)
console.log('   A página mostrará o access token e o person URN')

console.log('\n6️⃣  Copie os valores e cole no .env.local:')
console.log('   LINKEDIN_ACCESS_TOKEN=...')
console.log('   LINKEDIN_PERSON_URN=...')

console.log('\n' + '='.repeat(60))
console.log('💾 State gerado para esta sessão:', state)
console.log('='.repeat(60))

console.log('\n✨ Após obter o token, execute:')
console.log('   node scripts/get-linkedin-urns.js')
console.log('\n')
