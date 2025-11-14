#!/usr/bin/env node

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

// Argumentos da linha de comando
const authCode = process.argv[2];

console.log('\n🔄 TROCAR CÓDIGO POR ACCESS TOKEN\n');
console.log('================================================\n');

if (!authCode) {
  console.error('❌ ERRO: Você precisa fornecer o código de autorização\n');
  console.log('Uso:');
  console.log('  node scripts/linkedin-exchange-token.mjs <authorization_code>\n');
  console.log('Exemplo:');
  console.log('  node scripts/linkedin-exchange-token.mjs AQQi42pdpoTMrO3_grA4qBg2...\n');
  process.exit(1);
}

console.log('✅ Authorization Code:', authCode.substring(0, 30) + '...');
console.log('✅ Client ID:', CLIENT_ID);
console.log('✅ Redirect URI:', REDIRECT_URI);
console.log('\n📡 Enviando requisição ao LinkedIn...\n');

// Fazer requisição para trocar código por token
try {
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro ao trocar código por token:');
    console.error(errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      console.error('\n📋 Detalhes do erro:');
      console.error('   Error:', errorJson.error);
      console.error('   Description:', errorJson.error_description);
    } catch (e) {
      // Não é JSON
    }
    
    process.exit(1);
  }

  const tokenData = await response.json();

  console.log('✅ SUCCESS! Access Token obtido com sucesso!\n');
  console.log('================================================\n');
  console.log('📋 ADICIONE ESTAS VARIÁVEIS AO SEU .env.local:\n');
  console.log('LINKEDIN_ACCESS_TOKEN=' + tokenData.access_token);
  
  if (tokenData.refresh_token) {
    console.log('LINKEDIN_REFRESH_TOKEN=' + tokenData.refresh_token);
  }
  
  console.log('\n⏰ Validade do Token:');
  console.log('   Expira em:', tokenData.expires_in, 'segundos');
  console.log('   Equivalente a:', Math.floor(tokenData.expires_in / 86400), 'dias');
  console.log('   Data de expiração:', new Date(Date.now() + tokenData.expires_in * 1000).toLocaleString('pt-BR'));

  // Obter informações do usuário
  console.log('\n👤 Obtendo informações do usuário...\n');

  const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  });

  if (userInfoResponse.ok) {
    const userInfo = await userInfoResponse.json();
    console.log('✅ Informações do usuário obtidas!');
    console.log('   Nome:', userInfo.name);
    console.log('   Email:', userInfo.email);
    console.log('   Sub (Person URN):', userInfo.sub);
    
    console.log('\nLINKEDIN_PERSON_URN=' + userInfo.sub);
  } else {
    console.log('⚠️  Não foi possível obter informações do usuário');
  }

  console.log('\n================================================\n');
  console.log('✅ PROCESSO CONCLUÍDO!\n');
  console.log('📝 Próximos passos:');
  console.log('   1. Copie as variáveis acima');
  console.log('   2. Abra o arquivo .env.local');
  console.log('   3. Cole/atualize os valores');
  console.log('   4. Salve o arquivo');
  console.log('   5. Reinicie o servidor de desenvolvimento\n');

} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
