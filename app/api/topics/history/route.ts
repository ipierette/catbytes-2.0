import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  try {
    // Buscar histórico de topic_expansion do cron_execution_log
    const { data, error } = await supabaseAdmin
      .from('cron_execution_log')
      .select('*')
      .eq('job_name', 'topic_expansion')
      .order('started_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching topic history:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar histórico' },
        { status: 500 }
      )
    }

    // Processar dados para formato amigável
    const history = (data || []).map(log => {
      const metadata = log.metadata || {}
      const result = log.result || {}
      
      return {
        id: log.id,
        category: metadata.category || result.category || 'N/A',
        count: metadata.count || result.total || (result.generated?.length || 0),
        generated_at: log.started_at,
        method: metadata.method || 'automatic',
        status: log.status,
        duration_ms: log.duration_ms,
        topics: result.generated || [],
        error: log.error_message,
        added_to_code: false // Este campo precisa ser rastreado manualmente
      }
    })

    return NextResponse.json({
      success: true,
      history,
      total: history.length
    })
  } catch (error) {
    console.error('Error in topics/history API:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
