'use client'

import { useState, useEffect, useCallback } from 'react'
import { LinkedInPost } from '@/types/linkedin'

export function useLinkedInPosts() {
  const [posts, setPosts] = useState<LinkedInPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/linkedin/posts')
      if (!response.ok) throw new Error('Erro ao buscar posts')
      
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Erro ao buscar posts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/linkedin/posts?id=${postId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao deletar post')
      
      // Atualizar lista local
      setPosts(prev => prev.filter(p => p.id !== postId))
      return true
    } catch (err) {
      console.error('Erro ao deletar post:', err)
      return false
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return {
    posts,
    loading,
    error,
    loadPosts,
    deletePost
  }
}
