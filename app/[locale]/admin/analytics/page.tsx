'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ArrowDownRight,
  RefreshCw,
  Zap,
  Target,
  Clock
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
  ResponsiveContainer
} from 'recharts'

interface RealTimeData {
  activeUsers: number
  dailyViews: number
  dailyBlogViews: number
  serverStatus: string
  currentSessions: number
  todayGoal: {
    views: { current: number; target: number }
    blogReads: { current: number; target: number }
  }
  systemHealth: {
    memory: string
    cpu: string
    uptime: string
  }
  timestamp: string
}

interface AnalyticsData {
  posts: {
    total: number
    period: number
    change: number
  }
  views: {
    total: number
    change: number
    uniqueReaders?: number
  }
  topPosts: Array<{ title: string; views: number; slug: string }>
  avgReadTime: string
  traffic: Array<{
    date: string
    blogViews: number
    visitors: number
    pageViews?: number
  }>
  engagement?: {
    totalReads: number
    avgScrollDepth: string
    returnReaders: string
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [realtimeData, setRealtimeData] = useState<RealTimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [period, setPeriod] = useState('30d')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch analytics data
      const [analyticsResponse, realtimeResponse] = await Promise.all([
        fetch(`/api/analytics/blog?period=${period}`),
        fetch('/api/analytics/realtime')
      ])
      
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json()
        
        if (analyticsResult.success && analyticsResult.data) {
          setData(analyticsResult.data)
          setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
        }
      }

      if (realtimeResponse.ok) {
        const realtimeResult = await realtimeResponse.json()
        
        if (realtimeResult.success && realtimeResult.data) {
          setRealtimeData(realtimeResult.data)
        }
      }
    } catch (error) {
      console.error('[Analytics] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  // Auto-refresh setup
  useEffect(() => {
    loadAnalytics()
    
    if (autoRefresh) {
      // Refresh analytics every 5 minutes
      const analyticsInterval = setInterval(loadAnalytics, 5 * 60 * 1000)
      
      // Refresh real-time data every 30 seconds
      const realtimeInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/analytics/realtime')
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setRealtimeData(result.data)
              setLastUpdate(new Date().toLocaleTimeString('pt-BR'))
            }
          }
        } catch (error) {
          console.warn('[Analytics] Real-time refresh failed:', error)
        }
      }, 30 * 1000)
      
      return () => {
        clearInterval(analyticsInterval)
        clearInterval(realtimeInterval)
      }
    }
  }, [autoRefresh, loadAnalytics])

  const handleManualRefresh = () => {
    setAutoRefresh(false)
    loadAnalytics()
    setTimeout(() => setAutoRefresh(true), 1000)
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

          {/* Real-time Stats */}
          {realtimeData && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Métricas em Tempo Real</h3>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Online
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleManualRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Última atualização: {lastUpdate}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Usuários Ativos</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {realtimeData.activeUsers}
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Views Hoje</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {realtimeData.dailyViews}
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Meta Diária</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {realtimeData.todayGoal.views.current}/{realtimeData.todayGoal.views.target}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((realtimeData.todayGoal.views.current / realtimeData.todayGoal.views.target) * 100)}% da meta
                  </div>
                </div>
                
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {realtimeData.systemHealth?.uptime || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    CPU: {realtimeData.systemHealth?.cpu || 'N/A'} | RAM: {realtimeData.systemHealth?.memory || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.posts.total || 0}</div>
                {formatChange(data?.posts.change || 0)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Views do Blog</CardTitle>
                <Eye className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.views.total.toLocaleString() || 0}</div>
                {formatChange(data?.views.change || 0)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leitores Únicos</CardTitle>
                <Users className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.views.uniqueReaders?.toLocaleString() || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Diferentes usuários que leram posts
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Leitura</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.avgReadTime || 'N/A'}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tempo médio por post
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Chart */}
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
                      name === 'visitors' ? 'Visitantes' : 
                      name === 'blogViews' ? 'Views do Blog' : 
                      name === 'pageViews' ? 'Page Views' : name
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="visitors" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="blogViews" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  {data?.traffic?.[0]?.pageViews && (
                    <Area type="monotone" dataKey="pageViews" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Posts Mais Visualizados
              </CardTitle>
              <CardDescription>
                Conteúdo com melhor performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data?.topPosts && data.topPosts.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.topPosts} layout="horizontal">
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
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Top 3 Posts:</div>
                    {data.topPosts.slice(0, 3).map((post, index) => (
                      <div key={post.slug || index} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-blue-500 text-white text-xs rounded flex items-center justify-center">
                            {index + 1}
                          </span>
                          {post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title}
                        </span>
                        <span className="font-bold text-blue-600">{post.views.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum post encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}
