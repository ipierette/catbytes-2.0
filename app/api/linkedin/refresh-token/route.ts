/**
 * Renova o token de acesso do LinkedIn usando o refresh token
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

    const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN
    const clientId = process.env.LINKEDIN_APP_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET

    if (!refreshToken || !clientId || !clientSecret) {
      return NextResponse.json({
        error: 'Missing LinkedIn credentials',
        missing: {
          refreshToken: !refreshToken,
          clientId: !clientId,
          clientSecret: !clientSecret
        }
      }, { status: 500 })
    }

    console.log('[LinkedIn Refresh] Refreshing access token...')

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      })
    })

    const responseText = await response.text()
    console.log('[LinkedIn Refresh] Response status:', response.status)

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
        message: 'Failed to refresh token. You may need to re-authorize the app.'
      }, { status: response.status })
    }

    const tokenData = JSON.parse(responseText)

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully! Update your environment variables.',
      newTokens: {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
        expires_in_days: Math.floor(tokenData.expires_in / 86400),
        refresh_token: tokenData.refresh_token || refreshToken, // Novo refresh token ou o mesmo
        refresh_token_expires_in: tokenData.refresh_token_expires_in,
        refresh_token_expires_in_days: tokenData.refresh_token_expires_in 
          ? Math.floor(tokenData.refresh_token_expires_in / 86400) 
          : null
      },
      instructions: [
        '1. Copie o novo access_token',
        '2. Atualize LINKEDIN_ACCESS_TOKEN no .env.local',
        '3. Atualize LINKEDIN_ACCESS_TOKEN no Vercel',
        '4. Se houver novo refresh_token, atualize LINKEDIN_REFRESH_TOKEN também'
      ]
    })

  } catch (error) {
    console.error('[LinkedIn Refresh] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
