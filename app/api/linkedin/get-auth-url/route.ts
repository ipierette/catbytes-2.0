/**
 * Gera URL de autorização OAuth do LinkedIn para obter novo token
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = process.env.LINKEDIN_APP_ID
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'https://www.catbytes.site/api/linkedin/oauth-callback'

    if (!clientId) {
      return NextResponse.json({
        error: 'LINKEDIN_APP_ID not configured'
      }, { status: 500 })
    }

    // Scopes necessários para publicar posts
    const scopes = [
      'r_liteprofile',      // Ler perfil básico
      'r_emailaddress',     // Ler email (opcional)
      'w_member_social'     // Escrever posts (ESSENCIAL)
    ].join('%20')

    const state = Math.random().toString(36).substring(7) // Estado aleatório para segurança

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}&` +
      `scope=${scopes}`

    return NextResponse.json({
      message: 'Acesse a URL abaixo para autorizar o app e gerar novo token',
      authUrl,
      instructions: [
        '1. Abra a URL abaixo no navegador',
        '2. Faça login no LinkedIn',
        '3. Autorize o aplicativo',
        '4. Você será redirecionado com um código',
        '5. Use o código no endpoint /api/linkedin/exchange-code'
      ],
      redirectUri,
      scopes: scopes.split('%20'),
      note: 'O scope w_member_social é essencial para publicar posts'
    })

  } catch (error) {
    console.error('[LinkedIn Auth URL] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
