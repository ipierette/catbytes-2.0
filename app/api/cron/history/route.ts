import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/cron/history
 * Retorna histórico de execuções dos cron jobs
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin não configurado')
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const cronType = searchParams.get('type') // 'blog', 'instagram', 'token-check'

    let query = supabaseAdmin
      .from('cron_execution_logs')
      .select('*')
      .order('executed_at', { ascending: false })
      .limit(limit)

    if (cronType) {
      query = query.eq('cron_type', cronType)
    }

    const { data, error } = await query

    if (error) {
      console.error('[Cron History] Database error:', error)
      throw error
    }

    // Calcular estatísticas
    const stats = {
      total: data?.length || 0,
      success: data?.filter(log => log.status === 'success').length || 0,
      failed: data?.filter(log => log.status === 'failed').length || 0,
      lastExecution: data && data.length > 0 ? data[0] : null
    }

    return NextResponse.json({
      success: true,
      logs: data || [],
      stats
    })

  } catch (error) {
    console.error('[Cron History] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao buscar histórico' 
      },
      { status: 500 }
    )
  }
}
