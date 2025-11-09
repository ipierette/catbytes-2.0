'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ManualPostEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function ManualPostEditor({ isOpen, onClose, onSave }: ManualPostEditorProps) {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  const [contentImages, setContentImages] = useState<File[]>([])
  const [contentImagePreviews, setContentImagePreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem deve ter no máximo 5MB')
        return
      }
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleContentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (contentImages.length + files.length > 2) {
      toast.error('Máximo de 2 imagens de conteúdo')
      return
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} excede 5MB`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setContentImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    setContentImages(prev => [...prev, ...files])
  }

  const removeCoverImage = () => {
    setCoverImage(null)
    setCoverImagePreview('')
  }

  const removeContentImage = (index: number) => {
    setContentImages(prev => prev.filter((_, i) => i !== index))
    setContentImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    // Validações
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    if (!excerpt.trim()) {
      toast.error('Resumo é obrigatório')
      return
    }
    if (!content.trim()) {
      toast.error('Conteúdo é obrigatório')
      return
    }
    if (!coverImage) {
      toast.error('Imagem de capa é obrigatória')
      return
    }

    setSaving(true)
    toast.loading('Salvando artigo...', { id: 'save-manual' })

    try {
      // Upload da imagem de capa
      const coverFormData = new FormData()
      coverFormData.append('image', coverImage)
      coverFormData.append('slug', title.toLowerCase().replace(/\s+/g, '-'))

      const coverUploadRes = await fetch('/api/blog/upload-image', {
        method: 'POST',
        body: coverFormData,
      })

      if (!coverUploadRes.ok) {
        throw new Error('Falha no upload da imagem de capa')
      }

      const { url: coverImageUrl } = await coverUploadRes.json()

      // Upload das imagens de conteúdo
      const contentImageUrls: string[] = []
      for (const image of contentImages) {
        const formData = new FormData()
        formData.append('image', image)
        formData.append('slug', `${title.toLowerCase().replace(/\s+/g, '-')}-content-${contentImageUrls.length + 1}`)

        const uploadRes = await fetch('/api/blog/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          contentImageUrls.push(url)
        }
      }

      // Criar post
      const postData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImageUrl: coverImageUrl,  // camelCase para a API
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        contentImages: contentImageUrls,  // camelCase para a API
      }

      const saveRes = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      })

      if (!saveRes.ok) {
        throw new Error('Falha ao salvar post')
      }

      toast.success('✅ Artigo publicado com sucesso!', { id: 'save-manual' })
      
      // Limpar formulário
      setTitle('')
      setExcerpt('')
      setContent('')
      setTags('')
      setCoverImage(null)
      setCoverImagePreview('')
      setContentImages([])
      setContentImagePreviews([])
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving manual post:', error)
      toast.error('Erro ao salvar artigo', { id: 'save-manual' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✍️ Escrever Artigo Manual</DialogTitle>
          <DialogDescription>
            Crie um artigo do zero com suas próprias imagens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Como criar um chatbot com IA"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{title.length}/100 caracteres</p>
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo *</Label>
            <Textarea
              id="excerpt"
              placeholder="Breve descrição do artigo (150-200 caracteres)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">{excerpt.length}/200 caracteres</p>
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo * (Markdown suportado)</Label>
            <Textarea
              id="content"
              placeholder="## Introdução

Seu conteúdo aqui em Markdown...

### Seção 1
- Ponto 1
- Ponto 2

**Texto em negrito** e *itálico*"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use Markdown: ## para títulos, **negrito**, *itálico*, - listas
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              placeholder="Ex: IA, automação, chatbot, negócios"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Imagem de Capa */}
          <div className="space-y-2">
            <Label>Imagem de Capa * (1792x1024px recomendado)</Label>
            {coverImagePreview ? (
              <div className="relative border rounded-lg overflow-hidden">
                <Image
                  src={coverImagePreview}
                  alt="Preview"
                  width={1792}
                  height={1024}
                  className="w-full h-auto"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeCoverImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="cover-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload da imagem de capa
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                </label>
              </div>
            )}
          </div>

          {/* Imagens de Conteúdo */}
          <div className="space-y-2">
            <Label>Imagens de Conteúdo (até 2)</Label>
            <div className="grid grid-cols-2 gap-4">
              {contentImagePreviews.map((preview, index) => (
                <div key={index} className="relative border rounded-lg overflow-hidden">
                  <Image
                    src={preview}
                    alt={`Content ${index + 1}`}
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeContentImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {contentImages.length < 2 && (
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id={`content-upload-${contentImages.length}`}
                    accept="image/*"
                    multiple
                    onChange={handleContentImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor={`content-upload-${contentImages.length}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Upload opcional</p>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Publicar Artigo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
