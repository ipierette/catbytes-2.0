/**
 * Cron Execution Logger
 * Registra todas execuções de cron jobs no database
 */

import { supabaseAdmin } from '@/lib/supabase'

export type CronJobName = 
  | 'blog_generation'
  | 'newsletter'
  | 'instagram_posts'
  | 'linkedin_posts'
  | 'topic_expansion'
  | 'daily_summary'
  | 'proactive_alerts'

export type CronStatus = 'success' | 'failure' | 'partial' | 'running'

interface CronExecutionData {
  jobName: CronJobName
  status: CronStatus
  startedAt: Date
  completedAt?: Date
  durationMs?: number
  result?: any
  errorMessage?: string
  metadata?: any
}

/**
 * Inicia registro de execução de cron
 */
export async function startCronExecution(
  jobName: CronJobName,
  metadata?: any
): Promise<string | null> {
  if (!supabaseAdmin) {
    console.error('[Cron Logger] supabaseAdmin não inicializado')
    return null
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('cron_execution_log')
      .insert({
        job_name: jobName,
        status: 'running',
        started_at: new Date().toISOString(),
        metadata: metadata || {}
      })
      .select('id')
      .single()

    if (error) {
      console.error('[Cron Logger] Erro ao iniciar log:', error)
      return null
    }

    console.log(`[Cron Logger] ✓ Execução iniciada: ${jobName} (${data.id})`)
    return data.id

  } catch (error) {
    console.error('[Cron Logger] Erro inesperado:', error)
    return null
  }
}

/**
 * Finaliza registro de execução com sucesso
 */
export async function completeCronExecution(
  executionId: string,
  status: 'success' | 'failure' | 'partial',
  result?: any,
  errorMessage?: string
): Promise<void> {
  if (!supabaseAdmin || !executionId) return

  try {
    // Buscar started_at para calcular duração
    const { data: execution } = await supabaseAdmin
      .from('cron_execution_log')
      .select('started_at')
      .eq('id', executionId)
      .single()

    const completedAt = new Date()
    const durationMs = execution 
      ? completedAt.getTime() - new Date(execution.started_at).getTime()
      : null

    const { error } = await supabaseAdmin
      .from('cron_execution_log')
      .update({
        status,
        completed_at: completedAt.toISOString(),
        duration_ms: durationMs,
        result: result || null,
        error_message: errorMessage || null
      })
      .eq('id', executionId)

    if (error) {
      console.error('[Cron Logger] Erro ao finalizar log:', error)
    } else {
      console.log(`[Cron Logger] ✓ Execução finalizada: ${executionId} (${status}) - ${durationMs}ms`)
    }

  } catch (error) {
    console.error('[Cron Logger] Erro inesperado:', error)
  }
}

/**
 * Busca últimas execuções de um job específico
 */
export async function getLastExecutions(
  jobName?: CronJobName,
  limit: number = 10
): Promise<any[]> {
  if (!supabaseAdmin) return []

  try {
    let query = supabaseAdmin
      .from('cron_execution_log')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit)

    if (jobName) {
      query = query.eq('job_name', jobName)
    }

    const { data, error } = await query

    if (error) {
      console.error('[Cron Logger] Erro ao buscar execuções:', error)
      return []
    }

    return data || []

  } catch (error) {
    console.error('[Cron Logger] Erro inesperado:', error)
    return []
  }
}

/**
 * Busca estatísticas de sucesso dos crons
 */
export async function getCronStats(): Promise<any[]> {
  if (!supabaseAdmin) return []

  try {
    const { data, error } = await supabaseAdmin
      .from('cron_success_rate')
      .select('*')

    if (error) {
      console.error('[Cron Logger] Erro ao buscar stats:', error)
      return []
    }

    return data || []

  } catch (error) {
    console.error('[Cron Logger] Erro inesperado:', error)
    return []
  }
}

/**
 * Busca próximas execuções programadas (baseado no schedule)
 */
