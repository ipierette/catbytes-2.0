import { NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID!;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET!;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI!;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const VERCEL_PROJECT_ID = 'prj_r2yfhb3atlkKSxfMmDs0AqSN43fi';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

/**
 * Atualiza o token no arquivo .env.local
 */
function updateLocalEnv(newToken: string, expiryDate: string): boolean {
  try {
    const envPath = join(process.cwd(), '.env.local');
    let envContent = readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(
      /LINKEDIN_ACCESS_TOKEN=.*/,
      `LINKEDIN_ACCESS_TOKEN=${newToken} # expira em ${expiryDate}`
    );
    
    writeFileSync(envPath, envContent, 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao atualizar .env.local:', error);
    return false;
  }
}

/**
 * Atualiza o token no Vercel
 */
async function updateVercelToken(newToken: string): Promise<boolean> {
  try {
    const environments = ['production', 'preview', 'development'];
    const results = [];

    for (const env of environments) {
      // Busca variáveis existentes
      const envVars = await fetch(
        `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env`,
        {
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
          },
        }
      ).then(r => r.json());

      const existingVar = envVars.envs?.find(
        (e: any) => e.key === 'LINKEDIN_ACCESS_TOKEN' && e.target.includes(env)
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
      }

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

    return results.every(r => r.success);
  } catch (error) {
    console.error('Erro ao atualizar Vercel:', error);
    return false;
  }
}

/**
 * Troca código de autorização por access token
 */
async function exchangeCodeForToken(authCode: string): Promise<TokenResponse | null> {
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

    return await response.json();
  } catch (error) {
    console.error('Erro na troca do código:', error);
    return null;
  }
}

/**
 * Calcula data de expiração
 */
function getExpiryDate(expiresIn: number): string {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + expiresIn * 1000);
  return expiryDate.toLocaleDateString('pt-BR');
}

/**
 * Cria lembretes de renovação no banco (opcional)
 */
async function createRenewalReminders(expiryDate: Date) {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    
    if (!supabaseAdmin) {
      console.warn('Supabase admin não configurado, lembretes não criados');
      return;
    }
    
    const reminderDays = [30, 14, 7, 3, 1];
    
    for (const days of reminderDays) {
      const reminderDate = new Date(expiryDate);
      reminderDate.setDate(reminderDate.getDate() - days);
      
      await supabaseAdmin.from('token_reminders').insert({
        token_type: 'linkedin',
        reminder_date: reminderDate.toISOString(),
        days_before: days,
        status: 'pending',
      });
    }
  } catch (error) {
    // Lembretes são opcionais, não falha o processo
    console.warn('Aviso ao criar lembretes (não crítico):', error);
  }
}

/**
 * POST - Renova o token LinkedIn automaticamente
 */
export async function POST(request: Request) {
  try {
    const { authCode } = await request.json();

    if (!authCode) {
      return NextResponse.json(
        { error: 'Código de autorização não fornecido' },
        { status: 400 }
      );
    }

    // 1. Trocar código por token
    const tokenData = await exchangeCodeForToken(authCode);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Falha ao obter novo token' },
        { status: 500 }
      );
    }

    const expiryDate = getExpiryDate(tokenData.expires_in);
    const expiryDateObj = new Date(Date.now() + tokenData.expires_in * 1000);

    // 2. Atualizar .env.local
    const localUpdated = updateLocalEnv(tokenData.access_token, expiryDate);
    
    if (!localUpdated) {
      return NextResponse.json(
        { error: 'Falha ao atualizar .env.local' },
        { status: 500 }
      );
    }

    // 3. Atualizar Vercel
    const vercelUpdated = await updateVercelToken(tokenData.access_token);

    // 4. Criar lembretes
    await createRenewalReminders(expiryDateObj);

    return NextResponse.json({
      success: true,
      token: tokenData.access_token.substring(0, 20) + '...',
      expiryDate,
      localUpdated,
      vercelUpdated,
      message: vercelUpdated 
        ? 'Token renovado com sucesso em todos os ambientes!'
        : 'Token renovado localmente. Vercel pode precisar de atualização manual.',
    });
  } catch (error) {
    console.error('Erro na renovação:', error);
    return NextResponse.json(
      { error: 'Erro ao renovar token' },
      { status: 500 }
    );
  }
}

/**
 * GET - Retorna status da renovação automática
 */
export async function GET() {
  try {
    const hasVercelToken = !!VERCEL_TOKEN;
    const currentToken = process.env.LINKEDIN_ACCESS_TOKEN;
    
    // Extrai data de expiração do comentário no .env.local
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const match = envContent.match(/LINKEDIN_ACCESS_TOKEN=.*# expira em (.+)/);
    const expiryDateStr = match?.[1];

    return NextResponse.json({
      autoRenewalEnabled: hasVercelToken,
      currentTokenMasked: currentToken ? currentToken.substring(0, 20) + '...' : null,
      expiryDate: expiryDateStr,
      message: hasVercelToken
        ? 'Renovação automática habilitada'
        : 'Adicione VERCEL_TOKEN ao .env.local para habilitar renovação automática',
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
