/**
 * Testa se o token do LinkedIn está válido
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN
    const personUrn = process.env.LINKEDIN_PERSON_URN

    if (!linkedinToken) {
      return NextResponse.json({ 
        error: 'LINKEDIN_ACCESS_TOKEN not configured' 
      }, { status: 500 })
    }

    if (!personUrn) {
      return NextResponse.json({ 
        error: 'LINKEDIN_PERSON_URN not configured' 
      }, { status: 500 })
    }

    console.log('[LinkedIn Token Test] Testing token validity...')
    console.log('[LinkedIn Token Test] Token length:', linkedinToken.length)
    console.log('[LinkedIn Token Test] Person URN:', personUrn)

    // Testar com chamada simples à API do LinkedIn (verificar perfil)
    const response = await fetch(
      'https://api.linkedin.com/v2/me',
      {
        headers: {
          'Authorization': `Bearer ${linkedinToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const responseText = await response.text()
    console.log('[LinkedIn Token Test] API Response:', response.status, responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { rawError: responseText }
      }

      return NextResponse.json({
        valid: false,
        status: response.status,
        error: errorData,
        tokenLength: linkedinToken.length,
        personUrn: personUrn,
        diagnosis: response.status === 401 
          ? 'Token inválido, expirado ou sem permissões necessárias'
          : 'Erro ao verificar token'
      })
    }

    const profileData = JSON.parse(responseText)

    return NextResponse.json({
      valid: true,
      tokenWorks: true,
      profile: {
        id: profileData.id,
        firstName: profileData.localizedFirstName,
        lastName: profileData.localizedLastName
      },
      tokenLength: linkedinToken.length,
      personUrn: personUrn,
      diagnosis: 'Token válido e funcionando! O erro pode estar no URN ou nas permissões de publicação.'
    })

  } catch (error) {
    console.error('[LinkedIn Token Test] Error:', error)
    return NextResponse.json({
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
