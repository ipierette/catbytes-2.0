#!/usr/bin/env node
import { config } from 'dotenv';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

// Carrega variáveis de ambiente
config({ path: envPath });

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = 'prj_r2yfhb3atlkKSxfMmDs0AqSN43fi'; // ID do projeto catbytes-portfolio2.0

/**
 * Atualiza o token no arquivo .env.local
 */
function updateLocalEnv(newToken, expiryDate) {
  try {
    let envContent = readFileSync(envPath, 'utf8');
    
    // Substitui o token atual
    envContent = envContent.replace(
      /LINKEDIN_ACCESS_TOKEN=.*/,
      `LINKEDIN_ACCESS_TOKEN=${newToken} # expira em ${expiryDate}`
    );
    
    writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Token atualizado em .env.local');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar .env.local:', error.message);
    return false;
  }
}

/**
 * Atualiza o token no Vercel (Production, Preview e Development)
 */
async function updateVercelToken(newToken) {
  try {
    const environments = ['production', 'preview', 'development'];
    const results = [];

    for (const env of environments) {
      const response = await fetch(
        `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'LINKEDIN_ACCESS_TOKEN',
            value: newToken,
            type: 'encrypted',
            target: [env],
          }),
        }
      );

      if (!response.ok) {
        // Se já existe, tenta atualizar
        const envVars = await fetch(
          `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env`,
          {
            headers: {
              'Authorization': `Bearer ${VERCEL_TOKEN}`,
            },
          }
        ).then(r => r.json());

        const existingVar = envVars.envs?.find(
          e => e.key === 'LINKEDIN_ACCESS_TOKEN' && e.target.includes(env)
        );

        if (existingVar) {
          // Deleta o antigo
          await fetch(
            `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env/${existingVar.id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${VERCEL_TOKEN}`,
              },
            }
          );

          // Cria o novo
          const createResponse = await fetch(
            `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${VERCEL_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                key: 'LINKEDIN_ACCESS_TOKEN',
                value: newToken,
                type: 'encrypted',
                target: [env],
              }),
            }
          );

          results.push({
            env,
            success: createResponse.ok,
          });
        }
      } else {
        results.push({
          env,
          success: true,
        });
      }
    }

    const allSuccess = results.every(r => r.success);
    if (allSuccess) {
      console.log('✅ Token atualizado na Vercel em todos os ambientes');
    } else {
      console.warn('⚠️  Token atualizado parcialmente na Vercel:', results);
    }
    
    return allSuccess;
  } catch (error) {
    console.error('❌ Erro ao atualizar Vercel:', error.message);
    return false;
  }
}

/**
 * Troca o código de autorização por um access token
 */
async function exchangeCodeForToken(authCode) {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: LINKEDIN_REDIRECT_URI,
    });

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao trocar código: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in, // 5184000 segundos (60 dias)
    };
  } catch (error) {
    console.error('❌ Erro na troca do código:', error.message);
    return null;
  }
}

/**
 * Calcula a data de expiração
 */
function getExpiryDate(expiresIn) {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + expiresIn * 1000);
  return expiryDate.toLocaleDateString('pt-BR');
}

/**
 * Processo principal de renovação
 */
async function renewToken(authCode) {
  console.log('🔄 Iniciando renovação do token LinkedIn...\n');

  // 1. Trocar código por token
  console.log('1️⃣  Trocando código de autorização...');
  const tokenData = await exchangeCodeForToken(authCode);
  
  if (!tokenData) {
    console.error('❌ Falha ao obter novo token');
    process.exit(1);
  }

  const expiryDate = getExpiryDate(tokenData.expiresIn);
  console.log(`✅ Novo token obtido (expira em ${expiryDate})\n`);

  // 2. Atualizar .env.local
  console.log('2️⃣  Atualizando .env.local...');
  const localUpdated = updateLocalEnv(tokenData.accessToken, expiryDate);
  
  if (!localUpdated) {
    console.error('❌ Falha ao atualizar .env.local');
    process.exit(1);
  }

  // 3. Atualizar Vercel
  console.log('\n3️⃣  Atualizando Vercel...');
  const vercelUpdated = await updateVercelToken(tokenData.accessToken);
  
  if (!vercelUpdated) {
    console.warn('⚠️  Falha ao atualizar Vercel (mas .env.local foi atualizado)');
  }

  console.log('\n🎉 Renovação completa!');
  console.log(`📅 Novo token válido até: ${expiryDate}`);
  console.log('💡 Próxima renovação sugerida: ' + getExpiryDate(tokenData.expiresIn - 7 * 24 * 60 * 60)); // 7 dias antes
}

// Execução
const authCode = process.argv[2];

if (!authCode) {
  console.error('❌ Código de autorização não fornecido');
  console.log('\nUso:');
  console.log('  node scripts/renew-linkedin-token.mjs <AUTHORIZATION_CODE>');
  console.log('\nPara obter o código, execute:');
  console.log('  node scripts/linkedin-oauth-complete.js');
  process.exit(1);
}

renewToken(authCode);
