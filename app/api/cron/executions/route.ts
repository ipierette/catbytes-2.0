/**
 * API: Últimas execuções de cron jobs
 * GET /api/cron/executions?limit=20&job=blog_generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getLastExecutions } from '@/lib/cron-execution-logger'
import type { CronJobName } from '@/lib/cron-execution-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const jobParam = searchParams.get('job')
    
    const limit = limitParam ? parseInt(limitParam) : 20
    const job = jobParam as CronJobName | undefined

    const executions = await getLastExecutions(job, limit)

    return NextResponse.json({
      success: true,
      executions,
      count: executions.length
    })

  } catch (error) {
    console.error('[API Cron Executions] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get executions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
