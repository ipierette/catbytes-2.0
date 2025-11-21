import { useState, useEffect, useCallback } from 'react'
import type { 
  InstagramPost, 
  UseInstagramPostsOptions,
  PostUpdateData 
} from '@/lib/instagram'
import { REFRESH_INTERVALS } from '@/lib/instagram'

export type { InstagramPost } from '@/lib/instagram'

export function useInstagramPosts(options: UseInstagramPostsOptions = {}) {
  const { 
    status = 'all', 
    autoRefresh = false, 
    refreshInterval = REFRESH_INTERVALS.POSTS 
  } = options

  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const endpoint = status === 'all' 
        ? '/api/instagram/posts'
        : `/api/instagram/posts?status=${status}`

      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar posts: ${response.statusText}`)
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Erro ao carregar posts:', err)
    } finally {
      setLoading(false)
    }
  }, [status])

  const updatePost = useCallback(async (
    postId: string, 
    updates: PostUpdateData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/instagram/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (data.success) {
        // Atualização otimista local
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, ...updates } : p
        ))
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Erro ao atualizar post' }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro de conexão'
      return { success: false, error: message }
    }
  }, [])

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/instagram/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId))
        return true
      }
      return false
    } catch (err) {
      console.error('Erro ao deletar post:', err)
      return false
    }
  }, [])

  const refetch = useCallback(() => {
    loadPosts()
  }, [loadPosts])

  // Auto-refresh
  useEffect(() => {
    loadPosts()

    if (autoRefresh) {
      const interval = setInterval(loadPosts, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [loadPosts, autoRefresh, refreshInterval])

  return {
    posts,
    loading,
    error,
    refetch,
    updatePost,
    deletePost
  }
}