export function getNextScheduledExecutions(): {
  jobName: CronJobName
  schedule: string
  nextExecution: Date
  description: string
}[] {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const dayOfWeek = now.getUTCDay() // 0 = Sunday

  const schedules = [
    {
      jobName: 'blog_generation' as CronJobName,
      schedule: 'Ter/Qui/Sáb/Dom às 9:00 BRT (12:00 UTC)',
      description: 'Geração de artigo de blog',
      days: [2, 4, 6, 0], // Tue, Thu, Sat, Sun
      hour: 16
    },
    {
      jobName: 'topic_expansion' as CronJobName,
      schedule: 'Domingo às 00:00 BRT (03:00 UTC)',
      description: 'Verificação e geração de tópicos',
      days: [0], // Sunday
      hour: 3
    },
    {
      jobName: 'daily_summary' as CronJobName,
      schedule: 'Diariamente às 14:00 BRT (17:00 UTC)',
      description: 'Envio de resumo diário',
      days: [0, 1, 2, 3, 4, 5, 6], // Every day
      hour: 17
    },
    {
      jobName: 'proactive_alerts' as CronJobName,
      schedule: 'A cada 6 horas (0, 6, 12, 18 UTC)',
      description: 'Alertas proativos de sistema',
      days: [0, 1, 2, 3, 4, 5, 6],
      hour: null // Multiple hours
    }
  ]

  return schedules.map(s => {
    let nextExecution = new Date(now)
    
    if (s.hour !== null) {
      // Calcular próxima execução para job com hora específica
      const currentDay = dayOfWeek
      const currentHour = utcHour
      
      // Se já passou a hora hoje, pular para próximo dia válido
      if (s.days.includes(currentDay) && currentHour < s.hour) {
        nextExecution.setUTCHours(s.hour, 0, 0, 0)
      } else {
        // Buscar próximo dia válido
        let daysToAdd = 1
        let nextDay = (currentDay + daysToAdd) % 7
        
        while (!s.days.includes(nextDay)) {
          daysToAdd++
          nextDay = (currentDay + daysToAdd) % 7
        }
        
        nextExecution.setDate(nextExecution.getDate() + daysToAdd)
        nextExecution.setUTCHours(s.hour, 0, 0, 0)
      }
    } else {
      // Para alertas a cada 6 horas
      const currentHour = utcHour
      const nextHours = [0, 6, 12, 18]
      const nextHour = nextHours.find(h => h > currentHour) || nextHours[0]
      
      if (nextHour <= currentHour) {
        nextExecution.setDate(nextExecution.getDate() + 1)
      }
      nextExecution.setUTCHours(nextHour, 0, 0, 0)
    }

    return {
      jobName: s.jobName,
      schedule: s.schedule,
      nextExecution,
      description: s.description
    }
  })
}

/**
 * Detecta falhas silenciosas de cron jobs
 * Um cron job falhou silenciosamente se não há registro de execução
 * no período esperado (com margem de 2 horas)
 */
export async function detectSilentFailures(): Promise<Array<{
  jobName: CronJobName
  expectedAt: Date
  detectedAt: Date
  message: string
}>> {
  if (!supabaseAdmin) {
    console.error('[Silent Failure] supabaseAdmin não inicializado')
    return []
  }

  const failures: Array<{
    jobName: CronJobName
    expectedAt: Date
    detectedAt: Date
    message: string
  }> = []

  const now = new Date()
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

  // Definir jobs com horários esperados
  const schedules = [
    {
      jobName: 'blog_generation' as CronJobName,
      days: [2, 4, 6, 0], // Ter, Qui, Sáb, Dom
      hour: 12 // 12:00 UTC = 09:00 BRT
    },
    {
      jobName: 'topic_expansion' as CronJobName,
      days: [0], // Domingo
      hour: 3 // 03:00 UTC = 00:00 BRT
    },
    {
      jobName: 'daily_summary' as CronJobName,
      days: [0, 1, 2, 3, 4, 5, 6], // Every day
      hour: 17 // 17:00 UTC = 14:00 BRT
    }
  ]

  for (const schedule of schedules) {
    const currentDay = now.getUTCDay()
    const currentHour = now.getUTCHours()

    // Verificar se o job deveria ter executado nas últimas 2 horas
    let shouldHaveRun = false
    let expectedAt = new Date(now)

    if (schedule.days.includes(currentDay)) {
      // Se hoje é um dia de execução
      if (currentHour >= schedule.hour) {
        // Se já passou da hora de execução
        expectedAt.setUTCHours(schedule.hour, 0, 0, 0)
        
        // Verificar se foi dentro das últimas 2 horas
        if (expectedAt >= twoHoursAgo && expectedAt <= now) {
          shouldHaveRun = true
        }
      }
    }

    if (shouldHaveRun) {
      // Verificar se há registro de execução
      const { data, error } = await supabaseAdmin
        .from('cron_execution_log')
        .select('id, started_at')
        .eq('job_name', schedule.jobName)
        .gte('started_at', expectedAt.toISOString())
        .limit(1)

      if (error) {
        console.error(`[Silent Failure] Erro ao verificar ${schedule.jobName}:`, error)
        continue
      }

      if (!data || data.length === 0) {
        // FALHA SILENCIOSA DETECTADA
        failures.push({
          jobName: schedule.jobName,
          expectedAt,
          detectedAt: now,
          message: `Cron job "${schedule.jobName}" não executou no horário esperado (${expectedAt.toISOString()})`
        })
        
        console.warn(
          `[Silent Failure] ⚠️ ${schedule.jobName} não executou às ${expectedAt.toLocaleString('pt-BR')}`
        )
      }
    }
  }

  return failures
}
