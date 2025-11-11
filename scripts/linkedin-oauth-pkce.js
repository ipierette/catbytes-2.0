#!/usr/bin/env node

const crypto = require('crypto');
const http = require('http');
const url = require('url');
require('dotenv').config({ path: '.env.local' });

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const REDIRECT_URI = 'http://localhost:3000/linkedin/callback'; // Localhost para PKCE
const PORT = 3000;

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

console.log('\n🔐 LINKEDIN OAUTH 2.0 COM PKCE\n');
console.log('================================================\n');

// Gerar PKCE codes
const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);
const state = generateState();

console.log('✅ PKCE codes gerados:');
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

// Montar URL de autorização
const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('state', state);
authUrl.searchParams.set('scope', SCOPES);
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

console.log('\n🌐 URL de autorização:\n');
console.log(authUrl.toString());

console.log('\n\n🚀 Iniciando servidor local na porta', PORT, '...\n');

// Criar servidor HTTP local para receber o callback
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/linkedin/callback') {
    const { code, state: returnedState, error, error_description } = parsedUrl.query;
    
    // Verificar erro
    if (error) {
      console.error('\n❌ Erro na autorização:', error);
      console.error('   Descrição:', error_description);
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <head><title>Erro - LinkedIn OAuth</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">❌ Erro na Autorização</h1>
            <p><strong>Erro:</strong> ${error}</p>
            <p><strong>Descrição:</strong> ${error_description || 'N/A'}</p>
            <p>Feche esta janela e tente novamente.</p>
          </body>
        </html>
      `);
      
      server.close();
      process.exit(1);
    }
    
    // Verificar state
    if (returnedState !== state) {
      console.error('\n❌ ERRO: State parameter não coincide!');
      console.error('   Esperado:', state);
      console.error('   Recebido:', returnedState);
      
      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <head><title>Erro de Segurança</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">❌ Erro de Segurança (CSRF)</h1>
            <p>O parâmetro 'state' não coincide. Possível ataque CSRF.</p>
            <p>Feche esta janela e tente novamente.</p>
          </body>
        </html>
      `);
      
      server.close();
      process.exit(1);
    }
    
    console.log('\n✅ State validado com sucesso!');
    console.log('✅ Authorization code recebido:', code?.substring(0, 20) + '...');
    
    // Trocar code por access token
    console.log('\n📡 Trocando authorization code por access token...\n');
    
    try {
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier, // PKCE code verifier
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Erro ao obter token:', errorText);
        throw new Error(errorText);
      }
      
      const tokenData = await tokenResponse.json();
      
      console.log('✅ Access Token obtido com sucesso!');
      console.log('\n📋 TOKENS:\n');
      console.log('LINKEDIN_ACCESS_TOKEN=' + tokenData.access_token);
      if (tokenData.refresh_token) {
        console.log('LINKEDIN_REFRESH_TOKEN=' + tokenData.refresh_token);
      }
      console.log('\n⏰ Expira em:', tokenData.expires_in, 'segundos (', Math.floor(tokenData.expires_in / 86400), 'dias )');
      
      // Obter informações do usuário
      console.log('\n👤 Obtendo informações do usuário...\n');
      
      const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      let userInfo = null;
      if (userInfoResponse.ok) {
        userInfo = await userInfoResponse.json();
        console.log('✅ Informações do usuário obtidas!');
        console.log('   Nome:', userInfo.name);
        console.log('   Email:', userInfo.email);
        console.log('   Sub (Person URN):', userInfo.sub);
        console.log('\nLINKEDIN_PERSON_URN=' + userInfo.sub);
      }
      
      // Página de sucesso
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <head>
            <title>✅ LinkedIn OAuth - Sucesso!</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                padding: 20px;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                max-width: 800px;
                width: 100%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              }
              h1 {
                color: #0077b5;
                display: flex;
                align-items: center;
                gap: 12px;
              }
              .token-box {
                background: #1e293b;
                color: #e2e8f0;
                padding: 16px;
                border-radius: 8px;
                margin: 12px 0;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                word-break: break-all;
                position: relative;
              }
              .token-label {
                color: #94a3b8;
                font-size: 11px;
                margin-bottom: 8px;
                text-transform: uppercase;
              }
              .copy-btn {
                position: absolute;
                top: 12px;
                right: 12px;
                background: #3b82f6;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
              }
              .copy-btn:hover { background: #2563eb; }
              .copy-btn.copied { background: #10b981; }
              .info-box {
                background: #f0f9ff;
                border-left: 4px solid #0ea5e9;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>
                <span style="font-size: 32px;">✅</span>
                Autenticação Concluída!
              </h1>
              
              ${userInfo ? `
              <div class="info-box">
                <h3 style="margin-top: 0;">👤 Usuário Autenticado</h3>
                <p><strong>Nome:</strong> ${userInfo.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${userInfo.email || 'N/A'}</p>
              </div>
              ` : ''}
              
              <div class="token-box">
                <div class="token-label">LINKEDIN_ACCESS_TOKEN</div>
                <button class="copy-btn" onclick="copyToken('access_token', this)">Copiar</button>
                <div id="access_token">${tokenData.access_token}</div>
              </div>
              
              ${userInfo?.sub ? `
              <div class="token-box">
                <div class="token-label">LINKEDIN_PERSON_URN</div>
                <button class="copy-btn" onclick="copyToken('person_urn', this)">Copiar</button>
                <div id="person_urn">${userInfo.sub}</div>
              </div>
              ` : ''}
              
              <div class="info-box">
                <h3 style="margin-top: 0;">📝 Próximos Passos</h3>
                <ol>
                  <li>Copie os tokens acima usando os botões "Copiar"</li>
                  <li>Abra o arquivo <code>.env.local</code></li>
                  <li>Cole os valores nas variáveis correspondentes</li>
                  <li>Salve o arquivo</li>
                  <li>Reinicie o servidor de desenvolvimento</li>
                </ol>
                <p style="margin-top: 16px;">
                  <strong>⏰ Validade:</strong> ${Math.floor(tokenData.expires_in / 86400)} dias
                </p>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                Você pode fechar esta janela e voltar ao terminal.
              </p>
            </div>
            
            <script>
              function copyToken(tokenId, btn) {
                const element = document.getElementById(tokenId);
                const text = element.textContent;
                
                navigator.clipboard.writeText(text).then(() => {
                  const originalText = btn.textContent;
                  btn.textContent = '✓ Copiado!';
                  btn.classList.add('copied');
                  
                  setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                  }, 2000);
                });
              }
            </script>
          </body>
        </html>
      `);
      
      console.log('\n✅ Processo concluído! Você pode fechar o navegador.\n');
      console.log('📋 Copie os tokens acima e adicione ao .env.local\n');
      
      // Fechar servidor após 5 segundos
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 5000);
      
    } catch (error) {
      console.error('\n❌ Erro ao trocar token:', error.message);
      
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <head><title>Erro</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">❌ Erro ao Obter Token</h1>
            <p>${error.message}</p>
            <p>Veja o terminal para mais detalhes.</p>
          </body>
        </html>
      `);
      
      server.close();
      process.exit(1);
    }
  }
});

server.listen(PORT, () => {
  console.log('✅ Servidor rodando em http://localhost:' + PORT);
  console.log('\n📋 INSTRUÇÕES:\n');
  console.log('1. Copie a URL de autorização acima');
  console.log('2. Cole no navegador');
  console.log('3. Faça login e autorize o aplicativo');
  console.log('4. Você será redirecionado de volta automaticamente');
  console.log('5. Os tokens serão exibidos aqui no terminal e no navegador\n');
  console.log('⏳ Aguardando autorização...\n');
});

// Timeout de 5 minutos
setTimeout(() => {
  console.log('\n⏱️  Timeout: Nenhuma autorização recebida em 5 minutos.');
  server.close();
  process.exit(0);
}, 5 * 60 * 1000);
