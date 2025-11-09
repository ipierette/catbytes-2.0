'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Eye,
  BookOpen,
  Clock,
  TrendingUp,
  Activity,
  Globe,
  Zap,
  Info
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { UnifiedTrafficChart, ProgressBarList } from './analytics-charts'

interface OverviewData {
  google: {
    totalUsers: number
    pageViews: number
    sessions: number
    bounceRate: number
    avgSessionDuration: number
    topPages: Array<{
      title: string
      path: string
      views: number
    }>
  } | null
  blog: {
    totalViews: number
    totalReads: number
    avgReadTime: number
    topPosts: Array<{
      title: string
      slug: string
      views: number
    }>
  } | null
  combined: {
    blogPercentage: number
  }
}

interface OverviewSectionProps {
  period: '7d' | '30d' | '90d'
}

export function OverviewSection({ period }: OverviewSectionProps) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGoogleDemo, setIsGoogleDemo] = useState(false)

  useEffect(() => {
    loadOverviewData()
  }, [period])

  const loadOverviewData = async () => {
    try {
      setLoading(true)

      // Fetch both APIs in parallel
      const [googleResponse, blogResponse] = await Promise.all([
        fetch(`/api/analytics/google?period=${period}`),
        fetch('/api/admin/blog-analytics')
      ])

      const googleResult = await googleResponse.json()
      const blogResult = await blogResponse.json()

      if (googleResult.success && blogResult.success) {
        const googleData = googleResult.data
        const blogData = blogResult.data

        // Calculate blog percentage of total traffic
        const blogPercentage = googleData.overview.pageViews > 0
          ? (blogData.totalViews / googleData.overview.pageViews) * 100
          : 0

        setData({
          google: googleData.overview,
          blog: {
            totalViews: blogData.totalViews,
            totalReads: blogData.totalReads,
            avgReadTime: blogData.avgReadTime,
            topPosts: blogData.topPosts.slice(0, 5)
          },
          combined: {
            blogPercentage
          }
        })

        setIsGoogleDemo(googleResult.isDemo || false)
      }
    } catch (error) {
      console.error('Error loading overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num || 0)
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0s'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes === 0) return `${secs}s`
    return `${minutes}m ${secs}s`
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
            <Activity className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      {isGoogleDemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Modo Demo:</strong> Os dados do Google Analytics são simulados. Configure
            as credenciais para ver dados reais. Os dados do blog são reais quando houver tráfego.
          </p>
        </div>
      )}

      {/* Cards Principais - Visão Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Usuários Totais (Google) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.google?.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">visitantes únicos (Google)</p>
          </CardContent>
        </Card>

        {/* Card 2: Visualizações Totais (Google) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.google?.pageViews || 0)}</div>
            <p className="text-xs text-muted-foreground">páginas vistas (Google)</p>
          </CardContent>
        </Card>

        {/* Card 3: Leituras de Blog */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Leituras de Blog</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Leituras Engajadas (Sistema Próprio)</p>
                    <p className="text-xs">Conta apenas quando o visitante permanece no artigo por mais de 30 segundos E rola a página. Mede leituras de qualidade real.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.blog?.totalReads || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {data.combined.blogPercentage.toFixed(1)}% do tráfego total
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Tempo Médio no Blog */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio (Blog)</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(data.blog?.avgReadTime || 0)}</div>
            <p className="text-xs text-muted-foreground">de leitura por post</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Secundários - Métricas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sessões (Google) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.google?.sessions || 0)}</div>
            <p className="text-xs text-muted-foreground">visitas ao site (Google)</p>
          </CardContent>
        </Card>

        {/* Taxa de Rejeição (Google) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.google?.bounceRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">saíram rapidamente (Google)</p>
          </CardContent>
        </Card>

        {/* Visualizações de Blog */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Views de Blog</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Visualizações de Blog (Sistema Próprio)</p>
                    <p className="text-xs">Conta cada visita aos artigos do blog que permanece por mais de 10 segundos. Filtra bounces rápidos mas conta todas as visitas reais aos artigos.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.blog?.totalViews || 0)}</div>
            <p className="text-xs text-muted-foreground">visualizações no blog</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparação: Google vs Blog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Comparação de Performance
          </CardTitle>
          <CardDescription>
            Como o blog se compara ao tráfego geral do site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estatísticas Comparativas */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Blog do Total de Tráfego</span>
                  <span className="text-sm font-bold">{data.combined.blogPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(data.combined.blogPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de Páginas</span>
                  <span className="font-semibold">{formatNumber(data.google?.pageViews || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Visualizações de Blog</span>
                  <span className="font-semibold">{formatNumber(data.blog?.totalViews || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Leituras Efetivas</span>
                  <span className="font-semibold">{formatNumber(data.blog?.totalReads || 0)}</span>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm mb-3">📊 Insights</h4>

              {data.combined.blogPercentage > 40 && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    ✅ <strong>Excelente!</strong> O blog representa mais de 40% do seu tráfego.
                    Continue criando conteúdo de qualidade!
                  </p>
                </div>
              )}

              {data.combined.blogPercentage > 20 && data.combined.blogPercentage <= 40 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    👍 <strong>Bom desempenho!</strong> O blog está crescendo e atraindo
                    leitores. Continue investindo em conteúdo.
                  </p>
                </div>
              )}

              {data.combined.blogPercentage > 0 && data.combined.blogPercentage <= 20 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Potencial de crescimento:</strong> O blog tem espaço para
                    crescer. Considere otimizar SEO e promover mais os posts.
                  </p>
                </div>
              )}

              {data.blog && data.blog.totalReads > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <p className="text-sm text-purple-800">
                    📖 <strong>Engajamento:</strong> Tempo médio de leitura de{' '}
                    {formatTime(data.blog.avgReadTime)} indica que o conteúdo é relevante!
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Páginas vs Top Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Páginas (Google) */}
        {data.google && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Top Páginas do Site
              </CardTitle>
              <CardDescription>Páginas mais visitadas (Google Analytics)</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBarList
                data={(data.google as any).topPages?.slice(0, 5).map((page: any) => ({
                  title: page.title,
                  value: page.views,
                  subtitle: page.path
                })) || []}
              />
            </CardContent>
          </Card>
        )}

        {/* Top Posts do Blog */}
        {data.blog && data.blog.topPosts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Top Posts do Blog
              </CardTitle>
              <CardDescription>Posts mais lidos (dados próprios)</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBarList
                data={data.blog.topPosts.map((post) => ({
                  title: post.title,
                  value: post.views,
                  subtitle: `/${post.slug}`
                }))}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
