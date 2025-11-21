'use client'

import { useState, useCallback } from 'react'
import { VlogUploadData } from '@/types/vlog'

interface UseVlogUploadOptions {
  onSuccess?: (data: {
    vlogId: string
    videoUrl: string
    improvedDescription: string
  }) => void
  onError?: (error: string) => void
}

export function useVlogUpload({ onSuccess, onError }: UseVlogUploadOptions = {}) {
  const [uploading, setUploading] = useState(false)

  const upload = useCallback(async ({ file, description }: VlogUploadData) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', description)

      const response = await fetch('/api/vlog/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const data = await response.json()

      onSuccess?.({
        vlogId: data.vlog.id,
        videoUrl: data.vlog.videoUrl,
        improvedDescription: data.vlog.improvedDescription
      })

      return data.vlog
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      onError?.(message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [onSuccess, onError])

  return { upload, uploading }
}
