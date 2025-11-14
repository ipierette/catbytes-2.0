import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'

/**
 * API para buscar dados do Vercel Analytics
 * GET /api/analytics/vercel?period=7d|30d|90d
 */

const VERCEL_TOKEN = process.env.VERCEL_ANALYTICS_TOKEN || process.env.VERCEL_TOKEN
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação admin
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }

    // Verificar se as variáveis de ambiente estão configuradas
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return NextResponse.json({
        error: 'Vercel Analytics não configurado',
        message: 'Configure VERCEL_TOKEN/VERCEL_ANALYTICS_TOKEN e VERCEL_PROJECT_ID nas variáveis de ambiente',
        configured: false
      }, { status: 200 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30d'

    // Calcular datas baseado no período (em milissegundos)
    const now = Date.now()
    let since = now
    
    switch (period) {
      case '7d':
        since = now - (7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        since = now - (30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        since = now - (90 * 24 * 60 * 60 * 1000)
        break
      default:
        since = now - (30 * 24 * 60 * 60 * 1000)
    }

    // Construir URL com teamId se disponível
    let baseUrl = `https://vercel.com/api/web/insights/stats`
    
    const params = new URLSearchParams({
      projectId: VERCEL_PROJECT_ID,
      from: since.toString(),
      to: now.toString(),
    })
    
    if (VERCEL_TEAM_ID) {
      params.append('teamId', VERCEL_TEAM_ID)
    }

    const url = `${baseUrl}?${params.toString()}`

    console.log('[Vercel Analytics] Fetching:', {
      projectId: VERCEL_PROJECT_ID,
      teamId: VERCEL_TEAM_ID,
      period,
      hasToken: !!VERCEL_TOKEN
    })

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Vercel Analytics] API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      // Se for 404, a API pode não estar disponível para este plano
      if (response.status === 404) {
        return NextResponse.json({
          error: 'Endpoint não encontrado',
          message: 'O Vercel Analytics pode não estar disponível para o seu plano atual. Use o dashboard do Vercel para ver os dados.',
          configured: true,
          apiError: true,
          debug: {
            status: response.status,
            endpoint: baseUrl,
            hasToken: !!VERCEL_TOKEN,
            hasProjectId: !!VERCEL_PROJECT_ID,
            hasTeamId: !!VERCEL_TEAM_ID,
            errorDetails: errorText
          }
        }, { status: 200 })
      }
      
      return NextResponse.json({
        error: 'Erro ao buscar dados do Vercel',
        message: `Status ${response.status}: ${errorText}`,
        configured: true,
        apiError: true,
        debug: {
          status: response.status,
          hasToken: !!VERCEL_TOKEN,
          hasProjectId: !!VERCEL_PROJECT_ID,
          hasTeamId: !!VERCEL_TEAM_ID
        }
      }, { status: 200 })
    }

    const data = await response.json()

    // Processar e formatar os dados da resposta do Vercel
    const processedData = {
      configured: true,
      period,
      metrics: {
        visitors: data.total?.visitors || data.visitors || 0,
        pageViews: data.total?.pageViews || data.pageViews || 0,
        avgDuration: data.total?.avgDuration || data.avgDuration || 0,
        bounceRate: data.total?.bounceRate || data.bounceRate || 0
      },
      topPages: data.pages || data.topPages || [],
      topCountries: data.countries || data.topCountries || [],
      topDevices: data.devices || data.topDevices || [],
      topBrowsers: data.browsers || data.topBrowsers || [],
      timeline: data.timeline || []
    }

    return NextResponse.json(processedData)

  } catch (error) {
    console.error('[Vercel Analytics] Error:', error)
    return NextResponse.json({
      error: 'Erro ao buscar analytics',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      configured: false
    }, { status: 500 })
  }
}
