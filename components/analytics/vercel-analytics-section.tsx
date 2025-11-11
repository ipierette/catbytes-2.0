'use client'

import { Card } from '@/components/ui/card'
import { Activity, Users, Eye, Clock } from 'lucide-react'

interface VercelAnalyticsSectionProps {
  period: '7d' | '30d' | '90d'
}

export function VercelAnalyticsSection({ period }: VercelAnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-purple-600" />
            Vercel Web Analytics
          </h3>
          <p className="text-muted-foreground mt-1">
            Dados de performance e visitantes coletados pelo Vercel
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-2">Vercel Analytics Dashboard</h4>
              <p className="text-sm text-muted-foreground mb-4">
                O Vercel Analytics está ativo e coletando dados de visitantes, page views e performance.
                Para visualizar os dados completos, acesse o dashboard do Vercel:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://vercel.com/izadoracurys-projects/catbytes-2-0/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Activity className="h-4 w-4" />
                  Ver Analytics no Vercel
                </a>
                
                <a
                  href="https://vercel.com/docs/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors font-medium"
                >
                  📚 Documentação
                </a>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm">Visitantes Únicos</h5>
                <p className="text-xs text-muted-foreground">
                  Rastreamento preciso de visitantes únicos sem cookies
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm">Page Views</h5>
                <p className="text-xs text-muted-foreground">
                  Contagem de visualizações por página e rota
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm">Performance Metrics</h5>
                <p className="text-xs text-muted-foreground">
                  Core Web Vitals e métricas de performance
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-sm">Real-Time Data</h5>
                <p className="text-xs text-muted-foreground">
                  Dados atualizados em tempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Info sobre integração futura */}
      <Card className="p-6 border-dashed">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          🚀 Próximos Passos
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          Para integrar os dados do Vercel Analytics diretamente nesta página, você pode:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>Usar a Vercel Analytics API para buscar dados programaticamente</li>
          <li>Configurar webhooks para sincronizar dados com o Supabase</li>
          <li>Criar dashboards customizados combinando Vercel + Google Analytics</li>
          <li>Exportar dados do Vercel para análise avançada</li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>💡 Dica:</strong> O Vercel Analytics complementa o Google Analytics 
            fornecendo dados de performance e Core Web Vitals que são essenciais para SEO.
          </p>
        </div>
      </Card>
    </div>
  )
}
