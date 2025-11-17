/**
 * Daily Events Logger
 * 
 * Sistema de logging de eventos diários para geração de relatórios consolidados.
 * Registra blogs gerados, posts publicados, erros e outras atividades do sistema.
 */

import { supabaseAdmin } from './supabase'

export type EventType = 
  | 'blog_generated'
  | 'blog_failed'
  | 'instagram_published'
  | 'instagram_failed'
  | 'linkedin_published'
  | 'linkedin_failed'
  | 'cron_executed'
  | 'cron_failed'
  | 'newsletter_sent'
  | 'newsletter_failed'

export interface DailyEvent {
  id?: string
  event_type: EventType
  event_date: string // YYYY-MM-DD
  event_time: string // ISO timestamp
  title: string
  description?: string
  metadata?: Record<string, any>
  error_message?: string
  created_at?: string
}

/**
 * Registra um evento no log diário
 */
export async function logDailyEvent(event: Omit<DailyEvent, 'id' | 'created_at' | 'event_date' | 'event_time'>): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('[Daily Events Logger] Supabase not configured - event not logged')
    return
  }

  try {
    const now = new Date()
    const eventDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const eventTime = now.toISOString()

    const { error } = await supabaseAdmin
      .from('daily_events')
      .insert({
        ...event,
        event_date: eventDate,
        event_time: eventTime
      })

    if (error) {
      console.error('[Daily Events Logger] Failed to log event:', error)
    } else {
      console.log(`[Daily Events Logger] ✅ Event logged: ${event.event_type} - ${event.title}`)
    }
  } catch (error) {
    console.error('[Daily Events Logger] Error logging event:', error)
  }
}

/**
 * Busca todos os eventos de uma data específica
 */
export async function getEventsForDate(date: string): Promise<DailyEvent[]> {
  if (!supabaseAdmin) {
    console.warn('[Daily Events Logger] Supabase not configured')
    return []
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('daily_events')
      .select('*')
      .eq('event_date', date)
      .order('event_time', { ascending: true })

    if (error) {
      console.error('[Daily Events Logger] Failed to fetch events:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[Daily Events Logger] Error fetching events:', error)
    return []
  }
}

/**
 * Busca eventos dos últimos N dias
 */
export async function getRecentEvents(days: number = 7): Promise<DailyEvent[]> {
  if (!supabaseAdmin) {
    console.warn('[Daily Events Logger] Supabase not configured')
    return []
  }

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const { data, error } = await supabaseAdmin
      .from('daily_events')
      .select('*')
      .gte('event_date', startDateStr)
      .order('event_time', { ascending: false })

    if (error) {
      console.error('[Daily Events Logger] Failed to fetch recent events:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[Daily Events Logger] Error fetching recent events:', error)
    return []
  }
}

/**
 * Conta eventos por tipo para uma data específica
 */
export async function getEventStatsByDate(date: string): Promise<Record<EventType, number>> {
  const events = await getEventsForDate(date)
  
  const stats: Record<string, number> = {
    blog_generated: 0,
    blog_failed: 0,
    instagram_published: 0,
    instagram_failed: 0,
    linkedin_published: 0,
    linkedin_failed: 0,
    cron_executed: 0,
    cron_failed: 0,
    newsletter_sent: 0,
    newsletter_failed: 0
  }

  events.forEach(event => {
    stats[event.event_type] = (stats[event.event_type] || 0) + 1
  })

  return stats as Record<EventType, number>
}

/**
 * Limpa eventos antigos (mais de 30 dias)
 */
export async function cleanupOldEvents(): Promise<number> {
  if (!supabaseAdmin) {
    console.warn('[Daily Events Logger] Supabase not configured')
    return 0
  }

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

    const { data, error } = await supabaseAdmin
      .from('daily_events')
      .delete()
      .lt('event_date', cutoffDateStr)
      .select()

    if (error) {
      console.error('[Daily Events Logger] Failed to cleanup old events:', error)
      return 0
    }

    const deletedCount = data?.length || 0
    console.log(`[Daily Events Logger] Cleaned up ${deletedCount} old events (older than ${cutoffDateStr})`)
    return deletedCount
  } catch (error) {
    console.error('[Daily Events Logger] Error cleaning up old events:', error)
    return 0
  }
}
