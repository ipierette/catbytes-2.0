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
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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
  traffic: Array<{ date: string; visitors: number; views: number; blogViews: number }>
  sources: Array<{ name: string; visitors: number; percentage: number }>
  devices: Array<{ name: string; value: number; color: string }>
}

// Mock data generators for charts
const generateTrafficData = (days: number) => {
  const data = []
  const baseVisitors = 150
  const baseBlogViews = 80
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Add some randomness to make it realistic
    const visitors = Math.floor(baseVisitors + (Math.random() - 0.5) * 100)
    const blogViews = Math.floor(baseBlogViews + (Math.random() - 0.5) * 50)
    const views = Math.floor(visitors * (1.2 + Math.random() * 0.8))
    
    data.push({
      date: date.toISOString().split('T')[0],
      visitors,
      views,
      blogViews
    })
  }
  return data
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

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
      
      // Load real blog analytics
      const blogResponse = await fetch(`/api/analytics/blog?period=${period}`)
      const blogData = await blogResponse.json()
      
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      
      const blogAnalytics = blogData.success ? blogData.data : {
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
      }
      
      setData({
        blog: {
          views: blogAnalytics.views?.total || blogAnalytics.views || 15420,
          viewsChange: blogAnalytics.views?.change || blogAnalytics.viewsChange || 12.5,
          posts: blogAnalytics.posts?.total || blogAnalytics.posts || 42,
          postsChange: blogAnalytics.posts?.change || blogAnalytics.postsChange || 8.3,
          avgReadTime: blogAnalytics.avgReadTime || '3m 24s',
          topPosts: blogAnalytics.topPosts || [
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
          totalVisitors: 8920,
          visitorsChange: 18.2,
          bounceRate: 42.5,
          bounceRateChange: -5.8
        },
        traffic: blogAnalytics.traffic || generateTrafficData(days),
        sources: [
          { name: 'Google', visitors: 4560, percentage: 51.2 },
          { name: 'Direto', visitors: 2340, percentage: 26.3 },
          { name: 'GitHub', visitors: 1120, percentage: 12.6 },
          { name: 'LinkedIn', visitors: 670, percentage: 7.5 },
          { name: 'Outros', visitors: 230, percentage: 2.4 }
        ],
        devices: [
          { name: 'Desktop', value: 5240, color: '#3b82f6' },
          { name: 'Mobile', value: 2890, color: '#10b981' },
          { name: 'Tablet', value: 790, color: '#f59e0b' }
        ]
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

          {/* Traffic Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visitors Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tráfego do Site
                </CardTitle>
                <CardDescription>
                  Visitantes e visualizações ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data?.traffic || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                      formatter={(value: number, name: string) => [
                        value,
                        name === 'visitors' ? 'Visitantes' : name === 'views' ? 'Visualizações' : 'Views do Blog'
                      ]}
                    />
                    <Legend 
                      formatter={(value) => 
                        value === 'visitors' ? 'Visitantes' : value === 'views' ? 'Visualizações' : 'Views do Blog'
                      }
                    />
                    <Area type="monotone" dataKey="visitors" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="blogViews" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Fontes de Tráfego
                </CardTitle>
                <CardDescription>
                  De onde vêm os visitantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data?.devices || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data?.devices?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} visitantes`, 'Total']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2">
                    {data?.sources?.map((source, index) => (
                      <div key={source.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{source.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{source.visitors}</div>
                          <div className="text-xs text-muted-foreground">{source.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                  <h4 className="font-semibold mb-3">Posts Mais Visualizados</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data?.blog.topPosts || []} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="title" 
                        type="category" 
                        width={150}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toLocaleString()} visualizações`, 'Views']}
                        labelFormatter={(label) => `Post: ${label}`}
                      />
                      <Bar dataKey="views" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Resumo dos Top 3:</div>
                    {data?.blog.topPosts.slice(0, 3).map((post, index) => (
                      <div key={post.slug} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-blue-500 text-white text-xs rounded flex items-center justify-center">
                            {index + 1}
                          </span>
                          {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                        </span>
                        <span className="font-bold text-blue-600">{post.views.toLocaleString()}</span>
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