import { useState, useEffect, useCallback } from 'react'
import type { InstagramStats } from '@/lib/instagram'
import { REFRESH_INTERVALS } from '@/lib/instagram'

export type { InstagramStats } from '@/lib/instagram'

export function useInstagramStats(
  autoRefresh = true, 
  refreshInterval = REFRESH_INTERVALS.STATS
) {
  const [stats, setStats] = useState<InstagramStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/instagram/stats')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas')
      }

      const data = await response.json()
      setStats(data.stats || null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Erro ao carregar stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const incrementStat = useCallback((
    key: keyof Omit<InstagramStats, 'byNiche'>, 
    value = 1
  ) => {
    setStats(prev => prev ? {
      ...prev,
      [key]: Math.max(0, prev[key] + value)
    } : null)
  }, [])

  const decrementStat = useCallback((
    key: keyof Omit<InstagramStats, 'byNiche'>, 
    value = 1
  ) => {
    incrementStat(key, -value)
  }, [incrementStat])

  const refetch = useCallback(() => {
    setLoading(true)
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadStats()

    if (autoRefresh) {
      const interval = setInterval(loadStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [loadStats, autoRefresh, refreshInterval])

  return {
    stats,
    loading,
    error,
    refetch,
    incrementStat,
    decrementStat
  }
}
