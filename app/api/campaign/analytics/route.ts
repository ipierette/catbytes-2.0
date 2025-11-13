/**
 * 📊 ANALYTICS E MÉTRICAS UNIFICADAS
 * 
 * Sistema de tracking para campanhas multi-plataforma
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'

export interface PlatformMetrics {
  instagram: {
    posts: number
    published: number
    engagement?: number
    followers?: number
  }
  email: {
    sent: number
    opened?: number
    clicked?: number
  }
  whatsapp: {
    sent: number
    delivered?: number
  }
  website: {
    visits?: number
    pageViews?: number
    bounceRate?: number
  }
}

export interface CampaignAnalytics {
  period: string
  campaigns: number
  platforms: PlatformMetrics
  topNiches: Array<{ nicho: string; posts: number; engagement?: number }>
  performance: {
    totalReach: number
    engagementRate: number
    conversionRate: number
    roi?: number
  }
  trends: {
    postsGrowth: number
    engagementGrowth: number
    followersGrowth: number
  }
}

/**
 * Coleta métricas do Instagram via API
 */
async function getInstagramMetrics(): Promise<PlatformMetrics['instagram']> {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID

    if (!accessToken || !accountId) {
      throw new Error('Instagram credentials missing')
    }

    // Buscar dados da conta
    const accountResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}?fields=followers_count,media_count&access_token=${accessToken}`
    )

    if (!accountResponse.ok) {
      throw new Error('Failed to fetch Instagram account data')
    }

    const accountData = await accountResponse.json()

    // Buscar posts recentes para calcular engagement
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media?fields=like_count,comments_count,timestamp&limit=20&access_token=${accessToken}`
    )

    let engagement = 0
    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json()
      const totalEngagement = mediaData.data?.reduce((sum: number, post: any) => 
        sum + (post.like_count || 0) + (post.comments_count || 0), 0
      ) || 0
      
      engagement = mediaData.data?.length > 0 ? totalEngagement / mediaData.data.length : 0
    }

    // Dados do banco local
    const stats = await instagramDB.getStats()

    // getStats() sempre retorna números, mas TypeScript precisa de type assertion
    const totalPosts = Number(stats.total) || 0
    const publishedPosts = Number(stats.published) || 0

    return {
      posts: totalPosts,
      published: publishedPosts,
      engagement: Math.round(engagement),
      followers: accountData.followers_count
    }

  } catch (error) {
    console.error('Error fetching Instagram metrics:', error)
    const stats = await instagramDB.getStats()
    
    // getStats() sempre retorna números, mas TypeScript precisa de type assertion
    const totalPosts = Number(stats.total) || 0
    const publishedPosts = Number(stats.published) || 0
    
    return {
      posts: totalPosts,
      published: publishedPosts
    }
  }
}

/**
 * Análise de nichos mais performáticos
 */
async function getTopNiches(): Promise<CampaignAnalytics['topNiches']> {
  // Esta query deveria ser implementada no instagramDB
  // Por agora, retornamos dados mock baseados no sistema atual
  return [
    { nicho: 'React & Next.js', posts: 45, engagement: 89 },
    { nicho: 'JavaScript ES6+', posts: 38, engagement: 76 },
    { nicho: 'TypeScript', posts: 32, engagement: 82 },
    { nicho: 'Node.js & APIs', posts: 28, engagement: 71 },
    { nicho: 'CSS & Tailwind', posts: 25, engagement: 65 }
  ]
}

/**
 * Calcula métricas de performance
 */
function calculatePerformance(platforms: PlatformMetrics): CampaignAnalytics['performance'] {
  const totalReach = (platforms.instagram.followers || 0) + 
                    (platforms.email.sent || 0) + 
                    (platforms.whatsapp.sent || 0)

  const totalEngagement = (platforms.instagram.engagement || 0) +
                         (platforms.email.opened || 0) +
                         (platforms.whatsapp.delivered || 0)

  const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0

  return {
    totalReach,
    engagementRate: Math.round(engagementRate * 100) / 100,
    conversionRate: Math.round(Math.random() * 15 + 5), // Mock: 5-20%
    roi: Math.round(Math.random() * 300 + 150) // Mock: 150-450%
  }
}

/**
 * GET: Retorna analytics completo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    console.log('📊 Generating analytics report...')

    // Coleta métricas de cada plataforma
    const instagram = await getInstagramMetrics()
    
    // Mock data para outras plataformas (implementar integração real conforme necessário)
    const platforms: PlatformMetrics = {
      instagram,
      email: {
        sent: 1250,
        opened: 892,
        clicked: 234
      },
      whatsapp: {
        sent: 856,
        delivered: 823
      },
      website: {
        visits: 3420,
        pageViews: 8940,
        bounceRate: 34.2
      }
    }

    const topNiches = await getTopNiches()
    const performance = calculatePerformance(platforms)

    // Mock de dados de crescimento
    const trends = {
      postsGrowth: 23.5,
      engagementGrowth: 18.2,
      followersGrowth: 12.8
    }

    const analytics: CampaignAnalytics = {
      period,
      campaigns: 28, // Mock: campanhas executadas no período
      platforms,
      topNiches,
      performance,
      trends
    }

    console.log('✅ Analytics report generated successfully')

    return NextResponse.json({
      success: true,
      data: analytics,
      generatedAt: new Date().toISOString(),
      metadata: {
        dataPoints: Object.keys(platforms).length,
        metricsCalculated: 12,
        period: period
      }
    })

  } catch (error) {
    console.error('❌ Error generating analytics:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * POST: Registra evento personalizado de tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, platform, data } = body

    // Aqui você implementaria o sistema de tracking personalizado
    // Por exemplo, salvar no banco de dados, enviar para analytics externos, etc.
    
    console.log('📈 Custom event tracked:', {
      event,
      platform,
      timestamp: new Date().toISOString(),
      data
    })

    // Mock de resposta
    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      eventId: `evt_${Date.now()}`
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to track event'
    }, { status: 500 })
  }
}