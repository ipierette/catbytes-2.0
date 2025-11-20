/**
 * API: Estatísticas de cron jobs
 * GET /api/cron/stats
 */

import { NextResponse } from 'next/server'
import { getCronStats } from '@/lib/cron-execution-logger'

export async function GET() {
  try {
    const stats = await getCronStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('[API Cron Stats] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
