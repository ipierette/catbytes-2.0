/**
 * API: Estatísticas de uso de tópicos
 * GET /api/topics/stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { BLOG_TOPICS } from '@/types/blog'
import type { BlogTheme } from '@/types/blog'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      )
    }

    const stats: Record<string, any> = {}
    const now = new Date()

    for (const category of Object.keys(BLOG_TOPICS) as BlogTheme[]) {
      const totalTopics = BLOG_TOPICS[category].length

      // Buscar tópicos usados
      const { data: usedTopics } = await supabaseAdmin
        .from('topic_usage_history')
        .select('topic_text, used_at, blog_post_id')
        .eq('category', category)

      // Calcular bloqueados (< 2 anos)
      const blockedTopics = usedTopics?.filter(t => {
        const reusableAfter = new Date(t.used_at)
        reusableAfter.setDate(reusableAfter.getDate() + 730)
        return reusableAfter > now
      }) || []

      // Calcular reutilizáveis (> 2 anos)
      const reusableTopics = usedTopics?.filter(t => {
        const reusableAfter = new Date(t.used_at)
        reusableAfter.setDate(reusableAfter.getDate() + 730)
        return reusableAfter <= now
      }) || []

      const usedCount = usedTopics?.length || 0
      const blockedCount = blockedTopics.length
      const reusableCount = reusableTopics.length
      const neverUsedCount = totalTopics - usedCount
      const availableCount = neverUsedCount + reusableCount

      // Tópico mais antigo reutilizável
      let oldestReusable = null
      if (reusableTopics.length > 0) {
        const sorted = reusableTopics.sort((a, b) => 
          new Date(a.used_at).getTime() - new Date(b.used_at).getTime()
        )
        oldestReusable = {
          topic: sorted[0].topic_text,
          usedAt: sorted[0].used_at
        }
      }

      // Último tópico usado
      let lastUsed = null
      if (usedTopics && usedTopics.length > 0) {
        const sorted = usedTopics.sort((a, b) => 
          new Date(b.used_at).getTime() - new Date(a.used_at).getTime()
        )
        lastUsed = {
          topic: sorted[0].topic_text,
          usedAt: sorted[0].used_at
        }
      }

      // Calcular quando vai precisar de novos (se < 20 disponíveis)
      const weeklyUsage = 1 // 1 artigo por semana nesta categoria
      const weeksUntilLow = availableCount > 20 
        ? Math.floor((availableCount - 20) / weeklyUsage)
        : 0

      stats[category] = {
        total: totalTopics,
        used: usedCount,
        neverUsed: neverUsedCount,
        blocked: blockedCount,
        reusable: reusableCount,
        available: availableCount,
        needsGeneration: availableCount < 20,
        weeksUntilLow,
        oldestReusable,
        lastUsed,
        usagePercentage: Math.round((usedCount / totalTopics) * 100),
        blockedPercentage: Math.round((blockedCount / totalTopics) * 100),
        health: availableCount >= 50 ? 'excellent' : 
                availableCount >= 20 ? 'good' : 
                availableCount >= 10 ? 'warning' : 'critical'
      }
    }

    // Meta para 2 anos (104 artigos por categoria)
    const targetPerCategory = 104
    const overallStats = {
      totalTopicsInPool: Object.values(stats).reduce((sum: number, s: any) => sum + s.total, 0),
      totalUsed: Object.values(stats).reduce((sum: number, s: any) => sum + s.used, 0),
      totalAvailable: Object.values(stats).reduce((sum: number, s: any) => sum + s.available, 0),
      targetForTwoYears: targetPerCategory * 4, // 416 total
      categoriesNeedingGeneration: Object.values(stats).filter((s: any) => s.needsGeneration).length,
      overallHealth: Object.values(stats).every((s: any) => s.available >= 20) ? 'good' : 'needs-attention'
    }

    return NextResponse.json({
      success: true,
      stats,
      overall: overallStats,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('[API Topics Stats] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
