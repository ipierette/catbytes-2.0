'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon, Info, Sparkles, Plus, Minus, HelpCircle } from 'lucide-react'
import Image from 'next/image'
import type { BlogPost } from '@/types/blog'

interface StructuredPostEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editingPost?: BlogPost | null
}

export function StructuredPostEditor({ isOpen, onClose, onSave, editingPost }: StructuredPostEditorProps) {
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
  
  // FAQ estruturado
  const [faqItems, setFaqItems] = useState<{question: string, answer: string}[]>([])
  
  // Imagens
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImagePreview, setCoverImagePreview] = useState('')
  const [image1Url, setImage1Url] = useState('')
  const [image1Preview, setImage1Preview] = useState('')
  const [image2Url, setImage2Url] = useState('')
  const [image2Preview, setImage2Preview] = useState('')
  
  // Agendamento
  const [scheduleForLater, setScheduleForLater] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  
  // Modo de salvamento
  const [saveAsDraft, setSaveAsDraft] = useState(false)
  
  const [saving, setSaving] = useState(false)

  // Preenche os campos quando estiver editando um post
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '')
      setExcerpt(editingPost.excerpt || '')
      setCategory(editingPost.category || 'Desenvolvimento')
      setTags(editingPost.tags?.join(', ') || '')
      setHighlight(editingPost.highlight || '')
      setCoverImageUrl(editingPost.cover_image_url || '')
      setCoverImagePreview(editingPost.cover_image_url || '')
      
      // Parse do conteúdo em seções
      const content = editingPost.content || ''
      const sections = content.split(/\n## /)
      
      if (sections.length > 0) {
        setIntroduction(sections[0].replace(/^## /, ''))
      }
      if (sections.length > 1) {
        setMiddleContent(sections[1].replace(/^## /, ''))
      }
      if (sections.length > 2) {
        setFinalContent(sections[2].replace(/^## /, ''))
      }
      
      // Se tiver scheduled_at, preenche os campos de agendamento
      if (editingPost.scheduled_at) {
        const scheduledDate = new Date(editingPost.scheduled_at)
        setScheduleForLater(true)
        setScheduledDate(scheduledDate.toISOString().split('T')[0])
        setScheduledTime(scheduledDate.toTimeString().slice(0, 5))
      }
      
      // Define status baseado no post
      setSaveAsDraft(editingPost.status === 'draft')
    } else {
      // Limpa os campos ao fechar/abrir novo
      resetForm()
    }
  }, [editingPost, isOpen])

  const resetForm = () => {
    setTitle('')
    setExcerpt('')
    setCategory('Desenvolvimento')
    setTags('')
    setHighlight('')
    setIntroduction('')
    setMiddleContent('')
    setFinalContent('')
    setFaqItems([])
    setCoverImageUrl('')
    setCoverImagePreview('')
    setImage1Url('')
    setImage1Preview('')
    setImage2Url('')
    setImage2Preview('')
    setScheduleForLater(false)
    setScheduledDate('')
    setScheduledTime('')
    setSaveAsDraft(false)
  }

  const addFaqItem = () => {
    setFaqItems(prev => [...prev, { question: '', answer: '' }])
  }

  const removeFaqItem = (index: number) => {
    setFaqItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const generateFaqMarkdown = () => {
    if (faqItems.length === 0) return ''
    
    const validItems = faqItems.filter(item => item.question.trim() && item.answer.trim())
    if (validItems.length === 0) return ''
    
    let faqMarkdown = '\n\n## Perguntas Frequentes\n\n'
    validItems.forEach((item, index) => {
      faqMarkdown += `### ${index + 1}. ${item.question}\n\n${item.answer}\n\n`
    })
    return faqMarkdown
  }

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
      // Layout: Introdução (30%) → Imagem 1 + Texto do Meio (40%) → Imagem 2 → Final (30%) → FAQ
      const faqMarkdown = generateFaqMarkdown()
      const fullContent = `${introduction.trim()}

![Imagem 1](${image1Url})

${middleContent.trim()}

![Imagem 2](${image2Url})

${finalContent.trim()}${faqMarkdown}`

      const postData = {
        title: title.trim(),
        category: category,
        excerpt: excerpt.trim(),
        content: fullContent,
        coverImageUrl: coverImageUrl,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        highlight: highlight.trim(),
        saveAsDraft,
        scheduleForLater: saveAsDraft ? false : scheduleForLater, // Se é rascunho, não pode ser agendado
        scheduledDate: scheduleForLater && !saveAsDraft ? scheduledDate : null,
        scheduledTime: scheduleForLater && !saveAsDraft ? scheduledTime : null,
      }

      console.log('[Structured Post Editor] Sending postData:', JSON.stringify(postData, null, 2))

      // Se está editando, usa PUT, senão POST
      const isEditing = !!editingPost
      const url = isEditing 
        ? `/api/admin/blog/posts?id=${editingPost.id}`
        : '/api/admin/blog/posts'
      
      const saveRes = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(postData),
      })

      if (!saveRes.ok) {
        const errorData = await saveRes.json()
        throw new Error(errorData.error || 'Falha ao salvar post')
      }

      toast.success(
        isEditing
          ? '✅ Artigo atualizado com sucesso!'
          : saveAsDraft 
          ? '✅ Rascunho salvo! Você pode visualizá-lo e publicá-lo depois.' 
          : scheduleForLater
          ? '✅ Artigo agendado com sucesso!'
          : '✅ Artigo publicado com sucesso!', 
        { id: 'save-structured' }
      )
      
      // Limpar formulário
      resetForm()
      
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
            {editingPost ? 'Editar Artigo' : 'Editor Manual de Artigos'}
          </DialogTitle>
          <DialogDescription>
            {editingPost 
              ? 'Faça as alterações necessárias no artigo.' 
              : 'Preencha cada seção do template. O layout será aplicado automaticamente.'}
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

          {/* SEÇÃO 8: FAQ (Opcional) */}
          <div className="border-l-4 border-yellow-500 pl-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-yellow-500" />
                8. FAQ - Perguntas Frequentes (Opcional)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaqItem}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Pergunta
              </Button>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  Adicione perguntas e respostas que os leitores podem ter sobre o tema. 
                  Esta seção aparecerá com estilo especial no final do artigo.
                </span>
              </p>
            </div>

            {faqItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-lg">
                <HelpCircle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma pergunta adicionada ainda</p>
                <p className="text-xs text-muted-foreground">Clique em "Adicionar Pergunta" para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-yellow-800 dark:text-yellow-300">
                        Pergunta {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaqItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`faq-question-${index}`}>Pergunta</Label>
                      <Input
                        id={`faq-question-${index}`}
                        placeholder="Ex: Como posso integrar um chatbot no meu site?"
                        value={item.question}
                        onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                        className="font-medium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`faq-answer-${index}`}>Resposta</Label>
                      <Textarea
                        id={`faq-answer-${index}`}
                        placeholder="Escreva a resposta detalhada aqui. Pode usar Markdown se quiser."
                        value={item.answer}
                        onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {faqItems.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✅ {faqItems.filter(item => item.question.trim() && item.answer.trim()).length} perguntas válidas serão incluídas no artigo
                </p>
              </div>
            )}
          </div>

          {/* SEÇÃO 8: Opções de Publicação */}
          <div className="border-l-4 border-purple-500 pl-4 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              🚀 8. Opções de Publicação
            </h3>
            
            <div className="space-y-4">
              {/* Opção: Salvar como Rascunho */}
              <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="radio"
                  id="saveAsDraft"
                  name="publishOption"
                  checked={saveAsDraft}
                  onChange={(e) => {
                    setSaveAsDraft(e.target.checked)
                    if (e.target.checked) setScheduleForLater(false)
                  }}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <Label htmlFor="saveAsDraft" className="cursor-pointer font-semibold">
                    💾 Salvar como Rascunho
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    O artigo será salvo mas <strong>não será publicado</strong>. Você poderá visualizá-lo e publicá-lo depois. 
                    Não envia newsletter nem cria posts sociais.
                  </p>
                </div>
              </div>

              {/* Opção: Agendar Publicação */}
              <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="radio"
                  id="scheduleForLater"
                  name="publishOption"
                  checked={scheduleForLater && !saveAsDraft}
                  onChange={(e) => {
                    setScheduleForLater(e.target.checked)
                    if (e.target.checked) setSaveAsDraft(false)
                  }}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <Label htmlFor="scheduleForLater" className="cursor-pointer font-semibold">
                    📅 Agendar Publicação
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Escolha data e hora para publicação automática. Newsletter e posts sociais serão criados no horário agendado.
                  </p>
                </div>
              </div>

              {/* Opção: Publicar Agora */}
              <div className="flex items-start space-x-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="radio"
                  id="publishNow"
                  name="publishOption"
                  checked={!saveAsDraft && !scheduleForLater}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSaveAsDraft(false)
                      setScheduleForLater(false)
                    }
                  }}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <Label htmlFor="publishNow" className="cursor-pointer font-semibold">
                    ✨ Publicar Imediatamente
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    O artigo será publicado agora. Newsletter será enviada e posts sociais serão criados automaticamente.
                  </p>
                </div>
              </div>

              {/* Campos de Agendamento (aparecem apenas se agendar estiver selecionado) */}
              {scheduleForLater && !saveAsDraft && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Data de Publicação</Label>
                    <Input
                      type="date"
                      id="scheduledDate"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Horário de Publicação</Label>
                    <Input
                      type="time"
                      id="scheduledTime"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      ℹ️ Se a data coincidir com uma geração automática, o cron job será interrompido automaticamente.
                    </p>
                  </div>
                </div>
              )}
            </div>
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
                {saving 
                  ? 'Salvando...' 
                  : editingPost 
                  ? '💾 Atualizar Artigo'
                  : saveAsDraft 
                  ? '💾 Salvar Rascunho' 
                  : scheduleForLater 
                  ? '📅 Agendar Artigo' 
                  : '✨ Publicar Agora'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
