'use client'

import { useState, useCallback } from 'react'

interface UsePostGenerationOptions {
  onSuccess?: (data: { postText: string; imagePrompt: string }) => void
  onError?: (error: string) => void
}

export function usePostGeneration({ onSuccess, onError }: UsePostGenerationOptions = {}) {
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async (
    type: 'blog-article' | 'fullstack-random',
    articleSlug?: string
  ) => {
    setGenerating(true)
    
    try {
      const response = await fetch('/api/linkedin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, articleSlug })
      })

      if (!response.ok) throw new Error('Erro ao gerar post')

      const data = await response.json()
      onSuccess?.({ postText: data.postText, imagePrompt: data.imagePrompt })
      
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      onError?.(message)
      throw err
    } finally {
      setGenerating(false)
    }
  }, [onSuccess, onError])

  return { generate, generating }
}
