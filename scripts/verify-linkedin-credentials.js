#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET

console.log('\n🔍 VALIDAÇÃO DAS CREDENCIAIS LINKEDIN\n')
console.log('================================================\n')

console.log('Client ID:', CLIENT_ID)
console.log('Client Secret:', CLIENT_SECRET)

// Verificar se as credenciais estão no formato correto
const isClientIdValid = CLIENT_ID && CLIENT_ID.length > 10
const isClientSecretValid = CLIENT_SECRET && CLIENT_SECRET.startsWith('WPL_AP1.')

console.log('\n✅ Validações:')
console.log('   Client ID válido:', isClientIdValid ? '✅' : '❌')
console.log('   Client Secret válido:', isClientSecretValid ? '✅' : '❌')
console.log('   Formato do Secret:', CLIENT_SECRET?.startsWith('WPL_AP1.') ? 'Correto (Secondary)' : '❌ Formato inválido')

if (!isClientIdValid || !isClientSecretValid) {
  console.log('\n❌ ERRO: Credenciais inválidas!')
  console.log('\n📝 Verifique no LinkedIn Developer Portal:')
  console.log('   https://www.linkedin.com/developers/apps/229099098/auth')
  console.log('\n   Configure o SECONDARY Client Secret no .env.local')
  process.exit(1)
}

console.log('\n✅ Credenciais parecem estar corretas!')
console.log('\n📋 Próximo passo: Execute o script de autenticação:')
console.log('   node scripts/linkedin-auth-simple.js\n')
