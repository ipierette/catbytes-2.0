'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Activity, 
  TrendingUp, 
  FileText, 
  Instagram, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Mail,
  FileBarChart
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { ActionRequiredCard } from '@/components/admin/action-required-card'
import { WeeklyCostAnalyticsCard } from '@/components/admin/weekly-cost-analytics-card'

interface SystemStats {
  blog: {
    totalPosts: number
    publishedPosts: number
    drafts: number
    lastGenerated: string
  }
  instagram: {
    totalPosts: number
    pendingPosts: number
    publishedPosts: number
    lastGenerated: string
  }
  automation: {
    status: 'active' | 'paused'
    nextRun: string
    lastRun: string
    cronJobs: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [sendingReport, setSendingReport] = useState<'daily' | 'weekly' | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Carregar dados reais do Supabase
      const [blogResponse, instagramResponse] = await Promise.all([
        fetch('/api/blog/stats'),
        fetch('/api/instagram/stats')
      ])

      const blogData = await blogResponse.json()
      const instagramData = await instagramResponse.json()
      
      setStats({
        blog: {
          totalPosts: blogData.total || 0,
          publishedPosts: blogData.published || 0,
          drafts: blogData.drafts || 0,
          lastGenerated: blogData.lastGenerated || new Date().toISOString()
        },
        instagram: {
          totalPosts: instagramData.stats?.total || 0,
          pendingPosts: instagramData.stats?.pending || 0,
          publishedPosts: instagramData.stats?.published || 0,
          lastGenerated: new Date().toISOString()
        },
        automation: {
          status: 'active',
          nextRun: '2025-11-06T13:00:00Z',
          lastRun: '2025-11-05T13:00:00Z',
          cronJobs: 2
        }
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar estatísticas' })
    } finally {
      setLoading(false)
    }
  }

  const sendReport = async (type: 'daily' | 'weekly') => {
    try {
      setSendingReport(type)
      setMessage(null)

      const response = await fetch('/api/reports/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || `Relatório ${type === 'daily' ? 'diário' : 'semanal'} enviado com sucesso!`
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao enviar relatório'
        })
      }
    } catch (error) {
      console.error('Error sending report:', error)
      setMessage({
        type: 'error',
        text: 'Erro ao enviar relatório'
      })
    } finally {
      setSendingReport(null)
      // Remove mensagem após 5 segundos
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayoutWrapper title="Dashboard Principal" description="Painel de controle da mega automação">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </AdminLayoutWrapper>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayoutWrapper title="Dashboard Principal" description="Painel de controle da mega automação">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8" />
                Dashboard Principal
              </h1>
              <p className="text-muted-foreground mt-1">
                Visão geral do sistema de automação
              </p>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posts do Blog</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.blog.totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.blog.publishedPosts || 0} publicados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Posts Instagram</CardTitle>
                <Instagram className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-600">{stats?.instagram.totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.instagram.pendingPosts || 0} pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automação</CardTitle>
                <Zap className={`h-4 w-4 ${stats?.automation.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats?.automation.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {stats?.automation.status === 'active' ? 'ATIVA' : 'PAUSADA'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.automation.cronJobs || 0}/2 cron jobs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próxima Execução</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">13:00</div>
                <p className="text-xs text-muted-foreground">
                  Amanhã
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Action Required Card */}
            <ActionRequiredCard />

            {/* Weekly Cost Analytics Card */}
            <WeeklyCostAnalyticsCard />
          </div>

          {/* Automation Status - Informativo, não navegacional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status da Automação
              </CardTitle>
              <CardDescription>
                Cronograma e configurações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Geração de Blog
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Próximo:</strong> Ter/Qui/Sáb/Dom às 13h BRT<br/>
                    <strong>Conteúdo:</strong> Artigo + Imagem DALL-E<br/>
                    <strong>Ações:</strong> Newsletter + Posts Sociais
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`h-2 w-2 rounded-full ${stats?.automation.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-muted-foreground">
                      {stats?.automation.status === 'active' ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Publicação Agendada
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Frequência:</strong> Diariamente às 13h BRT<br/>
                    <strong>Ação:</strong> Publica posts aprovados<br/>
                    <strong>Plataformas:</strong> Instagram + LinkedIn
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Ativo</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Recursos do Sistema
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Cron Jobs:</strong> 2/2 slots Vercel<br/>
                    <strong>APIs:</strong> OpenAI, DALL-E, Instagram<br/>
                    <strong>Storage:</strong> Supabase PostgreSQL
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Operacional</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Relatórios por Email
              </CardTitle>
              <CardDescription>
                Envie relatórios de atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileBarChart className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Relatório Diário</h4>
                      <p className="text-sm text-muted-foreground">
                        Resumo das atividades de hoje
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => sendReport('daily')}
                    disabled={sendingReport === 'daily'}
                    className="w-full"
                  >
                    {sendingReport === 'daily' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Relatório Diário
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileBarChart className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Relatório Semanal</h4>
                      <p className="text-sm text-muted-foreground">
                        Resumo das últimas 7 dias
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => sendReport('weekly')}
                    disabled={sendingReport === 'weekly'}
                    className="w-full"
                    variant="outline"
                  >
                    {sendingReport === 'weekly' ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Relatório Semanal
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}