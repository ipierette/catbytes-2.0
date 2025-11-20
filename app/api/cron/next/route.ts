/**
 * API: Próximas execuções programadas
 * GET /api/cron/next
 */

import { NextResponse } from 'next/server'
import { getNextScheduledExecutions } from '@/lib/cron-execution-logger'

export async function GET() {
  try {
    const next = getNextScheduledExecutions()

    return NextResponse.json({
      success: true,
      next
    })

  } catch (error) {
    console.error('[API Cron Next] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get next executions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
