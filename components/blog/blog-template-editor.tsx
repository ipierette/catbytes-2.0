'use client'

import { useState } from 'react'
import { BlogPost } from '@/types/blog'
import { BlogTemplateSelector, TemplateType } from './blog-template-selector'
import { BlogTemplatePreview } from './blog-template-preview'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload, Eye, Save, Copy, Sparkles, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface BlogTemplateEditorProps {
  post: BlogPost
  onSave?: (data: {
    template: TemplateType
    images: { 
      coverImage?: string
      bodyImage1?: string
      bodyImage2?: string
    }
  }) => void
}

export function BlogTemplateEditor({ post, onSave }: BlogTemplateEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('traditional')
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingBody1, setUploadingBody1] = useState(false)
  const [uploadingBody2, setUploadingBody2] = useState(false)
  const [images, setImages] = useState<{
    coverImage?: string
    bodyImage1?: string
    bodyImage2?: string
  }>({
    coverImage: post.cover_image_url || undefined
  })

  // Número de imagens do corpo necessárias por template
  const templateBodyImageCount: Record<TemplateType, number> = {
    'traditional': 1,
    'visual-duo': 2,
    'editorial': 1,
    'final-emphasis': 1
  }

  // Prompts da IA
  const imagePrompts = {
    cover: post.image_prompt,
    body1: post.content_image_prompts?.[0],
    body2: post.content_image_prompts?.[1]
  }

  const handleImageUpload = async (
    file: File, 
    slot: 'coverImage' | 'bodyImage1' | 'bodyImage2'
  ) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('❌ Selecione uma imagem válida')
      return
    }

    const setLoading = 
      slot === 'coverImage' ? setUploadingCover :
      slot === 'bodyImage1' ? setUploadingBody1 : setUploadingBody2

    const slotName = 
      slot === 'coverImage' ? 'Capa' :
      slot === 'bodyImage1' ? 'Corpo 1' : 'Corpo 2'

    setLoading(true)
    toast.loading(`📤 Upload ${slotName}...`, { id: `upload-${slot}` })

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const prompt = 
        slot === 'coverImage' ? imagePrompts.cover :
        slot === 'bodyImage1' ? imagePrompts.body1 :
        imagePrompts.body2
      
      formData.append('description', prompt || `Imagem ${slotName}`)

      const endpoint = slot === 'coverImage' 
        ? `/api/admin/blog/posts/${post.slug}/cover-image`
        : `/api/admin/blog/posts/${post.slug}/content-images`

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      // Extract image URL
      const imageUrlMatch = data.markdownSnippet?.match(/!\[.*?\]\((.*?)\)/)
      const imageUrl = imageUrlMatch ? imageUrlMatch[1] : (data.imageUrl || data.url)

      setImages(prev => ({
        ...prev,
        [slot]: imageUrl
      }))

      toast.success(`✅ ${slotName} carregada!`, { id: `upload-${slot}` })
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error(`❌ ${error.message}`, { id: `upload-${slot}` })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>, 
    slot: 'coverImage' | 'bodyImage1' | 'bodyImage2'
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file, slot)
    }
  }

  const copyPrompt = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`✅ Prompt ${label} copiado!`)
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      toast.success(`✅ Prompt ${label} copiado!`)
    }
  }

  const handleSave = () => {
    if (!images.coverImage) {
      toast.error('⚠️ Imagem de capa é obrigatória!')
      return
    }

    const bodyImagesRequired = templateBodyImageCount[selectedTemplate]
    
    if (bodyImagesRequired === 1 && !images.bodyImage1) {
      toast.error('⚠️ Este template requer 1 imagem no corpo do texto')
      return
    }

    if (bodyImagesRequired === 2 && (!images.bodyImage1 || !images.bodyImage2)) {
      toast.error('⚠️ Este template requer 2 imagens no corpo do texto')
      return
    }

    onSave?.({
      template: selectedTemplate,
      images
    })

    toast.success('✅ Template configurado com sucesso!')
  }

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <BlogTemplateSelector
        post={post}
        onTemplateSelect={setSelectedTemplate}
        selectedTemplate={selectedTemplate}
      />

      {/* Upload de Imagens */}
      <div className="space-y-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <ImageIcon className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Upload de Imagens</h3>
        </div>

        {/* IMAGEM DE CAPA - OBRIGATÓRIA */}
        <div className="space-y-3 p-4 bg-purple-950/20 rounded-lg border-2 border-purple-700/50">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-purple-300 flex items-center gap-2">
              📸 Imagem de Capa
              <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-300 rounded border border-red-700/50">
                OBRIGATÓRIA
              </span>
            </Label>

            {imagePrompts.cover && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyPrompt(imagePrompts.cover!, 'Capa')}
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar Prompt IA
              </Button>
            )}
          </div>

          {imagePrompts.cover && (
            <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-700 font-mono">
              <strong className="text-emerald-400">🤖 Prompt da IA:</strong> {imagePrompts.cover}
            </div>
          )}

          <div className="flex gap-3 items-center">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'coverImage')}
              disabled={uploadingCover}
              className="flex-1 bg-slate-900 border-slate-700 text-slate-300"
            />
            {uploadingCover && (
              <span className="text-sm text-emerald-400 animate-pulse">Uploading...</span>
            )}
          </div>

          {images.coverImage && (
            <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={images.coverImage} 
                alt="Preview capa" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-white text-xs rounded">
                ✓ Carregada
              </div>
            </div>
          )}
        </div>

        {/* IMAGEM DO CORPO 1 */}
        {templateBodyImageCount[selectedTemplate] >= 1 && (
          <div className="space-y-3 p-4 bg-blue-950/20 rounded-lg border-2 border-blue-700/50">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-blue-300 flex items-center gap-2">
                🖼️ Imagem do Corpo 1
                <span className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded border border-orange-700/50">
                  NECESSÁRIA
                </span>
              </Label>

              {imagePrompts.body1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyPrompt(imagePrompts.body1!, 'Corpo 1')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar Prompt IA
                </Button>
              )}
            </div>

            {imagePrompts.body1 && (
              <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-700 font-mono">
                <strong className="text-emerald-400">🤖 Prompt da IA:</strong> {imagePrompts.body1}
              </div>
            )}

            <div className="flex gap-3 items-center">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'bodyImage1')}
                disabled={uploadingBody1}
                className="flex-1 bg-slate-900 border-slate-700 text-slate-300"
              />
              {uploadingBody1 && (
                <span className="text-sm text-emerald-400 animate-pulse">Uploading...</span>
              )}
            </div>

            {images.bodyImage1 && (
              <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={images.bodyImage1} 
                  alt="Preview corpo 1" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-white text-xs rounded">
                  ✓ Carregada
                </div>
              </div>
            )}
          </div>
        )}

        {/* IMAGEM DO CORPO 2 */}
        {templateBodyImageCount[selectedTemplate] >= 2 && (
          <div className="space-y-3 p-4 bg-blue-950/20 rounded-lg border-2 border-blue-700/50">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-blue-300 flex items-center gap-2">
                🖼️ Imagem do Corpo 2
                <span className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded border border-orange-700/50">
                  NECESSÁRIA
                </span>
              </Label>

              {imagePrompts.body2 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyPrompt(imagePrompts.body2!, 'Corpo 2')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar Prompt IA
                </Button>
              )}
            </div>

            {imagePrompts.body2 && (
              <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-700 font-mono">
                <strong className="text-emerald-400">🤖 Prompt da IA:</strong> {imagePrompts.body2}
              </div>
            )}

            <div className="flex gap-3 items-center">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'bodyImage2')}
                disabled={uploadingBody2}
                className="flex-1 bg-slate-900 border-slate-700 text-slate-300"
              />
              {uploadingBody2 && (
                <span className="text-sm text-emerald-400 animate-pulse">Uploading...</span>
              )}
            </div>

            {images.bodyImage2 && (
              <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src={images.bodyImage2} 
                  alt="Preview corpo 2" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-white text-xs rounded">
                  ✓ Carregada
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
          className="flex-1 border-emerald-700 text-emerald-400 hover:bg-emerald-900/30"
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Ocultar' : 'Ver'} Preview
        </Button>

        <Button
          onClick={handleSave}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Template
        </Button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="mt-6 p-6 bg-slate-800/30 rounded-xl border border-slate-700">
          <div className="mb-4 flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Preview do Artigo</h3>
          </div>
          
          <div className="bg-white dark:bg-slate-950 rounded-lg p-4 overflow-auto max-h-[600px]">
            <BlogTemplatePreview
              post={post}
              template={selectedTemplate}
              images={images}
            />
          </div>
        </div>
      )}
    </div>
  )
}
