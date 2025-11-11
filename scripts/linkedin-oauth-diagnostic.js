#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

console.log('\n🔍 DIAGNÓSTICO DO LINKEDIN OAUTH\n');
console.log('================================================\n');

console.log('📋 Configurações atuais:');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('APP_ID:', process.env.LINKEDIN_APP_ID);
console.log('CRM_ID:', process.env.LINKEDIN_CRM_ID);
console.log('REDIRECT_URI:', REDIRECT_URI);
console.log('CLIENT_SECRET:', process.env.LINKEDIN_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado');

console.log('\n📍 Verificações importantes:\n');

// Verificar se a URL de redirect está correta
const isHttps = REDIRECT_URI.startsWith('https://');
console.log('1. HTTPS na redirect URI:', isHttps ? '✅' : '❌ DEVE ser HTTPS');

// Verificar se está usando o domínio correto
const isCorrectDomain = REDIRECT_URI.includes('catbytes.site');
console.log('2. Domínio correto:', isCorrectDomain ? '✅' : '❌');

console.log('\n🔗 URLs para configurar no LinkedIn Developer Portal:\n');
console.log('Redirect URLs permitidas (adicione todas):');
console.log('  • https://catbytes.site/api/linkedin/callback');
console.log('  • http://localhost:3000/api/linkedin/callback (para desenvolvimento)');

console.log('\n📝 Scopes Básicos (FUNCIONAM SEM VERIFICAÇÃO):');
const basicScopes = [
  'openid',
  'profile',
  'email',
];
basicScopes.forEach(scope => console.log(`  ✅ ${scope}`));

console.log('\n📝 Scopes Avançados (REQUEREM VERIFICAÇÃO):');
const advancedScopes = [
  'w_member_social',        // Postar no perfil pessoal
  'w_organization_social',  // Postar em páginas - REQUER VERIFICAÇÃO
  'r_organization_social',  // Ler posts de páginas - REQUER VERIFICAÇÃO
  'rw_organization_admin'   // Gerenciar páginas - REQUER VERIFICAÇÃO
];
advancedScopes.forEach(scope => console.log(`  ⚠️  ${scope}`));

console.log('\n🌐 URL de autorização BÁSICA (use esta primeiro):');
const basicScope = basicScopes.join(' ');
const state = Math.random().toString(36).substring(7);
const basicAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent(basicScope)}`;

console.log('\n' + basicAuthUrl);

console.log('\n\n⚠️  PARA USAR SCOPES AVANÇADOS:');
console.log('1. Acesse: https://www.linkedin.com/developers/apps/' + (process.env.LINKEDIN_APP_ID || 'YOUR_APP_ID'));
console.log('2. Vá em "Products" e solicite:');
console.log('   • Share on LinkedIn');
console.log('   • Marketing Developer Platform');
console.log('3. Inicie o processo de verificação: https://www.linkedin.com/developers/apps/verification/' + (process.env.LINKEDIN_VERIFICATION_URL?.split('/').pop() || 'YOUR_APP'));
console.log('4. Aguarde aprovação (pode levar dias)');
console.log('5. Depois da aprovação, use os scopes avançados');

console.log('\n✅ COMECE AGORA COM SCOPES BÁSICOS:');
console.log('Execute: node scripts/linkedin-oauth.js');
console.log('Isso vai funcionar sem erros!\n');
