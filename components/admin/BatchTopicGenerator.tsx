/**
 * Batch Topic Generator - Dashboard Widget
 * Widget simplificado com link para página completa de gerenciamento
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, ExternalLink, BarChart3, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TopicStats {
  total: number
  available: number
  used: number
  categories: {
    category: string
    available_topics: number
  }[]
}

export default function BatchTopicGenerator() {
  const [stats, setStats] = useState<TopicStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/blog/topics/stats')
      if (response.ok) {
        const data = await response.json()
        
        // API retorna { success: true, stats: { general: [...] } }
        const general = data.stats?.general || []
        
        if (general.length === 0) {
          setStats({ total: 0, available: 0, used: 0, categories: [] })
          return
        }
        
        // Calcular totais
        const total = general.reduce((sum: number, cat: any) => sum + cat.total_topics, 0)
        const available = general.reduce((sum: number, cat: any) => sum + cat.available_topics, 0)
        const used = general.reduce((sum: number, cat: any) => sum + cat.used_topics, 0)
        
        setStats({
          total,
          available,
          used,
          categories: general.map((cat: any) => ({
            category: cat.category,
            available_topics: cat.available_topics
          }))
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats({ total: 0, available: 0, used: 0, categories: [] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold">Sistema de Tópicos para Blog</h3>
            <p className="text-sm text-muted-foreground">Gerencie tópicos com IA e anti-duplicação</p>
          </div>
        </div>
        
        <Link href="/admin/blog/topics">
          <Button variant="outline" size="sm" className="gap-2">
            Abrir Painel Completo
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Total de Tópicos</div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.total}</div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <div className="text-sm text-green-700 dark:text-green-300 mb-1">Disponíveis</div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.available}</div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Já Usados</div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.used}</div>
            </Card>
          </div>

          {/* Categories Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Tópicos Disponíveis por Categoria</h4>
            <div className="space-y-2">
              {stats.categories.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">{cat.category}</span>
                  <span className="text-sm font-bold text-primary">{cat.available_topics} disponíveis</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <Link href="/admin/blog/topics?tab=create-unique" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Criar Tópico Único
              </Button>
            </Link>

            <Link href="/admin/blog/topics?tab=create-batch" className="w-full">
              <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Sparkles className="w-4 h-4" />
                Criar em Lote
              </Button>
            </Link>
          </div>

          {/* Features Info */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">✨ Sistema Inteligente</h5>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>Anti-duplicação:</strong> Embeddings OpenAI detectam similaridade</li>
              <li>• <strong>Controle de uso:</strong> Tópicos marcados como usados automaticamente</li>
              <li>• <strong>Criação em lote:</strong> Gere 30+ tópicos validados de uma vez</li>
              <li>• <strong>Aprovação manual:</strong> Revise antes de usar na geração</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Erro ao carregar estatísticas
        </div>
      )}
    </Card>
  )
}
