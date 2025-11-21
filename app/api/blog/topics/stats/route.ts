/**
 * API: Estatísticas de tópicos para dashboard
 * 
 * GET /api/blog/topics/stats
 * 
 * Retorna:
 * - Total de tópicos por categoria e status
 * - Tópicos mais usados
 * - Histórico de uso recente
 * - Taxa de sucesso na geração
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client não configurado' },
        { status: 500 }
      )
    }
    const searchParams = request.nextUrl.searchParams
    const period = parseInt(searchParams.get('period') || '30') // dias

    // 1. Estatísticas gerais por categoria
    const { data: generalStats, error: generalError } = await supabaseAdmin
      .from('blog_topics_stats')
      .select('*')

    if (generalError) {
      throw generalError
    }

    // 2. Tópicos mais usados
    const { data: mostUsed, error: mostUsedError } = await supabaseAdmin
      .from('blog_topics_most_used')
      .select('*')
      .limit(20)

    if (mostUsedError) {
      throw mostUsedError
    }

    // 3. Uso recente (últimos N dias)
    const { data: recentUsage, error: recentError } = await supabaseAdmin
      .from('blog_topic_usage_history')
      .select('*')
      .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (recentError) {
      throw recentError
    }

    // 4. Taxa de sucesso
    const totalGenerations = recentUsage?.length || 0
    const successfulGenerations = recentUsage?.filter(r => r.success).length || 0
    const successRate = totalGenerations > 0 
      ? ((successfulGenerations / totalGenerations) * 100).toFixed(2)
      : '0.00'

    // 5. Tempo médio de geração
    const avgGenerationTime = recentUsage && recentUsage.length > 0
      ? Math.round(
          recentUsage
            .filter(r => r.generation_time_ms)
            .reduce((sum, r) => sum + (r.generation_time_ms || 0), 0) / 
          recentUsage.filter(r => r.generation_time_ms).length
        )
      : 0

    // 6. Uso por dia (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const usageByDay = last7Days.map(date => {
      const count = recentUsage?.filter(r => 
        r.created_at.startsWith(date)
      ).length || 0
      return { date, count }
    })

    // 7. Bloqueios de similaridade ativos
    const { count: similarityBlocks } = await supabaseAdmin
      .from('blog_topic_similarity_blocks')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      stats: {
        general: generalStats,
        mostUsed,
        recentUsage: {
          total: totalGenerations,
          successful: successfulGenerations,
          failed: totalGenerations - successfulGenerations,
          successRate: `${successRate}%`,
          avgGenerationTimeMs: avgGenerationTime
        },
        usageByDay,
        similarityBlocks: similarityBlocks || 0,
        period
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas', details: error.message },
      { status: 500 }
    )
  }
}
