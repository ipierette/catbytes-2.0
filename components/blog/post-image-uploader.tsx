'use client'

import { useState } from 'react'
import { Upload, Image as ImageIcon, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface PostImageUploaderProps {
  postSlug: string
  currentCoverUrl?: string
  currentContent?: string
  onCoverUpdated?: (newUrl: string) => void
  onContentUpdated?: (newContent: string) => void
  imagePrompt?: string | null
  contentImagePrompts?: string[] | null
}

export function PostImageUploader({ 
  postSlug, 
  currentCoverUrl, 
  currentContent, 
  onCoverUpdated, 
  onContentUpdated,
  imagePrompt,
  contentImagePrompts
}: PostImageUploaderProps) {
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingContent, setUploadingContent] = useState<number | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [contentPreviews, setContentPreviews] = useState<(string | null)[]>([null, null, null, null])
  const [contentDescriptions, setContentDescriptions] = useState<string[]>(['', '', '', ''])
  const [markdownSnippets, setMarkdownSnippets] = useState<string[]>(['', '', '', ''])
  const [editableContent, setEditableContent] = useState(currentContent || '')
  
  // Single content upload states (for backward compatibility)
  const [contentPreview, setContentPreview] = useState<string | null>(null)
  const [contentDescription, setContentDescription] = useState('')
  const [markdownSnippet, setMarkdownSnippet] = useState('')

  const handleCoverUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida')
      return
    }

    setUploadingCover(true)

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

      toast.success('✅ Imagem de capa atualizada!')
      setCoverPreview(null)
      onCoverUpdated?.(data.coverImageUrl)
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error(error.message)
    } finally {
      setUploadingCover(false)
    }
  }

  const handleContentUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida')
      return
    }

    if (!contentDescription.trim()) {
      toast.error('Adicione uma descrição para a imagem')
      return
    }

    setUploadingContent(0)

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
      toast.success('✅ Imagem enviada! Copie o código abaixo.')
      setContentPreview(null)
      setContentDescription('')
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error(error.message)
    } finally {
      setUploadingContent(null)
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

  const copyMarkdown = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(markdownSnippet)
      toast.success('✅ Markdown copiado!')
    } catch (err) {
      // Fallback for older browsers or permissions denied
      try {
        const textarea = document.createElement('textarea')
        textarea.value = markdownSnippet
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success('✅ Markdown copiado!')
      } catch (fallbackErr) {
        console.error('Erro ao copiar:', fallbackErr)
        toast.error('Erro ao copiar. Tente manualmente.')
      }
    }
  }

  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('✅ Prompt copiado!')
    } catch (err) {
      // Fallback for older browsers or permissions denied
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success('✅ Prompt copiado!')
      } catch (fallbackErr) {
        console.error('Erro ao copiar:', fallbackErr)
        toast.error('Erro ao copiar. Tente manualmente.')
      }
    }
  }

  const insertImageIntoContent = () => {
    if (!markdownSnippet) return
    
    const cursorPosition = editableContent.length
    const newContent = editableContent + '\n\n' + markdownSnippet + '\n\n'
    setEditableContent(newContent)
    onContentUpdated?.(newContent)
    toast.success('✅ Imagem inserida no conteúdo!')
    setMarkdownSnippet('')
    setContentPreview(null)
    setContentDescription('')
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        Upload de Imagens (Admin)
      </h3>

      {/* AI Prompts Section */}
      {(imagePrompt || (contentImagePrompts && contentImagePrompts.length > 0)) && (
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
            🤖 Prompts Gerados pela IA
          </h4>
          
          {imagePrompt && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-blue-800 dark:text-blue-400">
                Prompt para Imagem de Capa
              </Label>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded text-sm overflow-x-auto border border-blue-200 dark:border-blue-800">
                  {imagePrompt}
                </code>
                <Button
                  onClick={() => copyPrompt(imagePrompt)}
                  variant="outline"
                  size="sm"
                  className="gap-1 border-blue-300 dark:border-blue-700"
                  title="Copiar prompt"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                💡 Use este prompt no DALL-E, Midjourney ou outra ferramenta de IA para gerar a imagem de capa
              </p>
            </div>
          )}

          {contentImagePrompts && contentImagePrompts.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800 dark:text-blue-400">
                Prompts para Imagens de Conteúdo ({contentImagePrompts.length})
              </Label>
              {contentImagePrompts.map((prompt, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded text-sm overflow-x-auto border border-blue-200 dark:border-blue-800">
                      {prompt}
                    </code>
                    <Button
                      onClick={() => copyPrompt(prompt)}
                      variant="outline"
                      size="sm"
                      className="gap-1 border-blue-300 dark:border-blue-700"
                      title="Copiar prompt"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-blue-700 dark:text-blue-400">
                💡 Gere estas imagens e faça upload abaixo na seção "Imagem para Conteúdo"
              </p>
            </div>
          )}
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
            disabled={uploadingContent !== null}
            className="flex-1 cursor-pointer"
            id="content-image-input"
          />
          <Button
            onClick={() => {
              const input = document.getElementById('content-image-input') as HTMLInputElement
              const file = input?.files?.[0]
              if (file) handleContentUpload(file)
            }}
            disabled={uploadingContent !== null || !contentPreview || !contentDescription}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploadingContent !== null ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>

        {markdownSnippet && (
          <div className="space-y-2 bg-white dark:bg-gray-900 p-4 rounded-lg border border-green-300 dark:border-green-700">
            <Label className="text-sm font-semibold text-green-700 dark:text-green-400">
              ✅ Imagem enviada!
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
                title="Copiar markdown"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                onClick={insertImageIntoContent}
                variant="default"
                size="sm"
                className="gap-1 bg-green-600 hover:bg-green-700"
              >
                Inserir no Conteúdo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content Editor */}
      {onContentUpdated && (
        <div className="space-y-3 pt-6 border-t border-purple-200 dark:border-purple-700">
          <Label className="text-base font-semibold">Editar Conteúdo do Post</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Edite o conteúdo Markdown. As imagens já inseridas aparecerão como <code>![alt](url)</code>
          </p>
          
          <Textarea
            value={editableContent}
            onChange={(e) => {
              setEditableContent(e.target.value)
              onContentUpdated(e.target.value)
            }}
            className="min-h-[300px] font-mono text-sm"
            placeholder="# Título

Seu conteúdo aqui...

![Descrição da imagem](https://url-da-imagem.jpg)"
          />
          
          <div className="text-xs text-gray-500">
            💡 <strong>Dica:</strong> Use Markdown para formatar (**, *, ##, etc). Imagens enviadas acima podem ser inseridas automaticamente.
          </div>
        </div>
      )}
    </div>
  )
}
