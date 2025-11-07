import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// Inicializar cliente do Google Search Console
const getSearchConsoleClient = () => {
  if (!process.env.GOOGLE_ANALYTICS_CREDENTIALS) {
    return null
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_ANALYTICS_CREDENTIALS)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    })

    return google.webmasters({ version: 'v3', auth })
  } catch (error) {
    console.error('Error initializing Search Console client:', error)
    return null
  }
}

const SITE_URL = 'https://catbytes.site' // ou process.env.NEXT_PUBLIC_SITE_URL

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    const searchConsole = getSearchConsoleClient()

    if (!searchConsole) {
      // Retornar dados mockados se Search Console não configurado
      return NextResponse.json({
        success: true,
        data: getMockSearchConsoleData(period),
        isDemo: true,
        message: 'Configure GOOGLE_ANALYTICS_CREDENTIALS com permissões do Search Console para dados reais'
      })
    }

    // Calcular datas
    const daysAgo = Number.parseInt(period.replace('d', ''))
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Formatar datas para API (YYYY-MM-DD)
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Buscar dados do Search Console
    const response = await searchConsole.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query', 'page'],
        rowLimit: 100
      }
    })

    const rows = response.data.rows || []

    // Processar dados
    const topQueries = rows
      .sort((a: any, b: any) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr * 100, // Converter para porcentagem
        position: row.position
      }))

    const topPages = rows
      .reduce((acc: any[], row: any) => {
        const page = row.keys[1]
        const existing = acc.find(p => p.page === page)
        
        if (existing) {
          existing.clicks += row.clicks
          existing.impressions += row.impressions
        } else {
          acc.push({
            page,
            clicks: row.clicks,
            impressions: row.impressions
          })
        }
        
        return acc
      }, [])
      .sort((a: any, b: any) => b.clicks - a.clicks)
      .slice(0, 10)

    const totalClicks = rows.reduce((sum: number, row: any) => sum + row.clicks, 0)
    const totalImpressions = rows.reduce((sum: number, row: any) => sum + row.impressions, 0)
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const avgPosition = rows.length > 0
      ? rows.reduce((sum: number, row: any) => sum + row.position, 0) / rows.length
      : 0

    const data = {
      overview: {
        totalClicks,
        totalImpressions,
        avgCTR,
        avgPosition
      },
      topQueries,
      topPages,
      period,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data,
      isDemo: false
    })
  } catch (error) {
    console.error('Error fetching Search Console data:', error)
    
    // Em caso de erro, retornar dados mockados
    return NextResponse.json({
      success: true,
      data: getMockSearchConsoleData('30d'),
      isDemo: true,
      error: 'Erro ao buscar dados do Search Console. Mostrando dados demo.'
    })
  }
}

// Dados mockados para quando Search Console não está configurado
function getMockSearchConsoleData(period: string) {
  return {
    overview: {
      totalClicks: 3420,
      totalImpressions: 45600,
      avgCTR: 7.5,
      avgPosition: 12.3
    },
    topQueries: [
      { query: 'react typescript tutorial', clicks: 450, impressions: 5200, ctr: 8.7, position: 5.2 },
      { query: 'nextjs 14 tutorial', clicks: 380, impressions: 4800, ctr: 7.9, position: 6.1 },
      { query: 'api rest nodejs', clicks: 340, impressions: 4200, ctr: 8.1, position: 7.3 },
      { query: 'ia desenvolvimento web', clicks: 290, impressions: 3800, ctr: 7.6, position: 8.9 },
      { query: 'react vs vue 2025', clicks: 250, impressions: 3200, ctr: 7.8, position: 9.5 },
      { query: 'typescript best practices', clicks: 220, impressions: 2900, ctr: 7.6, position: 10.2 },
      { query: 'supabase tutorial', clicks: 190, impressions: 2600, ctr: 7.3, position: 11.8 },
      { query: 'portfolio desenvolvedor', clicks: 160, impressions: 2200, ctr: 7.3, position: 13.2 },
      { query: 'automação com ia', clicks: 140, impressions: 1900, ctr: 7.4, position: 14.5 },
      { query: 'design responsivo', clicks: 120, impressions: 1700, ctr: 7.1, position: 15.8 }
    ],
    topPages: [
      { page: 'https://catbytes.site/blog/api-rest-nodejs', clicks: 890, impressions: 11200 },
      { page: 'https://catbytes.site/blog/react-vs-vue-2025', clicks: 720, impressions: 9800 },
      { page: 'https://catbytes.site/blog/ia-desenvolvimento', clicks: 650, impressions: 8600 },
      { page: 'https://catbytes.site/', clicks: 580, impressions: 7200 },
      { page: 'https://catbytes.site/projetos', clicks: 480, impressions: 6100 }
    ],
    period,
    timestamp: new Date().toISOString()
  }
}
