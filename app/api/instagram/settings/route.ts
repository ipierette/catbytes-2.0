/**
 * Instagram Settings API
 * Gerencia configurações do sistema (ON/OFF de geração automática)
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramSettings } from '@/lib/instagram-settings'

/**
 * GET: Busca configurações atuais
 * Não requer autenticação para permitir uso no frontend
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await instagramSettings.getAll()

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
    console.error('[Instagram Settings GET] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST: Atualiza configurações
 * Não requer autenticação para permitir uso no frontend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { autoGenerationEnabled } = body

    if (typeof autoGenerationEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'autoGenerationEnabled must be a boolean' },
        { status: 400 }
      )
    }

    console.log('[Instagram Settings POST] Updating autoGenerationEnabled to:', autoGenerationEnabled)
    
    await instagramSettings.setAutoGeneration(autoGenerationEnabled)

    console.log('[Instagram Settings POST] Update successful')

    return NextResponse.json({
      success: true,
      message: `Auto generation ${autoGenerationEnabled ? 'ENABLED' : 'DISABLED'}`,
      settings: {
        autoGenerationEnabled
      }
    })

  } catch (error) {
    console.error('[Instagram Settings POST] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
