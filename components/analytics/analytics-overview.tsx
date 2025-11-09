'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Info
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AnalyticsData {
  overview: {
    totalUsers: number
    sessions: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
  }
  topPages: Array<{
    title: string
    path: string
    views: number
  }>
  trafficSources: Array<{
    source: string
    sessions: number
  }>
  period: string
  timestamp: string
}

interface AnalyticsOverviewProps {
  period?: '7d' | '30d' | '90d'
}

export function AnalyticsOverview({ period = '30d' }: AnalyticsOverviewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/analytics/google?period=${selectedPeriod}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setIsDemo(result.isDemo || false)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com seleção de período */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Google Analytics
          </h2>
          {isDemo && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ Dados demo - Configure Google Analytics para dados reais
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <Button
              key={p}
              variant={selectedPeriod === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(p)}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </Button>
          ))}
        </div>
      </div>

      {/* Métricas principais */}
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-help">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Google Analytics (GA4)</p>
                  <p className="text-xs">Conta TODOS os visitantes incluindo bots, crawlers e visitas muito rápidas. Melhor métrica para comparar com outros sites.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">visitantes únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Sessões</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-help">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Google Analytics (GA4)</p>
                  <p className="text-xs">Total de visitas ao site. Uma sessão pode ter várias visualizações de páginas. Útil para entender o volume de tráfego geral.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.sessions)}</div>
            <p className="text-xs text-muted-foreground">total de visitas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-help">
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Google Analytics (GA4)</p>
                  <p className="text-xs">Cada carregamento de página. Inclui recarregamentos e navegação. Esta é a métrica mais alta porque conta tudo.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.pageViews)}</div>
            <p className="text-xs text-muted-foreground">páginas vistas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.bounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">saíram rapidamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Activity className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.overview.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">por sessão</p>
          </CardContent>
        </Card>
      </div>
      </TooltipProvider>

      {/* Gráficos e tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Páginas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Páginas Mais Visitadas
            </CardTitle>
            <CardDescription>
              Top 10 páginas por visualizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPages.map((page, index) => {
                const maxViews = data.topPages[0].views
                const percentage = (page.views / maxViews) * 100

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium truncate">{page.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{page.path}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{formatNumber(page.views)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(page.path, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Fontes de Tráfego */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fontes de Tráfego
            </CardTitle>
            <CardDescription>
              De onde vêm os visitantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trafficSources.map((source, index) => {
                const maxSessions = data.trafficSources[0].sessions
                const percentage = (source.sessions / maxSessions) * 100
                const percentageOfTotal = (source.sessions / data.overview.sessions) * 100

                const sourceColors: Record<string, string> = {
                  google: 'bg-blue-600',
                  direct: 'bg-gray-600',
                  linkedin: 'bg-blue-500',
                  github: 'bg-purple-600',
                  instagram: 'bg-pink-600'
                }

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{formatNumber(source.sessions)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({percentageOfTotal.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${sourceColors[source.source] || 'bg-gray-600'} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de Sessões</span>
                <span className="text-lg font-bold">{formatNumber(data.overview.sessions)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-muted-foreground text-center">
        Última atualização: {new Date(data.timestamp).toLocaleString('pt-BR')}
      </div>
    </div>
  )
}
