/**
 * Dashboard de Monitoramento de Cron Jobs
 * Mostra execuções passadas e próximas programações
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface CronExecution {
  id: string
  job_name: string
  status: 'success' | 'failure' | 'partial' | 'running'
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  error_message: string | null
  result: any
}

interface CronStats {
  job_name: string
  total_executions: number
  successful: number
  failed: number
  partial: number
  success_rate_percentage: number
  avg_duration_ms: number
  last_execution: string
}

interface NextExecution {
  jobName: string
  schedule: string
  nextExecution: string
  description: string
}

export default function CronMonitor() {
  const [executions, setExecutions] = useState<CronExecution[]>([])
  const [stats, setStats] = useState<CronStats[]>([])
  const [nextExecutions, setNextExecutions] = useState<NextExecution[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [execRes, statsRes, nextRes] = await Promise.all([
        fetch('/api/cron/executions?limit=20'),
        fetch('/api/cron/stats'),
        fetch('/api/cron/next')
      ])

      if (execRes.ok) {
        const data = await execRes.json()
        setExecutions(data.executions || [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats || [])
      }

      if (nextRes.ok) {
        const data = await nextRes.json()
        setNextExecutions(data.next || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'failure': return 'text-red-600 bg-red-50'
      case 'partial': return 'text-yellow-600 bg-yellow-50'
      case 'running': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'failure': return '❌'
      case 'partial': return '⚠️'
      case 'running': return '⏳'
      default: return '❓'
    }
  }

  const getJobLabel = (jobName: string) => {
    const labels: Record<string, string> = {
      'blog_generation': 'Geração de Blog',
      'newsletter': 'Newsletter',
      'instagram_posts': 'Posts Instagram',
      'linkedin_posts': 'Posts LinkedIn',
      'topic_expansion': 'Expansão de Tópicos',
      'daily_summary': 'Resumo Diário',
      'proactive_alerts': 'Alertas Proativos'
    }
    return labels[jobName] || jobName
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getTimeUntil = (isoString: string) => {
    const now = new Date()
    const target = new Date(isoString)
    const diffMs = target.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Atrasado'
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}min`
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h`
    return `${Math.floor(diffMs / 86400000)}d`
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Carregando monitoramento...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Execuções (30d)</div>
          <div className="text-3xl font-bold">
            {stats.reduce((sum, s) => sum + s.total_executions, 0)}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-gray-600">Taxa de Sucesso</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.length > 0 
              ? Math.round(stats.reduce((sum, s) => sum + s.success_rate_percentage, 0) / stats.length) 
              : 0}%
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-gray-600">Falhas Recentes</div>
          <div className="text-3xl font-bold text-red-600">
            {stats.reduce((sum, s) => sum + s.failed, 0)}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-gray-600">Duração Média</div>
          <div className="text-3xl font-bold">
            {formatDuration(
              stats.length > 0
                ? stats.reduce((sum, s) => sum + (s.avg_duration_ms || 0), 0) / stats.length
                : 0
            )}
          </div>
        </Card>
      </div>

      {/* Next Executions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📅 Próximas Execuções Programadas</h3>
        <div className="space-y-3">
          {nextExecutions.map((next, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{getJobLabel(next.jobName)}</div>
                <div className="text-sm text-gray-600">{next.description}</div>
                <div className="text-xs text-gray-500 mt-1">{next.schedule}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {getTimeUntil(next.nextExecution)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDateTime(next.nextExecution)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Executions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Últimas Execuções</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Job</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Início</th>
                <th className="text-left py-2">Duração</th>
                <th className="text-left py-2">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((exec) => (
                <tr key={exec.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-medium">{getJobLabel(exec.job_name)}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(exec.status)}`}>
                      {getStatusEmoji(exec.status)} {exec.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">
                    {formatDateTime(exec.started_at)}
                  </td>
                  <td className="py-3">
                    {formatDuration(exec.duration_ms)}
                  </td>
                  <td className="py-3">
                    {exec.error_message ? (
                      <div className="text-red-600 text-xs max-w-xs truncate" title={exec.error_message}>
                        {exec.error_message}
                      </div>
                    ) : exec.result?.title ? (
                      <div className="text-green-600 text-xs max-w-xs truncate" title={exec.result.title}>
                        ✓ {exec.result.title}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats per Job */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Estatísticas por Job (30 dias)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.job_name} className="p-4 bg-gray-50 rounded">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{getJobLabel(stat.job_name)}</div>
                <div className="text-sm font-bold text-green-600">
                  {stat.success_rate_percentage}%
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div>
                  <div className="text-gray-600">Total</div>
                  <div className="font-bold">{stat.total_executions}</div>
                </div>
                <div>
                  <div className="text-gray-600">Sucesso</div>
                  <div className="font-bold text-green-600">{stat.successful}</div>
                </div>
                <div>
                  <div className="text-gray-600">Falhas</div>
                  <div className="font-bold text-red-600">{stat.failed}</div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Última: {formatDateTime(stat.last_execution)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
