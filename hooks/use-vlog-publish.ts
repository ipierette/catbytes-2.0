'use client'

import { useState, useCallback } from 'react'
import { VlogPublishData, Platform } from '@/types/vlog'

interface UseVlogPublishOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export function useVlogPublish({ onSuccess, onError }: UseVlogPublishOptions = {}) {
  const [publishing, setPublishing] = useState(false)

  const publish = useCallback(async ({ vlogId, platforms, description }: VlogPublishData) => {
    setPublishing(true)

    try {
      const response = await fetch('/api/vlog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vlogId, platforms, description })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao publicar')
      }

      const data = await response.json()
      onSuccess?.(data.message)

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      onError?.(message)
      throw err
    } finally {
      setPublishing(false)
    }
  }, [onSuccess, onError])

  return { publish, publishing }
}
