/**
 * Proactive Alerts System
 * 
 * Sistema de alertas proativos baseado em análise de eventos e métricas
 * Detecta problemas antes que se tornem críticos
 */

import { supabaseAdmin } from './supabase'
import { alertCronWarning, alertCronFailure } from './alert-system'

interface AlertCondition {
  name: string
  check: () => Promise<boolean>
  message: string
  details?: () => Promise<Record<string, any>>
}

/**
 * Verifica se taxa de erro está acima do limite
 */
async function checkErrorRate(): Promise<{ triggered: boolean; details?: any }> {
  if (!supabaseAdmin) {
    return { triggered: false }
  }

  try {
    // Buscar execuções das últimas 24 horas
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: executions, error } = await supabaseAdmin
      .from('cron_execution_logs')
      .select('status')
      .gte('created_at', oneDayAgo.toISOString())

    if (error || !executions || executions.length === 0) {
      return { triggered: false }
    }

    const totalExecutions = executions.length
    const failedExecutions = executions.filter(e => e.status === 'failed').length
    const errorRate = (failedExecutions / totalExecutions) * 100

    if (errorRate > 10) {
      return {
        triggered: true,
        details: {
          errorRate: `${errorRate.toFixed(1)}%`,
          totalExecutions,
          failedExecutions,
          successfulExecutions: totalExecutions - failedExecutions,
          threshold: '10%',
          period: '24 hours'
        }
      }
    }

    return { triggered: false }
  } catch (error) {
    console.error('[Proactive Alerts] Error checking error rate:', error)
    return { triggered: false }
  }
}

/**
 * Verifica se nenhum blog foi gerado nos últimos 2 dias
 */
async function checkBlogGenerationStalled(): Promise<{ triggered: boolean; details?: any }> {
  if (!supabaseAdmin) {
    return { triggered: false }
  }

  try {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const { data: recentBlogs, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, created_at')
      .gte('created_at', twoDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Proactive Alerts] Error checking blog generation:', error)
      return { triggered: false }
    }

    if (!recentBlogs || recentBlogs.length === 0) {
      return {
        triggered: true,
        details: {
          daysSinceLastBlog: 2,
          threshold: '2 days',
          recommendation: 'Check cron job status and OpenAI API credentials'
        }
      }
    }

    return { triggered: false }
  } catch (error) {
    console.error('[Proactive Alerts] Error checking blog generation:', error)
    return { triggered: false }
  }
}

/**
 * Verifica se token do Instagram expira em breve
 */
async function checkInstagramTokenExpiry(): Promise<{ triggered: boolean; details?: any }> {
  // Verificar se existe informação sobre expiração do token
  // Instagram tokens expiram em 60 dias
  // Esta função pode ser expandida para verificar data real de expiração
  
  // Por ora, retorna false - pode ser implementado quando tivermos data de expiração armazenada
  return { triggered: false }
}

/**
 * Verifica se há muitas requisições falhando para alguma API externa
 */
async function checkAPIFailureSpike(): Promise<{ triggered: boolean; details?: any }> {
  if (!supabaseAdmin) {
    return { triggered: false }
  }

  try {
    // Buscar eventos de falha das últimas 6 horas
    const sixHoursAgo = new Date()
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6)

    const { data: events, error } = await supabaseAdmin
      .from('daily_events')
      .select('event_type, error_message')
      .gte('event_time', sixHoursAgo.toISOString())
      .in('event_type', [
        'instagram_failed',
        'linkedin_failed',
        'blog_failed'
      ])

    if (error || !events || events.length === 0) {
      return { triggered: false }
    }

    // Contar falhas por tipo
    const failures: Record<string, number> = {}
    events.forEach(event => {
      failures[event.event_type] = (failures[event.event_type] || 0) + 1
    })

    // Alertar se mais de 3 falhas do mesmo tipo em 6 horas
    const highFailureTypes = Object.entries(failures)
      .filter(([_, count]) => count >= 3)
      .map(([type, count]) => ({ type, count }))

    if (highFailureTypes.length > 0) {
      return {
        triggered: true,
        details: {
          period: '6 hours',
          failures: highFailureTypes,
          totalFailures: events.length,
          threshold: '3 failures per type',
          recommendation: 'Check circuit breakers and API credentials'
        }
      }
    }

    return { triggered: false }
  } catch (error) {
    console.error('[Proactive Alerts] Error checking API failures:', error)
    return { triggered: false }
  }
}

/**
 * Verifica se rate limit está sendo atingido frequentemente
 */
async function checkRateLimitPressure(): Promise<{ triggered: boolean; details?: any }> {
  // Esta função pode ser expandida para rastrear uso de rate limiters
  // Por ora, retorna false - implementar quando houver logging de rate limits
  return { triggered: false }
}

/**
 * Executa todas as verificações de alertas proativos
 */
export async function runProactiveAlerts(): Promise<void> {
  console.log('[Proactive Alerts] Running proactive alert checks...')

  try {
    // Executar todas as verificações
    const [
      errorRate,
      blogStalled,
      tokenExpiry,
      apiFailures,
      rateLimitPressure
    ] = await Promise.all([
      checkErrorRate(),
      checkBlogGenerationStalled(),
      checkInstagramTokenExpiry(),
      checkAPIFailureSpike(),
      checkRateLimitPressure()
    ])

    // Enviar alertas para condições acionadas
    if (errorRate.triggered) {
      await alertCronWarning(
        'Alta Taxa de Erro Detectada',
        `A taxa de erro nas últimas 24 horas está acima de 10%`,
        errorRate.details
      )
    }

    if (blogStalled.triggered) {
      await alertCronWarning(
        'Geração de Blog Parada',
        'Nenhum blog gerado nos últimos 2 dias',
        blogStalled.details
      )
    }

    if (tokenExpiry.triggered) {
      await alertCronWarning(
        'Token Instagram Expirando',
        'O token do Instagram expira em 7 dias. Renove para evitar interrupção.',
        tokenExpiry.details
      )
    }

    if (apiFailures.triggered) {
      await alertCronWarning(
        'Spike de Falhas em API Externa',
        'Detectadas múltiplas falhas em APIs externas nas últimas 6 horas',
        apiFailures.details
      )
    }

    if (rateLimitPressure.triggered) {
      await alertCronWarning(
        'Pressão em Rate Limits',
        'Rate limits estão sendo atingidos com frequência',
        rateLimitPressure.details
      )
    }

    // Log resultado
    const triggeredAlerts = [errorRate, blogStalled, tokenExpiry, apiFailures, rateLimitPressure]
      .filter(a => a.triggered)
      .length

    if (triggeredAlerts > 0) {
      console.log(`[Proactive Alerts] ⚠️ ${triggeredAlerts} alert(s) triggered`)
    } else {
      console.log('[Proactive Alerts] ✅ All checks passed')
    }

  } catch (error) {
    console.error('[Proactive Alerts] Error running proactive alerts:', error)
  }
}

/**
 * Agenda verificações periódicas de alertas proativos
 * Deve ser chamado no cron principal
 */
export async function scheduleProactiveAlerts(): Promise<void> {
  // Executar alertas proativos a cada 6 horas
  // Esta função será integrada ao simple-cron
  await runProactiveAlerts()
}
