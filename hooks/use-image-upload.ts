'use client'

import { useState, useCallback } from 'react'

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function useImageUpload({ onSuccess, onError }: UseImageUploadOptions = {}) {
  const [uploading, setUploading] = useState(false)

  const uploadFile = useCallback(async (file: File) => {
    // Validações
    if (!file.type.startsWith('image/')) {
      onError?.('Por favor, selecione um arquivo de imagem')
      return null
    }

    if (file.size > 10 * 1024 * 1024) {
      onError?.('Imagem muito grande. Máximo 10MB')
      return null
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'blog-images')
      formData.append('folder', 'linkedin-posts')

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Erro ao fazer upload')

      const data = await response.json()
      onSuccess?.(data.url)
      
      return data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer upload'
      onError?.(message)
      return null
    } finally {
      setUploading(false)
    }
  }, [onSuccess, onError])

  const generateImage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      onError?.('Prompt de imagem está vazio')
      return null
    }

    setUploading(true)
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024' })
      })

      if (!response.ok) throw new Error('Erro ao gerar imagem')

      const data = await response.json()
      onSuccess?.(data.url)
      
      return data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar imagem'
      onError?.(message)
      return null
    } finally {
      setUploading(false)
    }
  }, [onSuccess, onError])

  return { uploadFile, generateImage, uploading }
}
