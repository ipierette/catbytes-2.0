import { useState, useEffect } from 'react'

interface SystemStats {
  blog: {
    totalPosts: number
    publishedPosts: number
    drafts: number
    lastGenerated: string | null
  }
  instagram: {
    totalPosts: number
    pendingPosts: number
    publishedPosts: number
    lastGenerated: string | null
  }
  automation: {
    status: 'active' | 'paused'
    nextRun: string
    lastRun: string
    cronJobs: number
  }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/stats/overview')
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Não foi possível carregar estatísticas`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setStats({
          blog: {
            totalPosts: data.data.blog.total,
            publishedPosts: data.data.blog.published,
            drafts: data.data.blog.drafts,
            lastGenerated: data.data.blog.lastGenerated
          },
          instagram: {
            totalPosts: data.data.instagram.total,
            pendingPosts: data.data.instagram.pending,
            publishedPosts: data.data.instagram.published,
            lastGenerated: data.data.instagram.lastGenerated
          },
          automation: {
            status: data.data.automation.status as 'active' | 'paused',
            nextRun: data.data.automation.nextGeneration,
            lastRun: data.data.automation.lastRun,
            cronJobs: data.data.automation.cronJobs
          }
        })
        setIsCached(data.cached || false)
        setLastUpdate(new Date())
      } else {
        throw new Error(data.error || 'Erro ao carregar estatísticas')
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    loading,
    error,
    isCached,
    lastUpdate,
    reload: loadStats
  }
}
