'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon, Info, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface StructuredPostEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function StructuredPostEditor({ isOpen, onClose, onSave }: StructuredPostEditorProps) {
  // Dados básicos
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('Desenvolvimento')
  const [tags, setTags] = useState('')
  const [highlight, setHighlight] = useState('')
  
  // Conteúdo estruturado em seções
  const [introduction, setIntroduction] = useState('')
  const [middleContent, setMiddleContent] = useState('')
  const [finalContent, setFinalContent] = useState('')
  
  // Imagens
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImagePreview, setCoverImagePreview] = useState('')
  const [image1Url, setImage1Url] = useState('')
  const [image1Preview, setImage1Preview] = useState('')
  const [image2Url, setImage2Url] = useState('')
  const [image2Preview, setImage2Preview] = useState('')
  
  const [saving, setSaving] = useState(false)

  const handleImageUpload = async (file: File, type: 'cover' | 'image1' | 'image2') => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB')
      return
    }

    // Preview local
    const reader = new FileReader()
    reader.onloadend = () => {
      const preview = reader.result as string
      if (type === 'cover') setCoverImagePreview(preview)
      else if (type === 'image1') setImage1Preview(preview)
      else setImage2Preview(preview)
    }
    reader.readAsDataURL(file)

    // Upload para servidor
    toast.loading(`Enviando ${type === 'cover' ? 'capa' : type === 'image1' ? 'imagem 1' : 'imagem 2'}...`, { id: `upload-${type}` })
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('slug', `${type}-${Date.now()}`)

      const uploadRes = await fetch('/api/blog/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json()
        const url = uploadData.imageUrl || uploadData.url
        if (url) {
          if (type === 'cover') setCoverImageUrl(url)
          else if (type === 'image1') setImage1Url(url)
          else setImage2Url(url)
          toast.success(`✅ ${type === 'cover' ? 'Capa' : type === 'image1' ? 'Imagem 1' : 'Imagem 2'} enviada!`, { id: `upload-${type}` })
        }
      } else {
        toast.error(`Erro ao enviar ${type}`, { id: `upload-${type}` })
      }
    } catch (error) {
      toast.error(`Erro ao enviar ${type}`, { id: `upload-${type}` })
    }
  }

  const removeImage = (type: 'cover' | 'image1' | 'image2') => {
    if (type === 'cover') {
      setCoverImageUrl('')
      setCoverImagePreview('')
    } else if (type === 'image1') {
      setImage1Url('')
      setImage1Preview('')
    } else {
      setImage2Url('')
      setImage2Preview('')
    }
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
    if (!coverImageUrl) {
      toast.error('Imagem de capa é obrigatória')
      return
    }
    if (!highlight.trim()) {
      toast.error('Texto em destaque é obrigatório')
      return
    }
    if (!introduction.trim()) {
      toast.error('Introdução é obrigatória')
      return
    }
    if (!image1Url) {
      toast.error('Imagem 1 é obrigatória')
      return
    }
    if (!middleContent.trim()) {
      toast.error('Texto do meio é obrigatório')
      return
    }
    if (!image2Url) {
      toast.error('Imagem 2 é obrigatória')
      return
    }
    if (!finalContent.trim()) {
      toast.error('Conteúdo final é obrigatório')
      return
    }

    setSaving(true)
    toast.loading('Salvando artigo estruturado...', { id: 'save-structured' })

    try {
      // Montar conteúdo markdown estruturado de forma proporcional
      // Layout: Introdução (30%) → Imagem 1 + Texto do Meio (40%) → Imagem 2 → Final (30%)
      const fullContent = `${introduction.trim()}

![Imagem 1](${image1Url})

${middleContent.trim()}

![Imagem 2](${image2Url})

${finalContent.trim()}`

      const postData = {
        title: title.trim(),
        category: category,
        excerpt: excerpt.trim(),
        content: fullContent,
        coverImageUrl: coverImageUrl,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        highlight: highlight.trim(),
      }

      console.log('[Structured Post Editor] Sending postData:', JSON.stringify(postData, null, 2))

      const saveRes = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      })

      if (!saveRes.ok) {
        const errorData = await saveRes.json()
        throw new Error(errorData.error || 'Falha ao salvar post')
      }

      toast.success('✅ Artigo publicado com sucesso!', { id: 'save-structured' })
      
      // Limpar formulário
      setTitle('')
      setExcerpt('')
      setCategory('Desenvolvimento')
      setTags('')
      setHighlight('')
      setIntroduction('')
      setMiddleContent('')
      setFinalContent('')
      setCoverImageUrl('')
      setCoverImagePreview('')
      setImage1Url('')
      setImage1Preview('')
      setImage2Url('')
      setImage2Preview('')
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving structured post:', error)
      toast.error('Erro ao salvar artigo', { id: 'save-structured' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Editor Estruturado de Artigos
          </DialogTitle>
          <DialogDescription>
            Preencha cada seção do template. O layout será aplicado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* SEÇÃO 1: Informações Básicas */}
          <div className="border-l-4 border-blue-500 pl-4 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              📋 1. Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Artigo *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Como criar um chatbot com IA que entende seus clientes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">{title.length}/200 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="Desenvolvimento">Desenvolvimento</option>
                  <option value="Design">Design</option>
                  <option value="IA">IA</option>
                  <option value="Automação">Automação</option>
                  <option value="Negócios">Negócios</option>
                  <option value="Gatinhos">Gatinhos</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo para Cards * (Aparece nos cards da home)</Label>
              <Textarea
                id="excerpt"
                placeholder="Breve resumo que aparecerá nos cards de preview do artigo na página inicial. Ex: 'Descubra como criar chatbots inteligentes que realmente entendem seus clientes...'"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{excerpt.length}/200 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                placeholder="Ex: chatbot, IA, automação, negócios"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlight">💡 Texto em Destaque * (Aparece na caixa colorida do topo)</Label>
              <Textarea
                id="highlight"
                placeholder="Frase impactante de 1-2 linhas. Ex: 'Chatbots com IA aumentam em 40% a satisfação do cliente e reduzem custos operacionais'"
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                rows={2}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">{highlight.length}/300 caracteres</p>
            </div>
          </div>

          {/* SEÇÃO 2: Imagem de Capa */}
          <div className="border-l-4 border-purple-500 pl-4 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              🖼️ 2. Imagem de Capa * (1920x1080px)
            </h3>
            
            {coverImagePreview ? (
              <div className="relative border rounded-lg overflow-hidden max-w-2xl">
                <Image
                  src={coverImagePreview}
                  alt="Capa"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage('cover')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center max-w-2xl">
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                  className="hidden"
                />
                <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Clique para fazer upload da imagem de capa</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG até 5MB | 1920x1080px recomendado</p>
                </label>
              </div>
            )}
          </div>

          {/* SEÇÃO 3: Introdução */}
          <div className="border-l-4 border-green-500 pl-4 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              📝 3. Introdução * (Parágrafos 1-3)
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Esta seção aparece ao lado da caixa "💡 Destaque" no topo do artigo.
                  Escreva 2-3 parágrafos apresentando o tema.
                </span>
              </p>
            </div>
            <Textarea
              placeholder="Escreva a introdução do artigo aqui. Use Markdown se quiser:

## Introdução

Nos últimos anos, os chatbots com IA...

Este artigo mostra como criar...

Vamos explorar desde..."
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">{introduction.length} caracteres</p>
          </div>

          {/* SEÇÃO 4: Imagem 1 */}
          <div className="border-l-4 border-orange-500 pl-4 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              🖼️ 4. Imagem 1 * (1200x800px)
            </h3>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Aparece ao lado do "Texto do Meio" na primeira seção visual do artigo.
              </p>
            </div>
            
            {image1Preview ? (
              <div className="relative border rounded-lg overflow-hidden max-w-xl">
                <Image
                  src={image1Preview}
                  alt="Imagem 1"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage('image1')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center max-w-xl">
                <input
                  type="file"
                  id="image1-upload"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'image1')}
                  className="hidden"
                />
                <label htmlFor="image1-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload da Imagem 1</p>
                  <p className="text-xs text-muted-foreground">1200x800px recomendado</p>
                </label>
              </div>
            )}
          </div>

          {/* SEÇÃO 5: Texto do Meio */}
          <div className="border-l-4 border-pink-500 pl-4 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              📝 5. Texto do Meio * (Parágrafos 4-6)
            </h3>
            <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg border border-pink-200 dark:border-pink-800">
              <p className="text-sm text-pink-800 dark:text-pink-300">
                Aparece ao lado da Imagem 1. Desenvolva o tema com 2-3 parágrafos.
              </p>
            </div>
            <Textarea
              placeholder="Continue desenvolvendo o tema aqui...

