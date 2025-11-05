'use client'

/**
 * 🎛️ DASHBOARD DE AUTOMAÇÃO DIGITAL
 * 
 * Painel de controle completo para campanhas multi-plataforma
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'

interface CampaignStats {
  status: string
  campaignSystem: {
    version: string
    features: string[]
    lastRun: string
    totalPosts: number
    approvedPosts: number
    publishedPosts: number
  }
  credentials: {
    instagram: boolean
    openai: boolean
    email: boolean
    whatsapp: boolean
  }
}

interface CampaignResult {
  success: boolean
  campaignId: string
  summary: {
    tema: string
    nicho: string
    timestamp: string
    platforms: {
      instagram: { status: string; success: boolean; postId?: string; error?: string }
      email: { status: string; success: boolean; error?: string }
      whatsapp: { status: string; success: boolean; error?: string }
    }
    content: {
      seo: { title: string; description: string; keywords: string[] }
      instagram: { hashtags: string[]; captionLength: number }
      twitter: { threadLength: number }
    }
  }
  metrics: {
    successRate: number
    platformsReached: number
    totalPlatforms: number
  }
}

export default function MegaCampaignDashboard() {
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<CampaignResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  // Carrega stats iniciais
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/campaign/mega-automation-disabled')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }

  const runCampaign = async () => {
    setIsRunning(true)
    setLogs(['🚀 Iniciando mega campanha digital...'])
    
    try {
      const response = await fetch('/api/campaign/mega-automation-disabled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'
        }
      })

      const result = await response.json()
      setLastResult(result)
      
      if (result.success) {
        setLogs(prev => [...prev, 
          `✅ Campanha executada com sucesso!`,
          `🎯 Tema: ${result.summary.tema}`,
          `📊 Taxa de sucesso: ${result.metrics.successRate.toFixed(1)}%`,
          `📱 Plataformas atingidas: ${result.metrics.platformsReached}/${result.metrics.totalPlatforms}`
        ])
      } else {
        setLogs(prev => [...prev, `❌ Erro na campanha: ${result.error}`])
      }

      await fetchStats()
    } catch (error) {
      setLogs(prev => [...prev, `💥 Erro fatal: ${error}`])
    } finally {
      setIsRunning(false)
    }
  }

  const testInstagramOnly = async () => {
    setIsRunning(true)
    setLogs(['📸 Testando apenas Instagram...'])
    
    try {
      const response = await fetch('/api/instagram/publish-scheduled', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setLogs(prev => [...prev, 
          `✅ Instagram: ${result.published} posts publicados`,
          ...(result.errors ? [`❌ Erros: ${result.failed}`] : [])
        ])
      } else {
        setLogs(prev => [...prev, `❌ Instagram falhou: ${result.error}`])
      }

      await fetchStats()
    } catch (error) {
      setLogs(prev => [...prev, `💥 Erro no Instagram: ${error}`])
    } finally {
      setIsRunning(false)
    }
  }

  const generateBatch = async () => {
    setIsRunning(true)
    setLogs(['📝 Gerando lote de posts...'])
    
    try {
      const response = await fetch('/api/instagram/generate-batch', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setLogs(prev => [...prev, 
          `✅ Lote gerado: ${result.generated} posts`,
          `📝 Total pendente: ${result.totalPending}`,
          `🎯 Próximo nicho: ${result.nextNiche || 'N/A'}`
        ])
      } else {
        setLogs(prev => [...prev, `❌ Falha na geração: ${result.error}`])
      }

      await fetchStats()
    } catch (error) {
      setLogs(prev => [...prev, `💥 Erro na geração: ${error}`])
    } finally {
      setIsRunning(false)
    }
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
          <AdminLayoutWrapper
        title="Mega Campaign Manager"
        description="Gerencie suas campanhas de automação"
      >
      <div className="max-w-7xl mx-auto">{/* Container removido do header, agora está no layout */}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">Total de Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {stats.campaignSystem.totalPosts}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {stats.campaignSystem.approvedPosts}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-600">Publicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {stats.campaignSystem.publishedPosts}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {lastResult ? `${lastResult.metrics.successRate.toFixed(1)}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credentials Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔑 Status das Credenciais
          </CardTitle>
          <CardDescription>
            Verificação das integrações necessárias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={stats.credentials.instagram ? "default" : "destructive"}>
                📸 Instagram
              </Badge>
              {stats.credentials.instagram ? '✅' : '❌'}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={stats.credentials.openai ? "default" : "destructive"}>
                🧠 OpenAI
              </Badge>
              {stats.credentials.openai ? '✅' : '❌'}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={stats.credentials.email ? "default" : "destructive"}>
                📧 Email
              </Badge>
              {stats.credentials.email ? '✅' : '❌'}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={stats.credentials.whatsapp ? "default" : "destructive"}>
                📱 WhatsApp
              </Badge>
              {stats.credentials.whatsapp ? '✅' : '❌'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>🎛️ Painel de Controle</CardTitle>
            <CardDescription>
              Execute campanhas e operações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runCampaign} 
              disabled={isRunning}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              {isRunning ? '⏳ Executando...' : '🚀 EXECUTAR MEGA CAMPANHA'}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={testInstagramOnly} 
                disabled={isRunning}
                variant="outline"
              >
                📸 Testar Instagram
              </Button>
              <Button 
                onClick={generateBatch} 
                disabled={isRunning}
                variant="outline"
              >
                📝 Gerar Lote
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Funcionalidades</CardTitle>
            <CardDescription>
              Recursos disponíveis na automação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.campaignSystem.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Campaign Result */}
      {lastResult && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎯 Última Campanha</CardTitle>
            <CardDescription>
              {lastResult.summary.tema} • {new Date(lastResult.summary.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant={lastResult.summary.platforms.instagram.success ? "default" : "destructive"}>
                  📸 Instagram
                </Badge>
                {lastResult.summary.platforms.instagram.success ? '✅' : '❌'}
                {lastResult.summary.platforms.instagram.postId && (
                  <span className="text-xs text-gray-500">
                    ID: {lastResult.summary.platforms.instagram.postId.substring(0, 8)}...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={lastResult.summary.platforms.email.success ? "default" : "destructive"}>
                  📧 Email
                </Badge>
                {lastResult.summary.platforms.email.success ? '✅' : '❌'}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={lastResult.summary.platforms.whatsapp.success ? "default" : "destructive"}>
                  📱 WhatsApp
                </Badge>
                {lastResult.summary.platforms.whatsapp.success ? '✅' : '❌'}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-medium">SEO:</span> {lastResult.summary.content.seo.title}
              </div>
              <div>
                <span className="font-medium">Hashtags:</span> {lastResult.summary.content.instagram.hashtags.slice(0, 5).join(', ')}...
              </div>
              <div>
                <span className="font-medium">Keywords:</span> {lastResult.summary.content.seo.keywords.join(', ')}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Taxa de Sucesso</span>
                <span className="text-sm text-gray-600">{lastResult.metrics.successRate.toFixed(1)}%</span>
              </div>
              <Progress value={lastResult.metrics.successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Logs da Execução</CardTitle>
            <CardDescription>
              Acompanhe o progresso em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </AdminLayoutWrapper>
  )
}