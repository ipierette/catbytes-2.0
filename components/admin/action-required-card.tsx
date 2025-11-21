'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Instagram, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'

interface ActionItem {
  type: 'instagram_pending' | 'token_expiring' | 'blog_stalled' | 'high_error_rate'
  severity: 'warning' | 'error' | 'info'
  title: string
  description: string
  count?: number
  action?: {
    label: string
    href: string
  }
}

export function ActionRequiredCard() {
  const [loading, setLoading] = useState(true)
  const [actions, setActions] = useState<ActionItem[]>([])

  useEffect(() => {
    checkActions()
    // Atualizar a cada 5 minutos
    const interval = setInterval(checkActions, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const checkActions = async () => {
    try {
      const newActions: ActionItem[] = []

      // 1. Verificar posts Instagram pendentes
      const { data: pendingPosts, error: postsError } = await supabase
        .from('instagram_posts')
        .select('id')
        .eq('status', 'pending')

      if (!postsError && pendingPosts && pendingPosts.length > 0) {
        newActions.push({
          type: 'instagram_pending',
          severity: 'warning',
          title: `${pendingPosts.length} post${pendingPosts.length > 1 ? 's' : ''} Instagram pendente${pendingPosts.length > 1 ? 's' : ''}`,
          description: `Você tem ${pendingPosts.length} post${pendingPosts.length > 1 ? 's' : ''} aguardando revisão e aprovação`,
          count: pendingPosts.length,
          action: {
            label: 'Revisar Posts',
            href: '#instagram-pending'
          }
        })
      }

      // 2. Verificar token Instagram expirando
      const tokenExpiresAt = process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN_EXPIRES_AT
      if (tokenExpiresAt) {
        const expiryDate = new Date(tokenExpiresAt)
        const now = new Date()
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry < 14) {
          newActions.push({
            type: 'token_expiring',
            severity: daysUntilExpiry < 7 ? 'error' : 'warning',
            title: `Token Instagram expira em ${daysUntilExpiry} dias`,
            description: daysUntilExpiry < 7 
              ? '⚠️ URGENTE: Renove o token o mais rápido possível!'
              : 'Você deve renovar o token em breve para manter automações funcionando',
            action: {
              label: 'Renovar Token',
              href: '#settings'
            }
          })
        }
      }

      // 3. Verificar se nenhum blog foi gerado nos últimos 3 dias (considerando cronograma Ter/Qui/Sáb/Dom)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const { data: recentBlogs, error: blogsError } = await supabase
        .from('blog_posts')
        .select('id')
        .gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (!blogsError && (!recentBlogs || recentBlogs.length === 0)) {
        newActions.push({
          type: 'blog_stalled',
          severity: 'warning',
          title: 'Nenhum blog gerado nos últimos 3 dias',
          description: 'Pode haver um problema com a automação de geração de artigos',
          action: {
            label: 'Ver Logs',
            href: '#cron-logs'
          }
        })
      }

      // 4. Verificar taxa de erros alta (últimas 24h)
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data: errorEvents, error: eventsError } = await supabase
        .from('daily_events')
        .select('event_type')
        .gte('event_time', twentyFourHoursAgo.toISOString())
        .or('event_type.eq.blog_failed,event_type.eq.instagram_failed,event_type.eq.linkedin_failed,event_type.eq.cron_failed')

      if (!eventsError && errorEvents && errorEvents.length > 5) {
        newActions.push({
          type: 'high_error_rate',
          severity: 'error',
          title: `${errorEvents.length} erros nas últimas 24h`,
          description: 'Taxa de erros acima do normal. Verifique os logs para identificar o problema',
          count: errorEvents.length,
          action: {
            label: 'Ver Erros',
            href: '#logs'
          }
        })
      }

      setActions(newActions)
    } catch (error) {
      console.error('Erro ao verificar ações necessárias:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity: ActionItem['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: ActionItem['severity']) => {
    switch (severity) {
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
      case 'warning':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10'
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Clock className="h-5 w-5 animate-spin" />
            Verificando Ações Necessárias...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (actions.length === 0) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Tudo em Ordem!
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ✅ Nenhuma ação necessária no momento. Todas as automações estão funcionando perfeitamente!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <AlertCircle className="h-5 w-5" />
          Requer Sua Atenção ({actions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Alert 
              key={index}
              className={`border-l-4 ${getSeverityColor(action.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getSeverityIcon(action.severity)}
                </div>
                <div className="flex-1 space-y-2">
                  <AlertDescription>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {action.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {action.description}
                    </div>
                  </AlertDescription>
                  {action.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        // Scroll para seção ou navegar
                        const element = document.querySelector(action.action!.href)
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                    >
                      {action.action.label} →
                    </Button>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Última verificação: {new Date().toLocaleTimeString('pt-BR')} • Atualiza a cada 5 minutos
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
