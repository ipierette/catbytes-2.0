import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

// Inicializar cliente do Google Analytics 4
let analyticsDataClient: BetaAnalyticsDataClient | null = null
let initError: string | null = null

try {
  if (process.env.GOOGLE_ANALYTICS_CREDENTIALS && process.env.GOOGLE_ANALYTICS_PROPERTY_ID) {
    console.log('[Google Analytics] Inicializando cliente...')
    console.log('[Google Analytics] Property ID:', process.env.GOOGLE_ANALYTICS_PROPERTY_ID)
    
    const credentials = JSON.parse(process.env.GOOGLE_ANALYTICS_CREDENTIALS)
    console.log('[Google Analytics] Credentials project_id:', credentials.project_id)
    
    analyticsDataClient = new BetaAnalyticsDataClient({ credentials })
    console.log('[Google Analytics] ✅ Cliente inicializado com sucesso!')
  } else {
    initError = 'Variáveis de ambiente não configuradas'
    console.log('[Google Analytics] ⚠️ Credenciais ou Property ID não encontrados')
  }
} catch (error) {
  initError = error instanceof Error ? error.message : String(error)
  console.error('[Google Analytics] ❌ Erro ao inicializar:', initError)
}

const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID?.replace('properties/', '') || ''

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    console.log('[Google Analytics API] Request recebido, period:', period)
    console.log('[Google Analytics API] Client status:', analyticsDataClient ? 'OK' : 'NULL')
    console.log('[Google Analytics API] Property ID:', propertyId)
    console.log('[Google Analytics API] Init Error:', initError)

    if (!analyticsDataClient || !propertyId) {
      console.log('[Google Analytics API] ⚠️ Retornando dados MOCKADOS')
      // Retornar dados mockados se Analytics não configurado
      return NextResponse.json({
        success: true,
        data: getMockAnalytics(period),
        isDemo: true,
        message: initError || 'Configure GOOGLE_ANALYTICS_CREDENTIALS e GOOGLE_ANALYTICS_PROPERTY_ID para dados reais'
      })
    }

    console.log('[Google Analytics API] ✅ Buscando dados REAIS do Google Analytics...')

    // Calcular datas
    const daysAgo = parseInt(period.replace('d', ''))
    const startDate = `${daysAgo}daysAgo`
    const endDate = 'today'

    console.log('[Google Analytics API] Period:', { startDate, endDate, propertyId: `properties/${propertyId}` })

    // Buscar dados do Google Analytics
    const [overviewResponse, topPagesResponse, trafficSourcesResponse] = await Promise.all([
      // Métricas gerais
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ]
      }),

      // Top páginas
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      }),

      // Fontes de tráfego
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 5
      })
    ])

    // Processar dados
    const overview = overviewResponse[0]?.rows?.[0]
    const topPages = topPagesResponse[0]?.rows || []
    const trafficSources = trafficSourcesResponse[0]?.rows || []

    console.log('[Google Analytics API] ✅ Dados recebidos:', {
      hasOverview: !!overview,
      topPagesCount: topPages.length,
      trafficSourcesCount: trafficSources.length
    })

    const analytics = {
      overview: {
        totalUsers: parseInt(overview?.metricValues?.[0]?.value || '0'),
        sessions: parseInt(overview?.metricValues?.[1]?.value || '0'),
        pageViews: parseInt(overview?.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(overview?.metricValues?.[3]?.value || '0'),
        avgSessionDuration: parseFloat(overview?.metricValues?.[4]?.value || '0')
      },
      topPages: topPages.map((row: any) => ({
        title: row.dimensionValues?.[0]?.value || '',
        path: row.dimensionValues?.[1]?.value || '',
        views: parseInt(row.metricValues?.[0]?.value || '0')
      })),
      trafficSources: trafficSources.map((row: any) => ({
        source: row.dimensionValues?.[0]?.value || '',
        sessions: parseInt(row.metricValues?.[0]?.value || '0')
      })),
      period,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      isDemo: false
    })
  } catch (error) {
    console.error('[Google Analytics API] ❌ ERRO:', error)
    console.error('[Google Analytics API] Error details:', error instanceof Error ? error.message : String(error))
    
    // Em caso de erro, retornar dados mockados
    return NextResponse.json({
      success: true,
      data: getMockAnalytics('30d'),
      isDemo: true,
      error: `Erro ao buscar dados do Analytics: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    })
  }
}

// Dados mockados para quando Analytics não está configurado
function getMockAnalytics(period: string) {
  return {
    overview: {
      totalUsers: 12450,
      sessions: 18670,
      pageViews: 45230,
      bounceRate: 34.2,
      avgSessionDuration: 185.5
    },
    topPages: [
      { title: 'Como criar uma API REST com Node.js', path: '/blog/api-rest-nodejs', views: 3240 },
      { title: 'React vs Vue: Qual escolher em 2025?', path: '/blog/react-vs-vue-2025', views: 2890 },
      { title: 'IA no Desenvolvimento', path: '/blog/ia-desenvolvimento', views: 2650 },
      { title: 'Home - CATBytes', path: '/', views: 2340 },
      { title: 'Projetos', path: '/projetos', views: 1890 }
    ],
    trafficSources: [
      { source: 'google', sessions: 8900 },
      { source: 'direct', sessions: 4500 },
      { source: 'linkedin', sessions: 2800 },
      { source: 'github', sessions: 1500 },
      { source: 'instagram', sessions: 970 }
    ],
    period,
    timestamp: new Date().toISOString()
  }
}