## 1. Primeira seção

Texto explicando o primeiro tópico...

Detalhes adicionais..."
              value={middleContent}
              onChange={(e) => setMiddleContent(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">{middleContent.length} caracteres</p>
          </div>

          {/* SEÇÃO 6: Imagem 2 */}
          <div className="border-l-4 border-indigo-500 pl-4 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              🖼️ 6. Imagem 2 * (1200x800px)
            </h3>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                Aparece centralizada <strong>DEPOIS</strong> de todo o "Texto do Meio" ser apresentado, antes do conteúdo final.
              </p>
            </div>
            
            {image2Preview ? (
              <div className="relative border rounded-lg overflow-hidden max-w-xl">
                <Image
                  src={image2Preview}
                  alt="Imagem 2"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage('image2')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center max-w-xl">
                <input
                  type="file"
                  id="image2-upload"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'image2')}
                  className="hidden"
                />
                <label htmlFor="image2-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload da Imagem 2</p>
                  <p className="text-xs text-muted-foreground">1200x800px recomendado</p>
                </label>
              </div>
            )}
          </div>

          {/* SEÇÃO 7: Conteúdo Final */}
          <div className="border-l-4 border-teal-500 pl-4 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              📝 7. Conteúdo Final * (Restante + Conclusão)
            </h3>
            <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg border border-teal-200 dark:border-teal-800">
              <p className="text-sm text-teal-800 dark:text-teal-300">
                Seção centralizada no final do artigo. Inclua as seções finais e a conclusão.
              </p>
            </div>
            <Textarea
              placeholder="Finalize o artigo aqui...

## 3. Testando e aprimorando

Texto sobre testes...

## Conclusão

Resumo final e call-to-action..."
              value={finalContent}
              onChange={(e) => setFinalContent(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">{finalContent.length} caracteres</p>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              Todos os campos marcados com * são obrigatórios
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? 'Salvando...' : '✨ Publicar Artigo Estruturado'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
