'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Activity, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface APICosts {
  openai: number
  dalle: number
  total: number
  breakdown: {
    openai: number
    dalle: number
  }
}

interface CostData {
  period: string
  dateRange: { start: string; end: string }
  costs: APICosts
  events: {
    total: number
    blogs: number
    socialPosts: number
  }
  projections: {
    monthly: number
    yearly: number
  }
  metadata: {
    costPerBlog: number
    costPerPost: number
  }
}

export function APICostAnalyticsCard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [data, setData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCosts = async (selectedPeriod: 'today' | 'week' | 'month') => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/analytics/api-costs?period=${selectedPeriod}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch API costs')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching API costs:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCosts(period)
  }, [period])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Analytics de Custos de API
          </CardTitle>
          <CardDescription>Carregando dados de custos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Analytics de Custos de API
          </CardTitle>
          <CardDescription className="text-destructive">
            {error || 'Erro ao carregar dados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ⚠️ Execute o SQL em SQL_SETUP.md para criar a tabela daily_events
          </p>
        </CardContent>
      </Card>
    )
  }

  const { costs, events, projections, metadata } = data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Analytics de Custos de API
            </CardTitle>
            <CardDescription>
              Custos de OpenAI e DALL-E baseados em uso real
            </CardDescription>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            <Badge
              variant={period === 'today' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPeriod('today')}
            >
              Hoje
            </Badge>
            <Badge
              variant={period === 'week' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPeriod('week')}
            >
              7 dias
            </Badge>
            <Badge
              variant={period === 'month' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPeriod('month')}
            >
              30 dias
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Cost Display */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Custo Total {period === 'today' ? 'Hoje' : period === 'week' ? '(7 dias)' : '(30 dias)'}
              </p>
              <h3 className="text-4xl font-bold text-green-700 dark:text-green-400">
                ${costs.total.toFixed(3)}
              </h3>
            </div>
            <Activity className="h-12 w-12 text-green-600 dark:text-green-400 opacity-20" />
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* OpenAI */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-muted-foreground">OpenAI (GPT-4o-mini)</p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              ${costs.openai.toFixed(3)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {events.blogs} blogs + {events.socialPosts} posts
            </p>
          </div>

          {/* DALL-E */}
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-muted-foreground">DALL-E 3 (imagens)</p>
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              ${costs.dalle.toFixed(3)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {events.blogs} imagens geradas
            </p>
          </div>
        </div>

        {/* Projections */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Projeções de Custo
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Mensal (estimado)</p>
              <p className="text-xl font-bold text-foreground">
                ${projections.monthly.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{Math.round(projections.monthly / (metadata.costPerBlog || 1))} blogs/mês
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Anual (estimado)</p>
              <p className="text-xl font-bold text-foreground">
                ${projections.yearly.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{Math.round(projections.yearly / (metadata.costPerBlog || 1))} blogs/ano
              </p>
            </div>
          </div>
        </div>

        {/* Cost Metrics */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-3">Métricas de Eficiência</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Custo por Blog</span>
              <span className="font-semibold">${metadata.costPerBlog.toFixed(3)}</span>
            </div>
            {metadata.costPerPost > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo por Post Social</span>
                <span className="font-semibold">${metadata.costPerPost.toFixed(3)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de Eventos</span>
              <span className="font-semibold">{events.total}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
          <p className="font-semibold mb-1">💡 Como calculamos:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>GPT-4o-mini: ~$0.005 por blog (10k tokens in + 5k out)</li>
            <li>DALL-E 3: $0.08 por imagem gerada</li>
            <li>Posts sociais: $0.001 (Gemini gratuito + fallback)</li>
            <li>Dados baseados em eventos reais registrados</li>
          </ul>
        </div>

        {/* Budget Status */}
        {projections.monthly > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Status de Budget</span>
              <Badge variant={projections.monthly < 5 ? 'default' : projections.monthly < 10 ? 'secondary' : 'destructive'}>
                {projections.monthly < 5 ? '✅ Econômico' : projections.monthly < 10 ? '⚠️ Moderado' : '🔴 Alto'}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((projections.monthly / 20) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ${projections.monthly.toFixed(2)} / $20.00 budget mensal sugerido
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
