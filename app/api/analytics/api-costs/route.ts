/**
 * API Cost Analytics Endpoint
 * 
 * Calcula custos de API baseado em eventos registrados em daily_events
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface CostCalculation {
  openai: number
  dalle: number
  total: number
}

interface DailyEventRow {
  event_type: string
  event_date: string
  created_at: string
}

/**
 * Calcula custos baseado em eventos
 */
function calculateCosts(events: DailyEventRow[]): CostCalculation {
  let openaiCost = 0
  let dalleCost = 0

  events.forEach(event => {
    switch (event.event_type) {
      case 'blog_generated':
        // GPT-4o-mini: ~10k tokens input + 5k output
        // Input: $0.150/1M tokens = $0.0015/10k
        // Output: $0.600/1M tokens = $0.0030/5k
        openaiCost += 0.0045
        
        // DALL-E 3: 1 imagem por blog
        dalleCost += 0.08
        break
      
      case 'instagram_published':
      case 'linkedin_published':
        // Geração de hashtags e conteúdo social
        // Gemini é gratuito, mas estimativa conservadora para fallback
        openaiCost += 0.001
        break
    }
  })

  return {
    openai: Math.round(openaiCost * 1000) / 1000, // 3 decimais
    dalle: Math.round(dalleCost * 1000) / 1000,
    total: Math.round((openaiCost + dalleCost) * 1000) / 1000
  }
}

/**
 * GET /api/analytics/api-costs
 * Query params:
 * - period: 'today' | 'week' | 'month' (default: 'today')
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = request.nextUrl
    const period = searchParams.get('period') || 'today'

    // Calcular datas baseado no período
    const now = new Date()
    let startDate: string
    let endDate = now.toISOString().split('T')[0] // Hoje

    switch (period) {
      case 'week':
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        startDate = weekAgo.toISOString().split('T')[0]
        break
      
      case 'month':
        const monthAgo = new Date(now)
        monthAgo.setDate(monthAgo.getDate() - 30)
        startDate = monthAgo.toISOString().split('T')[0]
        break
      
      case 'today':
      default:
        startDate = endDate
        break
    }

    console.log(`[API Costs] Fetching events from ${startDate} to ${endDate}`)

    // Buscar eventos do período
    const { data: events, error } = await supabaseAdmin
      .from('daily_events')
      .select('event_type, event_date, created_at')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .in('event_type', [
        'blog_generated',
        'instagram_published',
        'linkedin_published'
      ])

    if (error) {
      console.error('[API Costs] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events', details: error.message },
        { status: 500 }
      )
    }

    // Calcular custos totais
    const costs = calculateCosts(events || [])

    // Agrupar por dia para o gráfico
    const dailyCosts: Record<string, CostCalculation> = {}
    const eventsByDate: Record<string, DailyEventRow[]> = {}

    events?.forEach(event => {
      if (!eventsByDate[event.event_date]) {
        eventsByDate[event.event_date] = []
      }
      eventsByDate[event.event_date].push(event)
    })

    Object.entries(eventsByDate).forEach(([date, dateEvents]) => {
      dailyCosts[date] = calculateCosts(dateEvents)
    })

    // Calcular estatísticas
    const totalEvents = events?.length || 0
    const blogsGenerated = events?.filter(e => e.event_type === 'blog_generated').length || 0
    const socialPosts = events?.filter(e => 
      e.event_type === 'instagram_published' || e.event_type === 'linkedin_published'
    ).length || 0

    // Projeções
    let monthlyProjection = 0
    let yearlyProjection = 0

    if (period === 'today' && costs.total > 0) {
      // Projeção baseada em 4 blogs/semana
      monthlyProjection = costs.total * 16 // 4 blogs x 4 semanas
      yearlyProjection = monthlyProjection * 12
    } else if (period === 'week') {
      monthlyProjection = (costs.total / 7) * 30
      yearlyProjection = monthlyProjection * 12
    } else if (period === 'month') {
      monthlyProjection = costs.total
      yearlyProjection = costs.total * 12
    }

    return NextResponse.json({
      success: true,
      period,
      dateRange: { start: startDate, end: endDate },
      costs: {
        ...costs,
        breakdown: {
          openai: costs.openai,
          dalle: costs.dalle
        }
      },
      events: {
        total: totalEvents,
        blogs: blogsGenerated,
        socialPosts: socialPosts
      },
      dailyCosts,
      projections: {
        monthly: Math.round(monthlyProjection * 100) / 100,
        yearly: Math.round(yearlyProjection * 100) / 100
      },
      metadata: {
        costPerBlog: blogsGenerated > 0 ? Math.round((costs.total / blogsGenerated) * 1000) / 1000 : 0,
        costPerPost: socialPosts > 0 ? Math.round((costs.total / socialPosts) * 1000) / 1000 : 0
      }
    })

  } catch (error) {
    console.error('[API Costs] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate API costs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
