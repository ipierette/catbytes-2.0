require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI
const STATE = Math.random().toString(36).substring(7)

// Escopos básicos que geralmente são aprovados
// Você pode adicionar mais escopos conforme necessário no LinkedIn Developers
const SCOPES = [
  'openid',
  'profile',
  'email',
].join(' ')

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
  `response_type=code&` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `state=${STATE}&` +
  `scope=${encodeURIComponent(SCOPES)}`

console.log('\n🔗 URL de Autorização do LinkedIn:\n')
console.log(authUrl)
console.log('\n📋 Copie esta URL e cole no navegador para autorizar o aplicativo.')
console.log('✅ Após autorizar, você será redirecionado para a página de callback com os tokens.\n')
