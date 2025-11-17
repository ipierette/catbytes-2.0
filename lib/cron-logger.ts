import { supabaseAdmin } from '@/lib/supabase'

export type CronType = 'blog' | 'instagram' | 'token-check'
export type CronStatus = 'success' | 'failed' | 'running'

interface LogCronExecutionParams {
  cronType: CronType
  status: CronStatus
  durationMs?: number
  details?: {
    action?: string
    error?: string
    blog_post_id?: number
    instagram_posts?: number
    [key: string]: any
  }
}

/**
 * Registra execução de um cron job no banco de dados
 */
export async function logCronExecution({
  cronType,
  status,
  durationMs,
  details
}: LogCronExecutionParams): Promise<void> {
  try {
    if (!supabaseAdmin) {
      console.error('[Cron Logger] Supabase admin não configurado')
      return
    }

    const { error } = await supabaseAdmin
      .from('cron_execution_logs')
      .insert({
        cron_type: cronType,
        status,
        duration_ms: durationMs || null,
        details: details || null,
        executed_at: new Date().toISOString()
      })

    if (error) {
      console.error('[Cron Logger] Erro ao salvar log:', error)
    } else {
      console.log(`[Cron Logger] ✓ Log registrado: ${cronType} - ${status}`)
    }
  } catch (error) {
    console.error('[Cron Logger] Erro inesperado:', error)
  }
}

/**
 * Inicia o registro de uma execução de cron
 * Retorna uma função para finalizar o log com sucesso ou erro
 */
export function startCronLog(cronType: CronType) {
  const startTime = Date.now()
  
  // Registra início imediato (opcional, pode comentar se preferir só registrar ao finalizar)
  // logCronExecution({ cronType, status: 'running' })

  return {
    /**
     * Finaliza o log com sucesso
     */
    success: async (details?: Record<string, any>) => {
      const durationMs = Date.now() - startTime
      await logCronExecution({
        cronType,
        status: 'success',
        durationMs,
        details
      })
    },

    /**
     * Finaliza o log com erro
     */
    fail: async (error: Error | string, details?: Record<string, any>) => {
      const durationMs = Date.now() - startTime
      await logCronExecution({
        cronType,
        status: 'failed',
        durationMs,
        details: {
          ...details,
          error: error instanceof Error ? error.message : error
        }
      })
    }
  }
}
