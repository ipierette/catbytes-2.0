#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI

// Validar configurações
if (!CLIENT_ID || !REDIRECT_URI) {
  console.error('❌ Erro: LINKEDIN_CLIENT_ID e LINKEDIN_REDIRECT_URI devem estar configurados no .env.local')
  process.exit(1)
}

console.log('\n🔐 AUTENTICAÇÃO LINKEDIN - CONFIGURAÇÃO VERIFICADA\n')
console.log('================================================\n')

console.log('✅ Client ID:', CLIENT_ID)
console.log('✅ Redirect URI:', REDIRECT_URI)
console.log('✅ Client Secret:', process.env.LINKEDIN_CLIENT_SECRET ? 'Configurado (Secondary)' : '❌ NÃO CONFIGURADO')

// Scopes básicos que funcionam com "Share on LinkedIn" product
const SCOPES = [
  'openid',
  'profile', 
  'email',
  'w_member_social', // Permite postar no perfil pessoal (disponível com Share on LinkedIn)
].join(' ')

// Gerar state simples e fixo para evitar problema de modificação
const STATE = 'catbytes_auth_' + Date.now()

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}&scope=${encodeURIComponent(SCOPES)}`

console.log('\n📝 Scopes solicitados:')
SCOPES.split(' ').forEach(scope => {
  console.log(`   • ${scope}`)
})

console.log('\n🌐 URL DE AUTORIZAÇÃO:\n')
console.log(authUrl)

console.log('\n\n📋 INSTRUÇÕES:\n')
console.log('1. Copie a URL acima')
console.log('2. Cole no navegador')
console.log('3. Faça login no LinkedIn (se necessário)')
console.log('4. Clique em "Allow" para autorizar')
console.log('5. Você será redirecionado para a página com os tokens')
console.log('6. Copie os tokens e atualize o .env.local\n')

console.log('⚠️  IMPORTANTE: Configure o Secondary Client Secret no .env.local')
console.log('   (disponível em: https://www.linkedin.com/developers/apps/229099098/auth)\n')

console.log('✅ Com "Share on LinkedIn" ativo, você pode:')
console.log('   • Autenticar usuários (openid, profile, email)')
console.log('   • Postar no perfil pessoal (w_member_social)')
console.log('\n❌ Para postar em PÁGINAS de empresa (w_organization_social):')
console.log('   • É necessário ter o produto "Marketing Developer Platform"')
console.log('   • E passar pelo processo de verificação do app\n')
