/**
 * Troca o código de autorização por access token
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({
        error: 'Missing authorization code',
        hint: 'Provide the code you received after authorizing the app'
      }, { status: 400 })
    }

    const clientId = process.env.LINKEDIN_APP_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'https://catbytes.site/api/linkedin/callback'

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'LinkedIn credentials not configured',
        missing: {
          clientId: !clientId,
          clientSecret: !clientSecret
        }
      }, { status: 500 })
    }

    console.log('[LinkedIn Exchange Code] Exchanging authorization code for access token...')

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    })

    const responseText = await response.text()
    console.log('[LinkedIn Exchange Code] Response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { rawError: responseText }
      }

      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorData,
        message: 'Failed to exchange code for token'
      }, { status: response.status })
    }

    const tokenData = JSON.parse(responseText)

    return NextResponse.json({
      success: true,
      message: 'Token gerado com sucesso! Atualize suas variáveis de ambiente.',
      tokens: {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
        expires_in_days: Math.floor(tokenData.expires_in / 86400),
        refresh_token: tokenData.refresh_token || null,
        refresh_token_expires_in: tokenData.refresh_token_expires_in || null,
        scope: tokenData.scope
      },
      instructions: [
        '1. Copie o access_token',
        '2. Atualize LINKEDIN_ACCESS_TOKEN no .env.local e Vercel',
        '3. Se houver refresh_token, atualize LINKEDIN_REFRESH_TOKEN também',
        '4. Teste a publicação novamente'
      ],
      nextSteps: [
        'Atualize as variáveis de ambiente',
        'Faça um novo deploy no Vercel',
        'Teste com: curl -X POST https://www.catbytes.site/api/test-social-promotion'
      ]
    })

  } catch (error) {
    console.error('[LinkedIn Exchange Code] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
