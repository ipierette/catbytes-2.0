import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'

/**
 * API para buscar dados do Vercel Analytics
 * GET /api/analytics/vercel?period=7d|30d|90d
 */

const VERCEL_API_URL = 'https://vercel.com/api/web/insights'
const VERCEL_TOKEN = process.env.VERCEL_ANALYTICS_TOKEN
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
        message: 'Configure VERCEL_ANALYTICS_TOKEN e VERCEL_PROJECT_ID nas variáveis de ambiente',
        configured: false
      }, { status: 200 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30d'

    // Calcular datas baseado no período
    const now = new Date()
    const endDate = now.toISOString()
    let startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Buscar dados do Vercel Analytics
    const url = new URL(`${VERCEL_API_URL}/${VERCEL_PROJECT_ID}`)
    url.searchParams.set('from', startDate.getTime().toString())
    url.searchParams.set('to', now.getTime().toString())
    if (VERCEL_TEAM_ID) {
      url.searchParams.set('teamId', VERCEL_TEAM_ID)
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Vercel Analytics] API Error:', response.status, error)
      
      return NextResponse.json({
        error: 'Erro ao buscar dados do Vercel',
        message: `Status ${response.status}`,
        configured: true,
        apiError: true
      }, { status: 200 })
    }

    const data = await response.json()

    // Processar e formatar os dados
    const processedData = {
      configured: true,
      period,
      metrics: {
        visitors: data.visitors || 0,
        pageViews: data.pageViews || 0,
        avgDuration: data.avgDuration || 0,
        bounceRate: data.bounceRate || 0
      },
      topPages: data.topPages || [],
      topCountries: data.topCountries || [],
      topDevices: data.topDevices || [],
      topBrowsers: data.topBrowsers || [],
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
