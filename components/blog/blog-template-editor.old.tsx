'use client'

import { useState } from 'react'
import { BlogPost } from '@/types/blog'
import { BlogTemplateSelector, TemplateType } from './blog-template-selector'
import { BlogTemplatePreview } from './blog-template-preview'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload, Eye, Save, Copy, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface BlogTemplateEditorProps {
  post: BlogPost
  onSave?: (data: {
    template: TemplateType
    images: { image1?: string; image2?: string }
  }) => void
}

export function BlogTemplateEditor({ post, onSave }: BlogTemplateEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('text-only')
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingImage1, setUploadingImage1] = useState(false)
  const [uploadingImage2, setUploadingImage2] = useState(false)
  const [images, setImages] = useState<{
    image1?: string
    image2?: string
  }>({})

  // Número de imagens necessárias por template
  const templateImageCount = {
    'text-only': 0,
    'centered-image': 1,
    'two-columns': 2,
    'image-left': 1
  }

  const imagePrompts = {
    image1: post.image_prompt || post.content_image_prompts?.[0],
    image2: post.content_image_prompts?.[1]
  }

  const handleImageUpload = async (file: File, slot: 'image1' | 'image2') => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida')
      return
    }

    const setLoading = slot === 'image1' ? setUploadingImage1 : setUploadingImage2

    setLoading(true)
    toast.loading(`Fazendo upload da imagem ${slot === 'image1' ? '1' : '2'}...`, { id: `upload-${slot}` })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', imagePrompts[slot] || `Imagem ${slot === 'image1' ? '1' : '2'}`)

      const response = await fetch(`/api/admin/blog/posts/${post.slug}/content-images`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      // Extract image URL from markdown snippet
      const imageUrlMatch = data.markdownSnippet.match(/!\[.*?\]\((.*?)\)/)
      const imageUrl = imageUrlMatch ? imageUrlMatch[1] : data.imageUrl

      setImages(prev => ({
        ...prev,
        [slot]: imageUrl
      }))

      toast.success(`✅ Imagem ${slot === 'image1' ? '1' : '2'} carregada!`, { id: `upload-${slot}` })
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error(error.message, { id: `upload-${slot}` })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, slot: 'image1' | 'image2') => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file, slot)
    }
  }

  const copyPrompt = async (text: string, slot: number) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`✅ Prompt ${slot} copiado!`)
    } catch (err) {
      // Fallback for older browsers
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success(`✅ Prompt ${slot} copiado!`)
      } catch (fallbackErr) {
        toast.error('Erro ao copiar. Tente manualmente.')
      }
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        template: selectedTemplate,
        images
      })
    }
  }

  const needsImages = templateImageCount[selectedTemplate]
  const hasAllImages = needsImages === 0 || 
    (needsImages === 1 && images.image1) ||
    (needsImages === 2 && images.image1 && images.image2)

  return (
    <div className="space-y-8">
      {/* Template Selector */}
      <BlogTemplateSelector
        post={post}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
      />

      {/* Image Upload Section - Only show if template needs images */}
      {needsImages > 0 && (
        <div className="space-y-6 p-6 bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 text-emerald-400">
            <Upload className="w-5 h-5" />
            <h3 className="text-lg font-semibold">
              Upload de Imagens ({needsImages} {needsImages === 1 ? 'imagem necessária' : 'imagens necessárias'})
            </h3>
          </div>

          {/* AI Prompts Info */}
          {(imagePrompts.image1 || imagePrompts.image2) && (
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Prompts Gerados pela IA</span>
              </div>

              <div className="space-y-3">
                {imagePrompts.image1 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-blue-300">Prompt para Imagem 1:</Label>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-2 bg-slate-900 rounded text-xs text-slate-300 overflow-x-auto border border-blue-800/50">
                        {imagePrompts.image1}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPrompt(imagePrompts.image1!, 1)}
                        className="flex-shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {needsImages === 2 && imagePrompts.image2 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-blue-300">Prompt para Imagem 2:</Label>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-2 bg-slate-900 rounded text-xs text-slate-300 overflow-x-auto border border-blue-800/50">
                        {imagePrompts.image2}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPrompt(imagePrompts.image2!, 2)}
                        className="flex-shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image 1 Upload */}
          <div className="space-y-3">
            <Label className="text-slate-200">Imagem 1 {needsImages >= 1 && <span className="text-red-400">*</span>}</Label>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'image1')}
                  disabled={uploadingImage1}
                  className="flex-1 bg-slate-900 border-slate-700"
                />
                {images.image1 && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Carregada
                  </div>
                )}
              </div>
              {images.image1 && (
                <div className="relative h-48 rounded-lg overflow-hidden border-2 border-emerald-500/50">
                  <img 
                    src={images.image1} 
                    alt="Preview 1" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Image 2 Upload - Only for two-columns template */}
          {needsImages === 2 && (
            <div className="space-y-3">
              <Label className="text-slate-200">Imagem 2 <span className="text-red-400">*</span></Label>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'image2')}
                    disabled={uploadingImage2}
                    className="flex-1 bg-slate-900 border-slate-700"
                  />
                  {images.image2 && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Carregada
                    </div>
                  )}
                </div>
                {images.image2 && (
                  <div className="relative h-48 rounded-lg overflow-hidden border-2 border-emerald-500/50">
                    <img 
                      src={images.image2} 
                      alt="Preview 2" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={!hasAllImages}
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Ocultar' : 'Visualizar'} Preview
        </Button>

        <Button
          onClick={handleSave}
          size="lg"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          disabled={!hasAllImages}
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Template
        </Button>
      </div>

      {/* Preview */}
      {showPreview && hasAllImages && (
        <div className="p-8 bg-slate-950 rounded-xl border border-emerald-500/30">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-emerald-400">Preview da Publicação</h3>
            <span className="text-sm text-slate-400">
              Como o público verá o artigo
            </span>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg">
            <BlogTemplatePreview
              post={post}
              template={selectedTemplate}
              images={images}
            />
          </div>
        </div>
      )}

      {/* Help Text */}
      {!hasAllImages && needsImages > 0 && (
        <p className="text-sm text-slate-400 text-center">
          ℹ️ Faça upload de {needsImages === 1 ? 'uma imagem' : 'duas imagens'} para visualizar o preview e publicar
        </p>
      )}
    </div>
  )
}
