/**
 * Instagram Settings API
 * Gerencia configurações do sistema (ON/OFF de geração automática)
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramSettings } from '@/lib/instagram-settings'
import { verifyAdmin } from '@/lib/api-security'

/**
 * GET: Busca configurações atuais
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request)

    const settings = await instagramSettings.getAll()

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
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
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request)

    const body = await request.json()
    const { autoGenerationEnabled } = body

    if (typeof autoGenerationEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'autoGenerationEnabled must be a boolean' },
        { status: 400 }
      )
    }

    await instagramSettings.setAutoGeneration(autoGenerationEnabled)

    return NextResponse.json({
      success: true,
      message: `Auto generation ${autoGenerationEnabled ? 'ENABLED' : 'DISABLED'}`,
      settings: {
        autoGenerationEnabled
      }
    })

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
