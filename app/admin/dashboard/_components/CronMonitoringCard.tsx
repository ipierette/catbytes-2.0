'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface CronLog {
  id: number
  cron_type: 'blog' | 'instagram' | 'token-check'
  status: 'success' | 'failed' | 'running'
  executed_at: string
  duration_ms: number | null
  details: {
    action?: string
    error?: string
    blog_post_id?: number
    instagram_posts?: number
  } | null
}

interface CronStats {
  total: number
  success: number
  failed: number
  lastExecution: CronLog | null
}

const CRON_LABELS: Record<string, { label: string; description: string }> = {
  'blog': {
    label: 'Geração de Blog',
    description: 'Gera novo artigo automaticamente'
  },
  'instagram': {
    label: 'Geração Instagram',
    description: 'Gera lote de 10 posts para Instagram'
  },
  'token-check': {
    label: 'Verificação de Token',
    description: 'Valida token do Instagram (executa diariamente)'
  }
}

export function CronMonitoringCard() {
  const [logs, setLogs] = useState<CronLog[]>([])
  const [stats, setStats] = useState<CronStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/cron/history?limit=10')
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'running':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `${diffMins}min atrás`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d atrás`
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Monitoramento de Cron Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Monitoramento de Cron Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Estatísticas Gerais */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.success}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Falhas</div>
            </div>
          </div>
        )}

        {/* Lista de Execuções */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Últimas Execuções
          </h3>
          
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma execução registrada</p>
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                {/* Status Icon */}
                <div className="mt-0.5">
                  {getStatusIcon(log.status)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {CRON_LABELS[log.cron_type]?.label || log.cron_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(log.status)}`}>
                      {log.status === 'success' ? 'Sucesso' : log.status === 'failed' ? 'Falhou' : 'Executando'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {CRON_LABELS[log.cron_type]?.description}
                  </p>

                  {/* Detalhes */}
                  {log.details && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                      {log.details.blog_post_id && (
                        <div>📝 Post ID: {log.details.blog_post_id}</div>
                      )}
                      {log.details.instagram_posts && (
                        <div>📸 {log.details.instagram_posts} posts gerados</div>
                      )}
                      {log.details.error && (
                        <div className="text-red-600">❌ {log.details.error}</div>
                      )}
                    </div>
                  )}

                  {/* Tempo */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <span>{formatDate(log.executed_at)}</span>
                    {log.duration_ms !== null && (
                      <span>⏱️ {formatDuration(log.duration_ms)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Próximas Execuções */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Próximas Execuções Programadas
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Geração de Conteúdo</span>
              <span className="font-medium dark:text-gray-200">Ter/Qui/Sáb/Dom às 9:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Verificação de Token</span>
              <span className="font-medium dark:text-gray-200">Diariamente às 09:00</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
