'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  BookOpen,
  Clock,
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react'
import {
  ViewsOverTimeChart,
  TopPostsChart,
  DistributionPieChart,
  ProgressBarList
} from './analytics-charts'

interface BlogAnalyticsData {
  totalViews: number
  totalReads: number
  avgReadTime: number
  avgScrollDepth: number
  topPosts: Array<{
    id: string
    title: string
    slug: string
    views: number
    reads: number
    avgReadTime: number
    bounceRate: number
  }>
  viewsByDay: Array<{
    date: string
    views: number
    reads: number
  }>
  viewsByLanguage: Record<string, number>
  engagementMetrics: {
    totalSessions: number
    qualityReads: number
    completionRate: number
  }
}

interface BlogAnalyticsSectionProps {
  period: '7d' | '30d' | '90d'
}

export function BlogAnalyticsSection({ period }: BlogAnalyticsSectionProps) {
  const [data, setData] = useState<BlogAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBlogAnalytics()
  }, [period])

  const loadBlogAnalytics = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/blog-analytics')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error loading blog analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0s'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes === 0) return `${secs}s`
    return `${minutes}m ${secs}s`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num || 0)
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
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">Nenhum dado disponível</p>
            <p className="text-xs text-muted-foreground">
              Os dados serão coletados automaticamente quando houver leituras no blog
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar dados para gráficos
  const languageData = Object.entries(data.viewsByLanguage).map(([lang, count]) => ({
    name: lang === 'pt-BR' ? 'Português' : lang === 'en-US' ? 'English' : lang,
    value: count
  }))

  const hasData = data.totalViews > 0 || data.totalReads > 0

  return (
    <div className="space-y-6">
      {/* Info sobre dados */}
      {!hasData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Analytics do Blog:</strong> Os dados começarão a aparecer assim que os
            leitores interagirem com os posts do blog. O tracking está ativo e funcionando.
          </p>
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.engagementMetrics.totalSessions)} sessões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leituras</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalReads)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.engagementMetrics.qualityReads)} qualidade (&gt;30s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(data.avgReadTime)}</div>
            <p className="text-xs text-muted-foreground">de leitura</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scroll Médio</CardTitle>
            <MousePointerClick className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgScrollDepth}%</div>
            <p className="text-xs text-muted-foreground">
              {data.engagementMetrics.completionRate.toFixed(1)}% completaram (&gt;80%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Visualizações ao Longo do Tempo */}
      {data.viewsByDay.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Visualizações e Leituras ao Longo do Tempo
            </CardTitle>
            <CardDescription>
              Acompanhe o engajamento diário com os posts do blog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ViewsOverTimeChart data={data.viewsByDay} />
          </CardContent>
        </Card>
      )}

      {/* Grid com 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        {data.topPosts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Top 10 Posts
              </CardTitle>
              <CardDescription>Posts mais visualizados no período</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBarList
                data={data.topPosts.slice(0, 10).map((post, index) => ({
                  title: `${index + 1}. ${post.title}`,
                  value: post.views,
                  subtitle: `${post.reads} leituras • ${formatTime(post.avgReadTime)} • Bounce: ${post.bounceRate}%`
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Distribuição por Idioma */}
        {languageData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Distribuição por Idioma
              </CardTitle>
              <CardDescription>Preferências de idioma dos leitores</CardDescription>
            </CardHeader>
            <CardContent>
              {languageData.length > 0 ? (
                <DistributionPieChart data={languageData} />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Sem dados de idioma ainda
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráfico de Barras - Top Posts */}
      {data.topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ranking de Posts por Visualizações
            </CardTitle>
            <CardDescription>Comparação visual dos posts mais populares</CardDescription>
          </CardHeader>
          <CardContent>
            <TopPostsChart
              data={data.topPosts.map(post => ({
                title: post.title,
                views: post.views
              }))}
              maxItems={10}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabela Detalhada */}
      {data.topPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Análise Detalhada por Post
            </CardTitle>
            <CardDescription>Métricas completas de engajamento de cada post</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Post</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Leituras</TableHead>
                    <TableHead className="text-right">Tempo Médio</TableHead>
                    <TableHead className="text-right">Bounce Rate</TableHead>
                    <TableHead className="text-right">Taxa Conv.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topPosts.map(post => {
                    const conversionRate = post.views > 0
                      ? ((post.reads / post.views) * 100).toFixed(1)
                      : '0.0'

                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-[350px]">
                            <p className="truncate">{post.title}</p>
                            <p className="text-xs text-muted-foreground">/{post.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatNumber(post.views)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(post.reads)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatTime(post.avgReadTime)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              post.bounceRate > 70
                                ? 'destructive'
                                : post.bounceRate > 50
                                ? 'secondary'
                                : 'default'
                            }
                          >
                            {post.bounceRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              parseFloat(conversionRate) > 50
                                ? 'default'
                                : parseFloat(conversionRate) > 30
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {conversionRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas de Engajamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Métricas de Engajamento
          </CardTitle>
          <CardDescription>Análise do comportamento dos leitores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Sessões Totais</p>
              <p className="text-3xl font-bold">{formatNumber(data.engagementMetrics.totalSessions)}</p>
              <p className="text-xs text-muted-foreground">visitantes únicos no período</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Leituras de Qualidade</p>
              <p className="text-3xl font-bold">{formatNumber(data.engagementMetrics.qualityReads)}</p>
              <p className="text-xs text-muted-foreground">leituras com mais de 30 segundos</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
              <p className="text-3xl font-bold">{data.engagementMetrics.completionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">leitores que rolaram mais de 80%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
