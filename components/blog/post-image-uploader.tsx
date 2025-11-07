'use client'

import { useState } from 'react'
import { Upload, Image as ImageIcon, Check, X, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PostImageUploaderProps {
  postSlug: string
  currentCoverUrl?: string
  onCoverUpdated?: (newUrl: string) => void
}

export function PostImageUploader({ postSlug, currentCoverUrl, onCoverUpdated }: PostImageUploaderProps) {
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingContent, setUploadingContent] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [contentPreview, setContentPreview] = useState<string | null>(null)
  const [contentDescription, setContentDescription] = useState('')
  const [markdownSnippet, setMarkdownSnippet] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleCoverUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Selecione uma imagem válida' })
      return
    }

    setUploadingCover(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/admin/blog/posts/${postSlug}/cover-image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      setMessage({ type: 'success', text: '✅ Imagem de capa atualizada!' })
      setCoverPreview(null)
      onCoverUpdated?.(data.coverImageUrl)

      // Auto-hide success message
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Erro no upload:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setUploadingCover(false)
    }
  }

  const handleContentUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Selecione uma imagem válida' })
      return
    }

    if (!contentDescription.trim()) {
      setMessage({ type: 'error', text: 'Adicione uma descrição para a imagem' })
      return
    }

    setUploadingContent(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', contentDescription)

      const response = await fetch(`/api/admin/blog/posts/${postSlug}/content-images`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      setMarkdownSnippet(data.markdownSnippet)
      setMessage({ type: 'success', text: '✅ Imagem enviada! Copie o código abaixo.' })
      setContentPreview(null)
      setContentDescription('')
    } catch (error: any) {
      console.error('Erro no upload:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setUploadingContent(false)
    }
  }

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      handleCoverUpload(file)
    }
  }

  const handleContentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setContentPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet)
      setMessage({ type: 'success', text: '✅ Markdown copiado!' })
      setTimeout(() => {
        setMessage(null)
        setMarkdownSnippet('')
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao copiar' })
    }
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        Upload de Imagens (Admin)
      </h3>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'error' 
            ? 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100' 
            : 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Cover Image Upload */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Imagem de Capa</Label>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Substitua a imagem de capa atual (1792x1024 recomendado)
        </p>
        
        {coverPreview && (
          <div className="relative">
            <img 
              src={coverPreview} 
              alt="Preview" 
              className="w-full max-h-48 object-cover rounded-lg border-2 border-purple-300"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleCoverFileSelect}
            disabled={uploadingCover}
            className="cursor-pointer"
          />
        </div>

        {uploadingCover && (
          <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
            <Upload className="w-4 h-4 animate-pulse" />
            Enviando...
          </div>
        )}
      </div>

      {/* Content Image Upload */}
      <div className="space-y-3 pt-6 border-t border-purple-200 dark:border-purple-700">
        <Label className="text-base font-semibold">Imagem para Conteúdo</Label>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Faça upload de fluxogramas, diagramas, ou qualquer imagem explicativa
        </p>

        <div>
          <Label className="text-sm">Descrição da Imagem (Alt Text)</Label>
          <Input
            type="text"
            value={contentDescription}
            onChange={(e) => setContentDescription(e.target.value)}
            placeholder="Ex: Fluxograma do processo de automação"
            className="mt-1"
          />
        </div>

        {contentPreview && (
          <div className="relative">
            <img 
              src={contentPreview} 
              alt="Preview" 
              className="w-full max-h-48 object-contain rounded-lg border-2 border-purple-300"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleContentFileSelect}
            disabled={uploadingContent}
            className="flex-1 cursor-pointer"
          />
          <Button
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement
              const file = input?.files?.[0]
              if (file) handleContentUpload(file)
            }}
            disabled={uploadingContent || !contentPreview || !contentDescription}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploadingContent ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>

        {markdownSnippet && (
          <div className="space-y-2 bg-white dark:bg-gray-900 p-4 rounded-lg border border-green-300 dark:border-green-700">
            <Label className="text-sm font-semibold text-green-700 dark:text-green-400">
              ✅ Código Markdown (cole no editor)
            </Label>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-x-auto">
                {markdownSnippet}
              </code>
              <Button
                onClick={copyMarkdown}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
