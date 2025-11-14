#!/usr/bin/env node

/**
 * Script de OAuth do LinkedIn com Sign In with LinkedIn
 * 
 * Scopes incluídos:
 * - openid: Autenticação básica
 * - profile: Acesso ao perfil (nome, foto, etc.)
 * - email: Acesso ao email
 * - w_member_social: Postar no perfil pessoal
 * 
 * IMPORTANTE: Certifique-se de ter adicionado o produto "Sign In with LinkedIn using OpenID Connect"
 * no painel de desenvolvedores: https://www.linkedin.com/developers/apps
 */

require('dotenv').config({ path: '.env.local' })
const crypto = require('crypto')

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!')
  console.error('\nVerifique se seu .env.local contém:')
  console.error('  LINKEDIN_CLIENT_ID=...')
  console.error('  LINKEDIN_CLIENT_SECRET=...')
  console.error('  LINKEDIN_REDIRECT_URI=...')
  process.exit(1)
}

// Gerar state aleatório para segurança
const STATE = crypto.randomBytes(16).toString('hex')

// Scopes com Sign In with LinkedIn
const SCOPES = [
  'openid',           // Requerido para Sign In
  'profile',          // Dados do perfil (nome, foto, sub)
  'email',            // Email do usuário
  'w_member_social'   // Postar no LinkedIn
].join(' ')

console.log('\n' + '='.repeat(70))
console.log('🔐 LINKEDIN OAUTH - SIGN IN WITH LINKEDIN')
console.log('='.repeat(70))

console.log('\n📋 Configurações:')
console.log(`   Client ID: ${CLIENT_ID}`)
console.log(`   Redirect URI: ${REDIRECT_URI}`)
console.log(`   Scopes: ${SCOPES}`)
console.log(`   State: ${STATE}`)

// URL de autorização
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
  `response_type=code&` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `state=${STATE}&` +
  `scope=${encodeURIComponent(SCOPES)}`

console.log('\n' + '='.repeat(70))
console.log('🔗 URL DE AUTORIZAÇÃO')
console.log('='.repeat(70))
console.log('\n' + authUrl + '\n')

console.log('='.repeat(70))
console.log('📖 INSTRUÇÕES')
console.log('='.repeat(70))

console.log(`
1️⃣  ANTES DE CONTINUAR, verifique no LinkedIn Developers:
   → https://www.linkedin.com/developers/apps/${CLIENT_ID}/auth
   
   ✅ Produto adicionado: "Sign In with LinkedIn using OpenID Connect"
   ✅ Produto adicionado: "Share on LinkedIn"
   ✅ Redirect URL cadastrada: ${REDIRECT_URI}

2️⃣  Copie a URL acima e cole no navegador

3️⃣  Faça login no LinkedIn e autorize o aplicativo

4️⃣  Você será redirecionado para: ${REDIRECT_URI}?code=...&state=...

5️⃣  Copie o CÓDIGO (parâmetro "code") da URL

6️⃣  Execute: node scripts/linkedin-exchange-token.js [CÓDIGO_COPIADO]

⚠️  IMPORTANTE: O código expira em 30 minutos!
`)

console.log('='.repeat(70))

// Salvar state em arquivo temporário para validação posterior
const fs = require('fs')
const path = require('path')
const stateFile = path.join(__dirname, '.oauth-state.tmp')
fs.writeFileSync(stateFile, STATE)
console.log('\n💾 State salvo em:', stateFile)
console.log('   (Será usado para validar o callback)\n')
