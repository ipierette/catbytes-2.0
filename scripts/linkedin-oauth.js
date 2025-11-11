require('dotenv').config({ path: '.env.local' })

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI
const STATE = Math.random().toString(36).substring(7)

// Escopos básicos que geralmente são aprovados
// IMPORTANTE: Para usar w_organization_social, você precisa:
// 1. Adicionar o produto "Share on LinkedIn" no LinkedIn Developers
// 2. Verificar sua aplicação
// 3. Associar a página da empresa ao app

// Para começar, use apenas os escopos básicos:
const SCOPES = [
  'openid',
  'profile',
  'email',
  // Descomente abaixo APENAS DEPOIS de adicionar "Share on LinkedIn" e verificar o app:
  // 'w_member_social', // Permite postar no perfil pessoal
  // 'r_organization_social', // Ler posts da organização (requer verificação)
  // 'w_organization_social', // Postar em nome da organização (requer verificação)
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
