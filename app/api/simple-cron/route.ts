import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60 // Reduzido para teste

/**
 * Simple unified endpoint - teste simples
 */
export async function GET(request: NextRequest) {
  try {
    // Verificação de segurança simples
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Simple-Cron] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Simple-Cron] Starting simple task...')

    // Tarefa simples de teste
    const now = new Date()
    const result = {
      success: true,
      message: 'Simple cron executed successfully',
      timestamp: now.toISOString(),
      day: now.getDay(),
      hour: now.getHours()
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('[Simple-Cron] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Simple cron failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}