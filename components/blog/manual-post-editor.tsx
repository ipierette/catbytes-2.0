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
  const [highlight, setHighlight] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  const [coverImageUrl, setCoverImageUrl] = useState<string>('')
  const [contentImages, setContentImages] = useState<File[]>([])
  const [contentImagePreviews, setContentImagePreviews] = useState<string[]>([])
  const [contentImageUrls, setContentImageUrls] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Upload imediato para obter URL
      toast.loading('Fazendo upload da capa...', { id: 'cover-upload' })
      try {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('slug', `cover-${Date.now()}`)

        const uploadRes = await fetch('/api/blog/upload-image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          const url = uploadData.imageUrl || uploadData.url
          if (url) {
            setCoverImageUrl(url)
            toast.success('✅ Capa enviada!', { id: 'cover-upload' })
          }
        } else {
          toast.error('Erro ao enviar capa', { id: 'cover-upload' })
        }
      } catch (error) {
        toast.error('Erro ao enviar capa', { id: 'cover-upload' })
      }
    }
  }

  const handleContentImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (contentImages.length + files.length > 2) {
      toast.error('Máximo de 2 imagens de conteúdo')
      return
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} excede 5MB`)
        continue
      }

      // Preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setContentImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)

      // Upload imediato para obter URL
      toast.loading(`Enviando ${file.name}...`, { id: `upload-${file.name}` })
      try {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('slug', `content-${Date.now()}-${contentImages.length}`)

        const uploadRes = await fetch('/api/blog/upload-image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          const url = uploadData.imageUrl || uploadData.url
          if (url) {
            setContentImageUrls(prev => [...prev, url])
            toast.success(`✅ ${file.name} enviada!`, { id: `upload-${file.name}` })
          }
        } else {
          toast.error(`Erro ao enviar ${file.name}`, { id: `upload-${file.name}` })
        }
      } catch (error) {
        toast.error(`Erro ao enviar ${file.name}`, { id: `upload-${file.name}` })
      }

      setContentImages(prev => [...prev, file])
    }
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
    if (title.trim().length < 10) {
      toast.error('Título deve ter no mínimo 10 caracteres')
      return
    }
    if (title.trim().length > 200) {
      toast.error('Título deve ter no máximo 200 caracteres')
      return
    }
    if (!excerpt.trim()) {
      toast.error('Resumo é obrigatório')
      return
    }
    if (excerpt.trim().length < 50) {
      toast.error('Resumo deve ter no mínimo 50 caracteres')
      return
    }
    if (!content.trim()) {
      toast.error('Conteúdo é obrigatório')
      return
    }
    if (content.trim().length < 100) {
      toast.error('Conteúdo deve ter no mínimo 100 caracteres')
      return
    }
    if (!coverImageUrl) {
      toast.error('Imagem de capa é obrigatória. Aguarde o upload concluir.')
      return
    }

    setSaving(true)
    toast.loading('Salvando artigo...', { id: 'save-manual' })

    try {
      // Criar post (imagens já foram enviadas)
      const postData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImageUrl: coverImageUrl,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        highlight: highlight.trim() || null,
      }

      console.log('[Manual Post Editor] Sending postData:', JSON.stringify(postData, null, 2))

      const saveRes = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      })

      console.log('[Manual Post Editor] Response status:', saveRes.status)
      
      if (!saveRes.ok) {
        const errorData = await saveRes.json()
        console.error('[Manual Post Editor] Error response:', errorData)
        throw new Error(errorData.error || 'Falha ao salvar post')
      }

      toast.success('✅ Artigo publicado com sucesso!', { id: 'save-manual' })
      
      // Limpar formulário
      setTitle('')
      setExcerpt('')
      setContent('')
      setTags('')
      setHighlight('')
      setCoverImage(null)
      setCoverImagePreview('')
      setCoverImageUrl('')
      setContentImages([])
      setContentImagePreviews([])
      setContentImageUrls([])
      
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✍️ Escrever Artigo Manual</DialogTitle>
          <DialogDescription>
            Crie um artigo do zero com suas próprias imagens
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Coluna Esquerda - Conteúdo */}
          <div className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título * (mín. 10 caracteres)</Label>
              <Input
                id="title"
                placeholder="Ex: Como criar um chatbot com IA"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className={title.length > 0 && title.length < 10 ? 'border-red-500' : ''}
              />
              <p className={`text-xs ${title.length < 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {title.length}/200 caracteres {title.length < 10 && title.length > 0 ? `(faltam ${10 - title.length})` : ''}
              </p>
            </div>

            {/* Resumo */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo * (mín. 50 caracteres)</Label>
              <Textarea
                id="excerpt"
                placeholder="Breve descrição do artigo que aparecerá nas prévias"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                maxLength={200}
                className={excerpt.length > 0 && excerpt.length < 50 ? 'border-red-500' : ''}
              />
              <p className={`text-xs ${excerpt.length < 50 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {excerpt.length}/200 caracteres {excerpt.length < 50 && excerpt.length > 0 ? `(faltam ${50 - excerpt.length})` : ''}
              </p>
            </div>

            {/* Texto de Destaque (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="highlight">
                💡 Texto de Destaque (Opcional - Aparece nas caixas coloridas)
              </Label>
              <Textarea
                id="highlight"
                placeholder="Texto curto e impactante que aparecerá destacado nas caixas laterais do artigo. Ex: 'A automação com IA pode reduzir custos em até 70%'"
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                rows={3}
                maxLength={300}
                className={highlight.length > 300 ? 'border-red-500' : ''}
              />
              <p className={`text-xs ${highlight.length > 300 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {highlight.length}/300 caracteres
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

            {/* Conteúdo */}
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo * (Markdown suportado, mín. 100 caracteres)</Label>
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
                rows={16}
                className={`font-mono text-sm ${content.length > 0 && content.length < 100 ? 'border-red-500' : ''}`}
              />
              <p className={`text-xs ${content.length < 100 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {content.length} caracteres {content.length < 100 && content.length > 0 ? `(mínimo: 100)` : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                Use Markdown: ## para títulos, **negrito**, *itálico*, - listas
              </p>
            </div>
          </div>

          {/* Coluna Direita - Imagens */}
          <div className="space-y-6">
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
              <Label>Imagens de Conteúdo (opcional, até 2)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                URLs geradas: {contentImageUrls.length > 0 ? contentImageUrls.map((url, i) => `Imagem ${i + 1}`).join(', ') : 'Nenhuma ainda'}
              </p>
              <div className="grid grid-cols-2 gap-3">
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
                    {contentImageUrls[index] && (
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1 rounded truncate">
                        ✓ URL disponível
                      </div>
                    )}
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
              {contentImageUrls.length > 0 && (
                <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                      📎 {contentImageUrls.length} {contentImageUrls.length === 1 ? 'imagem pronta' : 'imagens prontas'} para usar
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Clique para inserir no conteúdo acima ⬆️
                  </p>
                  {contentImageUrls.map((url, index) => (
                    <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          🖼️ Imagem {index + 1}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-700"
                            onClick={() => {
                              const markdown = `![Imagem ${index + 1}](${url})`
                              setContent(prev => prev + '\n\n' + markdown + '\n\n')
                              toast.success('Imagem inserida no conteúdo!')
                            }}
                          >
                            ➕ Inserir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(`![Imagem ${index + 1}](${url})`)
                              toast.success('Markdown copiado!')
                            }}
                          >
                            📋
                          </Button>
                        </div>
                      </div>
                      <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded block truncate text-gray-600 dark:text-gray-400" title={url}>
                        {url}
                      </code>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 <strong>Dica:</strong> Posicione o cursor onde quer a imagem e clique "Inserir"
                    </p>
                  </div>
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
