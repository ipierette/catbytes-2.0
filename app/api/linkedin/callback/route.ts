import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Se houver erro na autorização
    if (error) {
      console.error('❌ Erro na autorização LinkedIn:', error, errorDescription)
      return NextResponse.json(
        { 
          error: 'authorization_failed', 
          message: errorDescription || error 
        },
        { status: 400 }
      )
    }

    // Se não recebeu o código
    if (!code) {
      return NextResponse.json(
        { error: 'missing_code', message: 'Código de autorização não fornecido' },
        { status: 400 }
      )
    }

    console.log('✅ Código de autorização recebido:', code.substring(0, 20) + '...')
    console.log('✅ State recebido:', state)

    // NOTA: Para PKCE, o code_verifier deve ser fornecido
    // Como não temos o code_verifier aqui (ele foi gerado no script),
    // vamos mostrar uma mensagem útil para o usuário
    
    // Tentar trocar o código pelo access token (vai falhar sem code_verifier)
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
        // code_verifier não está disponível aqui - deve ser fornecido no script
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('❌ Erro ao trocar código por token (esperado sem code_verifier):', errorData)
      
      // Mostrar página com instruções para usar o código manualmente
      const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LinkedIn OAuth - Código de Autorização</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
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
              max-width: 900px;
              width: 100%;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 {
              color: #0077b5;
              margin-top: 0;
            }
            .code-box {
              background: #1e293b;
              color: #e2e8f0;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
              font-size: 14px;
              word-break: break-all;
              position: relative;
            }
            .code-label {
              color: #94a3b8;
              font-size: 12px;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .copy-btn {
              position: absolute;
              top: 16px;
              right: 16px;
              background: #3b82f6;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 13px;
            }
            .copy-btn:hover { background: #2563eb; }
            .copy-btn.copied { background: #10b981; }
            .instructions {
              background: #f0f9ff;
              border-left: 4px solid #0ea5e9;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .terminal-command {
              background: #1e293b;
              color: #10b981;
              padding: 12px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              margin: 10px 0;
              overflow-x: auto;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid: #f59e0b;
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Autorização LinkedIn Concluída!</h1>
            
            <div class="instructions">
              <h3 style="margin-top: 0;">📋 Código de Autorização Recebido</h3>
              <p>O LinkedIn retornou o código de autorização com sucesso! Agora você precisa trocá-lo por um Access Token usando o script no terminal.</p>
            </div>

            <div class="code-box">
              <div class="code-label">Authorization Code</div>
              <button class="copy-btn" onclick="copyCode('auth_code', this)">Copiar</button>
              <div id="auth_code">${code}</div>
            </div>

            ${state ? `
            <div class="code-box">
              <div class="code-label">State Parameter</div>
              <button class="copy-btn" onclick="copyCode('state_param', this)">Copiar</button>
              <div id="state_param">${state}</div>
            </div>
            ` : ''}

            <div class="instructions">
              <h3 style="margin-top: 0;">🚀 Próximos Passos</h3>
              <ol>
                <li>Copie o <strong>Authorization Code</strong> acima (clique no botão "Copiar")</li>
                <li>Volte para o terminal onde você executou o script</li>
                <li>Você verá o <strong>code_verifier</strong> que foi gerado</li>
                <li>Execute o comando de troca de token fornecido</li>
              </ol>
              
              <p><strong>Exemplo do comando:</strong></p>
              <div class="terminal-command">
                node scripts/linkedin-exchange-token.js ${code.substring(0, 20)}... SEU_CODE_VERIFIER
              </div>
              
              <p style="margin-top: 16px;">
                Substitua <code>SEU_CODE_VERIFIER</code> pelo valor que foi mostrado no terminal quando você executou o script inicial.
              </p>
            </div>

            <div class="warning">
              <h3 style="margin-top: 0; color: #92400e;">⚠️ Importante</h3>
              <ul style="margin: 8px 0; padding-left: 20px; color: #78350f;">
                <li>O código de autorização expira rapidamente (alguns minutos)</li>
                <li>Você só pode usá-lo UMA vez</li>
                <li>O code_verifier está no terminal onde você iniciou o processo</li>
              </ul>
            </div>
          </div>

          <script>
            function copyCode(elementId, btn) {
              const element = document.getElementById(elementId);
              const text = element.textContent;
              
              navigator.clipboard.writeText(text).then(() => {
                const originalText = btn.textContent;
                btn.textContent = '✓ Copiado!';
                btn.classList.add('copied');
                
                setTimeout(() => {
                  btn.textContent = originalText;
                  btn.classList.remove('copied');
                }, 2000);
              }).catch(err => {
                alert('Erro ao copiar. Selecione e copie manualmente.');
              });
            }
          </script>
        </body>
        </html>
      `
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Tokens recebidos com sucesso!')
    console.log('📋 Access Token:', tokenData.access_token?.substring(0, 30) + '...')
    console.log('📋 Expires in:', tokenData.expires_in, 'segundos')
    if (tokenData.refresh_token) {
      console.log('📋 Refresh Token:', tokenData.refresh_token?.substring(0, 30) + '...')
    }

    // Obter informações do usuário
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    let userInfo = null
    if (userInfoResponse.ok) {
      userInfo = await userInfoResponse.json()
      console.log('✅ Informações do usuário:', userInfo)
    }

    // Retornar página HTML com os tokens
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LinkedIn OAuth - Sucesso</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
            margin-top: 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .success-icon {
            width: 32px;
            height: 32px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
          }
          .info-box {
            background: #f8fafc;
            border-left: 4px solid #0077b5;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .token-box {
            background: #1e293b;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            margin: 12px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            word-break: break-all;
            position: relative;
          }
          .token-label {
            color: #94a3b8;
            font-size: 12px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
            font-size: 12px;
            transition: background 0.2s;
          }
          .copy-btn:hover {
            background: #2563eb;
          }
          .copy-btn.copied {
            background: #10b981;
          }
          .instructions {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .instructions h3 {
            margin-top: 0;
            color: #92400e;
          }
          .instructions ol {
            margin: 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
            color: #78350f;
          }
          code {
            background: #1e293b;
            color: #e2e8f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
          }
          .user-info {
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
            <div class="success-icon">✓</div>
            Autenticação LinkedIn Concluída!
          </h1>

          ${userInfo ? `
          <div class="user-info">
            <h3 style="margin-top: 0; color: #0369a1;">👤 Informações do Usuário</h3>
            <p><strong>Nome:</strong> ${userInfo.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${userInfo.email || 'N/A'}</p>
            <p><strong>Sub:</strong> ${userInfo.sub || 'N/A'}</p>
          </div>
          ` : ''}

          <div class="info-box">
            <p><strong>✅ Tokens obtidos com sucesso!</strong></p>
            <p>Validade do Access Token: <strong>${Math.floor(tokenData.expires_in / 3600)} horas</strong></p>
          </div>

          <div class="token-box">
            <div class="token-label">LINKEDIN_ACCESS_TOKEN</div>
            <button class="copy-btn" onclick="copyToken('access_token', this)">Copiar</button>
            <div id="access_token">${tokenData.access_token}</div>
          </div>

          ${tokenData.refresh_token ? `
          <div class="token-box">
            <div class="token-label">LINKEDIN_REFRESH_TOKEN</div>
            <button class="copy-btn" onclick="copyToken('refresh_token', this)">Copiar</button>
            <div id="refresh_token">${tokenData.refresh_token}</div>
          </div>
          ` : ''}

          ${userInfo?.sub ? `
          <div class="token-box">
            <div class="token-label">LINKEDIN_PERSON_URN</div>
            <button class="copy-btn" onclick="copyToken('person_urn', this)">Copiar</button>
            <div id="person_urn">${userInfo.sub}</div>
          </div>
          ` : ''}

          <div class="instructions">
            <h3>📝 Próximos Passos:</h3>
            <ol>
              <li>Copie os tokens acima clicando nos botões "Copiar"</li>
              <li>Abra o arquivo <code>.env.local</code> do seu projeto</li>
              <li>Cole os valores correspondentes nas variáveis de ambiente</li>
              <li>Salve o arquivo e reinicie o servidor de desenvolvimento</li>
            </ol>
          </div>

          <div class="info-box">
            <p><strong>⚠️ Importante:</strong></p>
            <p>• O Access Token expira em ${Math.floor(tokenData.expires_in / 3600)} horas</p>
            <p>• Mantenha estes tokens em segurança no arquivo .env.local</p>
            <p>• Nunca compartilhe ou commite os tokens no git</p>
          </div>
        </div>

        <script>
          function copyToken(tokenId, btn) {
            const tokenElement = document.getElementById(tokenId);
            const text = tokenElement.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
              const originalText = btn.textContent;
              btn.textContent = '✓ Copiado!';
              btn.classList.add('copied');
              
              setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
              }, 2000);
            }).catch(err => {
              console.error('Erro ao copiar:', err);
              alert('Erro ao copiar. Por favor, selecione e copie manualmente.');
            });
          }
        </script>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('❌ Erro no callback do LinkedIn:', error)
    return NextResponse.json(
      { 
        error: 'internal_error', 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    )
  }
}
