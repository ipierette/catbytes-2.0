'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users, 
  Calendar, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'

interface AnalyticsData {
  blog: {
    views: number
    viewsChange: number
    posts: number
    postsChange: number
    avgReadTime: string
    topPosts: Array<{ title: string; views: number; slug: string }>
  }
  instagram: {
    followers: number
    followersChange: number
    engagement: number
    engagementChange: number
    posts: number
    topPosts: Array<{ caption: string; likes: number; comments: number }>
  }
  general: {
    totalVisitors: number
    visitorsChange: number
    bounceRate: number
    bounceRateChange: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Simular dados de analytics
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData({
        blog: {
          views: 15420,
          viewsChange: 12.5,
          posts: 42,
          postsChange: 8.3,
          avgReadTime: '3m 24s',
          topPosts: [
            { title: 'Como criar uma API REST com Node.js', views: 2340, slug: 'api-rest-nodejs' },
            { title: 'React vs Vue: Qual escolher em 2025?', views: 1890, slug: 'react-vs-vue-2025' },
            { title: 'Inteligência Artificial no Desenvolvimento', views: 1650, slug: 'ia-desenvolvimento' }
          ]
        },
        instagram: {
          followers: 8450,
          followersChange: 15.8,
          engagement: 4.2,
          engagementChange: -2.1,
          posts: 120,
          topPosts: [
            { caption: 'Dica de programação: Como otimizar...', likes: 245, comments: 18 },
            { caption: 'Tutorial rápido de CSS Grid...', likes: 198, comments: 12 },
            { caption: 'Novidades do JavaScript ES2024...', likes: 176, comments: 9 }
          ]
        },
        general: {
          totalVisitors: 28350,
          visitorsChange: 18.7,
          bounceRate: 34.2,
          bounceRateChange: -5.8
        }
      })
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatChange = (value: number) => {
    const isPositive = value > 0
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(value)}%
      </div>
    )
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayoutWrapper title="Analytics" description="Métricas e relatórios">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </AdminLayoutWrapper>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayoutWrapper title="Analytics" description="Métricas e relatórios">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Analytics & Métricas
              </h1>
              <p className="text-muted-foreground mt-1">
                Análise de performance do conteúdo e audiência
              </p>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                </Button>
              ))}
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitantes Totais</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.general.totalVisitors.toLocaleString()}</div>
                {formatChange(data?.general.visitorsChange || 0)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Views do Blog</CardTitle>
                <Eye className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.blog.views.toLocaleString()}</div>
                {formatChange(data?.blog.viewsChange || 0)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seguidores Instagram</CardTitle>
                <Users className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.instagram.followers.toLocaleString()}</div>
                {formatChange(data?.instagram.followersChange || 0)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.general.bounceRate}%</div>
                {formatChange(data?.general.bounceRateChange || 0)}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Blog Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Performance do Blog
                </CardTitle>
                <CardDescription>
                  Métricas e posts mais populares
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Posts Publicados</div>
                    <div className="text-2xl font-bold text-blue-600">{data?.blog.posts}</div>
                    <div className="text-xs text-muted-foreground">+{data?.blog.postsChange}% este mês</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Tempo Médio</div>
                    <div className="text-2xl font-bold text-green-600">{data?.blog.avgReadTime}</div>
                    <div className="text-xs text-muted-foreground">de leitura</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Top Posts do Blog</h4>
                  <div className="space-y-2">
                    {data?.blog.topPosts.map((post, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium line-clamp-1">{post.title}</div>
                          <div className="text-xs text-muted-foreground">/{post.slug}</div>
                        </div>
                        <div className="text-sm font-bold text-blue-600">{post.views.toLocaleString()} views</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instagram Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance do Instagram
                </CardTitle>
                <CardDescription>
                  Engajamento e posts mais populares
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Taxa de Engajamento</div>
                    <div className="text-2xl font-bold text-pink-600">{data?.instagram.engagement}%</div>
                    <div className="text-xs text-muted-foreground">{data?.instagram.engagementChange}% este mês</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Posts Publicados</div>
                    <div className="text-2xl font-bold text-purple-600">{data?.instagram.posts}</div>
                    <div className="text-xs text-muted-foreground">total</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Top Posts do Instagram</h4>
                  <div className="space-y-2">
                    {data?.instagram.topPosts.map((post, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium mb-2 line-clamp-2">{post.caption}</div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>❤️ {post.likes} likes</span>
                          <span>💬 {post.comments} comentários</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Crescimento ao Longo do Tempo
              </CardTitle>
              <CardDescription>
                Evolução das métricas principais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center space-y-3">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="font-semibold text-gray-600">Gráfico de Crescimento</h3>
                    <p className="text-sm text-muted-foreground">
                      Integração com Google Analytics em desenvolvimento
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Exportação</CardTitle>
              <CardDescription>
                Gere relatórios detalhados dos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline">
                  📊 Exportar para Excel
                </Button>
                <Button variant="outline">
                  📈 Relatório PDF
                </Button>
                <Button variant="outline">
                  📧 Enviar por Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}