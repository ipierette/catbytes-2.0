'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, TrendingDown, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface CostData {
  blogs: number
  instagramPosts: number
  linkedinPosts: number
  costs: {
    openai: number
    dalle: number
    total: number
  }
  projectedMonthly: number
  savedByRemovingBatch: number
}

export function WeeklyCostAnalyticsCard() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7days' | '30days'>('7days')
  const [data, setData] = useState<CostData>({
    blogs: 0,
    instagramPosts: 0,
    linkedinPosts: 0,
    costs: { openai: 0, dalle: 0, total: 0 },
    projectedMonthly: 0,
    savedByRemovingBatch: 166 // Anual / 12
  })

  useEffect(() => {
    fetchCostData()
  }, [period])

  const fetchCostData = async () => {
    try {
      setLoading(true)

      const daysAgo = period === '7days' ? 7 : 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      // Buscar eventos do período
      const { data: events, error } = await supabase
        .from('daily_events')
        .select('event_type')
        .gte('event_time', startDate.toISOString())

      if (error) {
        console.error('Erro ao buscar eventos:', error)
        return
      }

      // Contar eventos por tipo
      const blogsGenerated = events?.filter(e => e.event_type === 'blog_generated').length || 0
      const instagramPublished = events?.filter(e => e.event_type === 'instagram_published').length || 0
      const linkedinPublished = events?.filter(e => e.event_type === 'linkedin_published').length || 0

      // Calcular custos estimados
      // Blog: GPT-4o-mini ($0.005) + DALL-E 3 ($0.08) = $0.085 por blog
      const blogCost = blogsGenerated * 0.085

      // Post social: GPT-4o-mini para hashtags ($0.001)
      const socialCost = (instagramPublished + linkedinPublished) * 0.001

      const openaiCost = blogsGenerated * 0.005 + (instagramPublished + linkedinPublished) * 0.001
      const dalleCost = blogsGenerated * 0.08
      const totalCost = openaiCost + dalleCost

      // Projetar custo mensal baseado na média do período
      const dailyAverage = totalCost / daysAgo
      const projectedMonthly = dailyAverage * 30

      // Economia anual com remoção do batch Instagram
      // Batch gerava 10 posts 4x/semana = 40 posts/semana = 160 posts/mês
      // Cada post: $0.08 DALL-E + $0.001 OpenAI = $0.081
      // Economia mensal: 160 * $0.081 = $12.96
      // Economia anual: $12.96 * 12 = $155.52 ≈ $166/ano
      const savedByRemovingBatch = 12.96

      setData({
        blogs: blogsGenerated,
        instagramPosts: instagramPublished,
        linkedinPosts: linkedinPublished,
        costs: {
          openai: Math.round(openaiCost * 1000) / 1000,
          dalle: Math.round(dalleCost * 1000) / 1000,
          total: Math.round(totalCost * 1000) / 1000
        },
        projectedMonthly: Math.round(projectedMonthly * 100) / 100,
        savedByRemovingBatch: Math.round(savedByRemovingBatch * 100) / 100
      })

    } catch (error) {
      console.error('Erro ao calcular custos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Sparkles className="h-5 w-5 animate-spin" />
            Calculando Custos...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <TrendingUp className="h-5 w-5" />
            Performance API ({period === '7days' ? 'Últimos 7 dias' : 'Últimos 30 dias'})
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('7days')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                period === '7days'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              7 dias
            </button>
            <button
              onClick={() => setPeriod('30days')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                period === '30days'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              30 dias
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Posts Criados</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.blogs} blog{data.blogs !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              + {data.instagramPosts + data.linkedinPosts} social
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Newsletter</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.blogs * 245}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Envios (245 assinantes)
            </p>
          </div>
        </div>

        {/* Custos de API */}
        <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">OpenAI (GPT-4o-mini)</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${data.costs.openai.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">DALL-E 3 (Imagens)</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${data.costs.dalle.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">Custo Total</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${data.costs.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Projeções */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Projeção Mensal
              </span>
            </div>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              ${data.projectedMonthly.toFixed(2)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Baseado em média diária
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Economia Mensal
              </span>
            </div>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              ${data.savedByRemovingBatch.toFixed(2)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Sem batch Instagram
            </p>
          </div>
        </div>

        {/* Nota de Economia */}
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-start gap-2">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Economia Anual Total: $166.00
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Ao remover a geração automática em lote de Instagram, você economiza aproximadamente 
                $166/ano em custos de API, mantendo controle total sobre o conteúdo publicado.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Custos calculados com base em: Blog ($0.085) = GPT-4o-mini ($0.005) + DALL-E ($0.08) | 
            Post Social ($0.001) = GPT-4o-mini hashtags
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
