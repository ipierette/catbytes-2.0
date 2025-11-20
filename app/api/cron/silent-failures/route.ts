import { NextResponse } from 'next/server'
import { detectSilentFailures } from '@/lib/cron-execution-logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const failures = await detectSilentFailures()

    return NextResponse.json({
      success: true,
      failures,
      count: failures.length,
      message: failures.length === 0 
        ? 'Nenhuma falha silenciosa detectada'
        : `${failures.length} falha(s) silenciosa(s) detectada(s)`
    })
  } catch (error) {
    console.error('Error detecting silent failures:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao detectar falhas silenciosas' },
      { status: 500 }
    )
  }
}
