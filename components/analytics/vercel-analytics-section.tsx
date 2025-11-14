'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Eye, Clock, TrendingUp, Globe, Monitor, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VercelAnalyticsSectionProps {
  period: '7d' | '30d' | '90d'
}

interface VercelData {
  configured: boolean
  period?: string
  metrics?: {
    visitors: number
    pageViews: number
    avgDuration: number
    bounceRate: number
  }
  topPages?: Array<{ path: string; views: number }>
  topCountries?: Array<{ country: string; visitors: number }>
  topDevices?: Array<{ device: string; percentage: number }>
  topBrowsers?: Array<{ browser: string; percentage: number }>
  error?: string
  message?: string
}

export function VercelAnalyticsSection({ period }: VercelAnalyticsSectionProps) {
  const [data, setData] = useState<VercelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVercelData()
  }, [period])

  const fetchVercelData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/vercel?period=${period}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching Vercel analytics:', error)
      setData({ configured: false, error: 'Erro ao carregar dados' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Se não estiver configurado ou houver erro
  if (!data?.configured || data.error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-purple-600" />
              Vercel Web Analytics
            </h3>
            <p className="text-muted-foreground mt-1">
              Dados de performance e visitantes coletados pelo Vercel
            </p>
          </div>
        </div>

        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            {data?.message || 'Configure as variáveis de ambiente VERCEL_ANALYTICS_TOKEN e VERCEL_PROJECT_ID para visualizar os dados.'}
          </AlertDescription>
        </Alert>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Acesse o Vercel Analytics</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  O Vercel Analytics está ativo. Para visualizar os dados completos:
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://vercel.com/izadoracurys-projects/catbytes-2-0/analytics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Activity className="h-4 w-4" />
                    Ver Analytics no Vercel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const { metrics, topPages, topCountries, topDevices } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-purple-600" />
            Vercel Web Analytics
          </h3>
          <p className="text-muted-foreground mt-1">
            Últimos {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : '90 dias'}
          </p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.visitors.toLocaleString('pt-BR') || 0}</div>
            <p className="text-xs text-muted-foreground">Visitantes únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pageViews.toLocaleString('pt-BR') || 0}</div>
            <p className="text-xs text-muted-foreground">Total de page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avgDuration ? `${Math.round(metrics.avgDuration / 1000)}s` : '0s'}
            </div>
            <p className="text-xs text-muted-foreground">Duração média da visita</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.bounceRate ? `${Math.round(metrics.bounceRate * 100)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Bounce rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Páginas Mais Visitadas e Países */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        {topPages && topPages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Páginas Mais Visitadas
              </CardTitle>
              <CardDescription>Top {topPages.length} páginas por visualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPages.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[70%]" title={page.path}>
                      {page.path || '/'}
                    </span>
                    <span className="text-sm font-medium">{page.views.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Countries */}
        {topCountries && topCountries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600" />
                Top Países
              </CardTitle>
              <CardDescription>Visitantes por localização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCountries.slice(0, 10).map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{country.country}</span>
                    <span className="text-sm font-medium">{country.visitors.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dispositivos */}
      {topDevices && topDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-purple-600" />
              Dispositivos
            </CardTitle>
            <CardDescription>Distribuição por tipo de dispositivo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topDevices.map((device, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(device.percentage)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{device.device}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link para dashboard completo */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold mb-1">Ver dados completos</h4>
            <p className="text-sm text-muted-foreground">
              Acesse o dashboard completo no Vercel para mais detalhes
            </p>
          </div>
          <a
            href="https://vercel.com/izadoracurys-projects/catbytes-2-0/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            <Activity className="h-4 w-4" />
            Abrir Vercel
          </a>
        </div>
      </Card>
    </div>
  )
}
