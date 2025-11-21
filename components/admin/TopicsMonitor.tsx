/**
 * Dashboard de Monitoramento de Tópicos
 * Mostra status, estatísticas e saúde do pool de tópicos
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface TopicStats {
  total: number
  used: number
  neverUsed: number
  blocked: number
  reusable: number
  available: number
  needsGeneration: boolean
  weeksUntilLow: number
  oldestReusable: { topic: string; usedAt: string } | null
  lastUsed: { topic: string; usedAt: string } | null
  usagePercentage: number
  blockedPercentage: number
  health: 'excellent' | 'good' | 'warning' | 'critical'
}

interface OverallStats {
  totalTopicsInPool: number
  totalUsed: number
  totalAvailable: number
  targetForTwoYears: number
  categoriesNeedingGeneration: number
  overallHealth: string
}

export default function TopicsMonitor() {
  const [stats, setStats] = useState<Record<string, TopicStats> | null>(null)
  const [overall, setOverall] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [addingManual, setAddingManual] = useState<string | null>(null)
  const [manualTopic, setManualTopic] = useState('')
  const [generationHistory, setGenerationHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/topics/stats')
      const data = await res.json()
      
      if (data.success) {
        setStats(data.stats)
        setOverall(data.overall)
      }
    } catch (error) {
      console.error('Erro ao buscar stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/topics/history')
      const data = await res.json()
      if (data.success) {
        setGenerationHistory(data.history || [])
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchHistory()
    // Atualizar a cada 60 segundos
    const interval = setInterval(() => {
      fetchStats()
      fetchHistory()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerate = async (category: string) => {
    setGenerating(category)
    try {
      const res = await fetch(`/api/topics/generate?category=${encodeURIComponent(category)}&count=30`)
      const data = await res.json()
      
      if (data.success) {
        alert(`✅ ${data.total} tópicos gerados!\n\nAdicione-os manualmente em types/blog.ts:\n\n${data.generated.slice(0, 5).map((t: string) => `'${t}',`).join('\n')}\n... e mais ${data.total - 5}`)
        fetchStats() // Atualizar stats
        fetchHistory() // Atualizar histórico
      } else {
        alert(`❌ Erro: ${data.error}`)
      }
    } catch (error) {
      alert('❌ Erro ao gerar tópicos')
    } finally {
      setGenerating(null)
    }
  }

  const handleAddManual = async (category: string) => {
    if (!manualTopic.trim()) {
      alert('Digite um tópico válido')
      return
    }

    try {
      const res = await fetch('/api/topics/add-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          topic: manualTopic.trim()
        })
      })

      const data = await res.json()
      
      if (data.success) {
        alert(`✅ Tópico adicionado!\n\nAdicione também em types/blog.ts:\n'${manualTopic.trim()}',`)
        setManualTopic('')
        setAddingManual(null)
        fetchStats()
      } else {
        alert(`❌ Erro: ${data.error}`)
      }
    } catch (error) {
      alert('❌ Erro ao adicionar tópico')
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
        </div>
      </Card>
    )
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getHealthEmoji = (health: string) => {
    switch (health) {
      case 'excellent': return '🟢'
      case 'good': return '🔵'
      case 'warning': return '🟡'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de histórico */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Pool de Tópicos</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerenciamento automático e manual de tópicos</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 rounded-lg text-sm font-medium"
        >
          {showHistory ? '📊 Ver Stats' : '📜 Ver Histórico'}
        </button>
      </div>

      {/* Histórico de Gerações */}
      {showHistory && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">📜 Histórico de Gerações Automáticas</h4>
          {generationHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma geração registrada ainda</p>
          ) : (
            <div className="space-y-3">
              {generationHistory.map((gen: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <div className="font-medium dark:text-gray-100">{gen.category}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {gen.count} tópicos gerados
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(gen.generated_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">via {gen.method}</div>
                    {gen.added_to_code ? (
                      <span className="text-xs text-green-600">✓ Adicionado</span>
                    ) : (
                      <span className="text-xs text-yellow-600">⏳ Pendente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {!showHistory && (
        <>
          {/* Overview Cards */}
      {overall && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total no Pool</div>
            <div className="text-3xl font-bold dark:text-gray-100">{overall.totalTopicsInPool}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Meta 2 anos: {overall.targetForTwoYears}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Disponíveis</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{overall.totalAvailable}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Nunca usados + Reutilizáveis
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Já Usados</div>
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-300">{overall.totalUsed}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Math.round((overall.totalUsed / overall.totalTopicsInPool) * 100)}% do pool
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Precisam Geração</div>
            <div className={`text-3xl font-bold ${overall.categoriesNeedingGeneration > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
              {overall.categoriesNeedingGeneration}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {overall.categoriesNeedingGeneration === 0 ? '✓ Todas OK' : '⚠️ Necessário'}
            </div>
          </Card>
        </div>
      )}

      {/* Per Category Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(stats).map(([category, data]) => (
            <Card key={category} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {getHealthEmoji(data.health)}
                    {category}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getHealthColor(data.health)}`}>
                    {data.health.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {data.needsGeneration && (
                    <button
                      onClick={() => handleGenerate(category)}
                      disabled={generating !== null}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {generating === category ? 'Gerando...' : 'Gerar 30'}
                    </button>
                  )}
                  <button
                    onClick={() => setAddingManual(addingManual === category ? null : category)}
                    disabled={generating !== null || addingManual !== null && addingManual !== category}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    {addingManual === category ? 'Cancelar' : '+ Manual'}
                  </button>
                </div>
              </div>
              
              {/* Manual Topic Input */}
              {addingManual === category && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                  <div className="text-sm font-medium text-gray-700 mb-2">Adicionar tópico manualmente:</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualTopic}
                      onChange={(e) => setManualTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddManual(category)}
                      placeholder="Digite o novo tópico..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddManual(category)}
                      disabled={!manualTopic.trim()}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Disponíveis: {data.available}</span>
                  <span>Total: {data.total}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      data.available >= 50 ? 'bg-green-500' :
                      data.available >= 20 ? 'bg-blue-500' :
                      data.available >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(data.available / data.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <div className="text-gray-600">Nunca Usados</div>
                  <div className="text-xl font-bold text-green-600">{data.neverUsed}</div>
                </div>
                <div>
                  <div className="text-gray-600">Bloqueados</div>
                  <div className="text-xl font-bold text-yellow-600">{data.blocked}</div>
                </div>
                <div>
                  <div className="text-gray-600">Reutilizáveis</div>
                  <div className="text-xl font-bold text-blue-600">{data.reusable}</div>
                </div>
              </div>

              {/* Warnings & Info */}
              {data.needsGeneration ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm mb-3">
                  <strong className="text-yellow-800">⚠️ Atenção:</strong>
                  <span className="text-yellow-700 ml-1">
                    Apenas {data.available} tópicos disponíveis. Gere novos!
                  </span>
                </div>
              ) : data.weeksUntilLow > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm mb-3">
                  <strong className="text-blue-800">ℹ️ Previsão:</strong>
                  <span className="text-blue-700 ml-1">
                    ~{data.weeksUntilLow} semanas até precisar gerar novos
                  </span>
                </div>
              )}

              {/* Last Used */}
              {data.lastUsed && (
                <div className="text-xs text-gray-600 border-t pt-3">
                  <div><strong>Último usado:</strong></div>
                  <div className="italic">{data.lastUsed.topic}</div>
                  <div className="text-gray-500">
                    {new Date(data.lastUsed.usedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  )
}
