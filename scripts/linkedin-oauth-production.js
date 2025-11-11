#!/usr/bin/env node

const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI; // https://catbytes.site/api/linkedin/callback

// Gerar code_verifier (string aleatória de 43-128 caracteres)
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

// Gerar code_challenge (SHA256 hash do code_verifier)
function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// Gerar state aleatório
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

console.log('\n🔐 LINKEDIN OAUTH 2.0 COM PKCE (Produção)\n');
console.log('================================================\n');

if (!CLIENT_ID || !REDIRECT_URI) {
  console.error('❌ ERRO: Configure LINKEDIN_CLIENT_ID e LINKEDIN_REDIRECT_URI no .env.local');
  process.exit(1);
}

// Gerar PKCE codes
const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);
const state = generateState();

console.log('✅ Configuração:');
console.log('   Client ID:', CLIENT_ID);
console.log('   Redirect URI:', REDIRECT_URI);
console.log('\n✅ PKCE codes gerados:');
console.log('   Code Verifier:', codeVerifier);
console.log('   Code Challenge:', codeChallenge);
console.log('   State:', state);

// Scopes
const SCOPES = [
  'openid',
  'profile',
  'email',
  'w_member_social',
].join(' ');

console.log('\n✅ Scopes solicitados:');
SCOPES.split(' ').forEach(scope => console.log(`   • ${scope}`));

// Montar URL de autorização
const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('state', state);
authUrl.searchParams.set('scope', SCOPES);
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

console.log('\n🌐 URL DE AUTORIZAÇÃO:\n');
console.log(authUrl.toString());

console.log('\n\n📋 INSTRUÇÕES:\n');
console.log('1. Copie a URL acima');
console.log('2. Cole no navegador');
console.log('3. Faça login no LinkedIn (se necessário)');
console.log('4. Clique em "Allow" para autorizar');
console.log('5. Você será redirecionado para:', REDIRECT_URI);
console.log('6. A página mostrará um ERRO de "token_exchange_failed"');
console.log('7. Copie o CÓDIGO da URL (parâmetro "code")');
console.log('8. Execute o próximo comando para trocar o código pelo token\n');

console.log('⚠️  IMPORTANTE:\n');
console.log('Após autorizar, você verá um erro. Isso é ESPERADO!');
console.log('O erro acontece porque o callback não tem o code_verifier.');
console.log('Copie o "code" da URL e execute:\n');
console.log(`node scripts/linkedin-exchange-token.js <code> ${codeVerifier}\n`);

console.log('📝 SALVE O CODE_VERIFIER para o próximo passo:');
console.log('   ' + codeVerifier + '\n');
