'use client'

/**
 * Modal de Geração Inteligente de Conteúdo para Instagram
 * 
 * Sistema simplificado que:
 * - Gera múltiplos posts únicos e variados
 * - Interface clean com 1-2 cliques
 * - Edição individual de cada post gerado
 * - Aprovação em lote ou individual
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Wand2, 
  Copy, 
  Check, 
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Edit2,
  Trash2,
  Save,
  Calendar,
  Send
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Função para gerar ID único compatível com SSR
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

interface GeneratedPost {
  id: string
  titulo: string
  imagePrompt: string
  caption: string
  nicho: string
  tema: string
  estrategia?: string
  solucao?: string
}

interface SmartGenerateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SmartGenerateModal({ open, onOpenChange, onSuccess }: SmartGenerateModalProps) {
  // Estados de UI
  const [step, setStep] = useState<'config' | 'generated'>('config')
  const [loading, setLoading] = useState(false)
  
  // Configuração
  const [quantidade, setQuantidade] = useState<string>('3')
  const [focusArea, setFocusArea] = useState<string>('')
  const [customTheme, setCustomTheme] = useState('')
  
  // Posts gerados
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  // Edição
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedPost, setEditedPost] = useState<Partial<GeneratedPost>>({})
  
  // Upload de imagens
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set())
  const [uploadedImages, setUploadedImages] = useState<Map<string, string>>(new Map())
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set())
  
  // Publicação
  const [publishing, setPublishing] = useState(false)

  // ==================== GERAÇÃO ====================

  const handleGenerate = async () => {
    if (!quantidade || parseInt(quantidade) < 1) {
      toast.error('Escolha uma quantidade válida')
      return
    }

    setLoading(true)
    console.log('✨ [SMART-MODAL] Iniciando geração...')

    try {
      const response = await fetch('/api/instagram/smart-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantidade: parseInt(quantidade),
          focusArea: focusArea || undefined,
          customTheme: customTheme || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar posts')
      }

      if (!data.posts || data.posts.length === 0) {
        throw new Error('Nenhum post foi gerado')
      }

      // Adicionar IDs únicos
      const postsWithIds = data.posts.map((post: any) => ({
        ...post,
        id: generateId()
      }))

      setGeneratedPosts(postsWithIds)
      setSelectedIds(new Set(postsWithIds.map((p: any) => p.id))) // Todos selecionados por padrão
      setStep('generated')

      toast.success(
        `🎉 ${data.posts.length} post(s) único(s) gerado(s)!`,
        { description: data.message }
      )

      console.log('✨ [SMART-MODAL] Geração completa:', postsWithIds)

    } catch (error: any) {
      console.error('✨ [SMART-MODAL] Erro na geração:', error)
      toast.error(error.message || 'Erro ao gerar posts')
    } finally {
      setLoading(false)
    }
  }

  // ==================== SELEÇÃO ====================

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const selectAll = () => {
    setSelectedIds(new Set(generatedPosts.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  // ==================== EDIÇÃO ====================

  const startEditing = (post: GeneratedPost) => {
    setEditingId(post.id)
    setEditedPost({ ...post })
  }

  const saveEdit = () => {
    if (!editingId) return

    setGeneratedPosts(posts =>
      posts.map(p =>
        p.id === editingId ? { ...p, ...editedPost } : p
      )
    )

    setEditingId(null)
    setEditedPost({})
    toast.success('Alterações salvas')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditedPost({})
  }

  const deletePost = (id: string) => {
    setGeneratedPosts(posts => posts.filter(p => p.id !== id))
    setSelectedIds(ids => {
      const newSet = new Set(ids)
      newSet.delete(id)
      return newSet
    })
    toast.success('Post removido')
  }

  // ==================== PROMPT DE IMAGEM ====================

  const copyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt)
    setCopiedIds(new Set([...copiedIds, id]))
    
    setTimeout(() => {
      setCopiedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 2000)

    toast.success('Prompt copiado!', {
      description: 'Cole em DALL-E, Midjourney ou sua ferramenta preferida'
    })
  }

  // ==================== UPLOAD DE IMAGEM ====================

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingIds(new Set([...uploadingIds, id]))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/instagram/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload')
      }

      setUploadedImages(new Map(uploadedImages).set(id, data.imageUrl))
      toast.success('Imagem enviada!')

    } catch (error: any) {
      console.error('Upload erro:', error)
      toast.error(error.message || 'Erro ao enviar imagem')
    } finally {
      setUploadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  // ==================== PUBLICAÇÃO ====================

  const handlePublish = async (mode: 'draft' | 'schedule' | 'now') => {
    const selectedPosts = generatedPosts.filter(p => selectedIds.has(p.id))

    if (selectedPosts.length === 0) {
      toast.error('Selecione pelo menos 1 post')
      return
    }

    // Validar que todos têm imagem
    const missingImages = selectedPosts.filter(p => !uploadedImages.has(p.id))
    if (missingImages.length > 0) {
      toast.error('Envie imagens para todos os posts selecionados')
      return
    }

    setPublishing(true)

    try {
      let successCount = 0

      for (const post of selectedPosts) {
        const imageUrl = uploadedImages.get(post.id)!

        // Salvar no banco
        const { error } = await supabase
          .from('instagram_posts')
          .insert({
            nicho: post.nicho,
            titulo: post.titulo,
            caption: post.caption,
            image_url: imageUrl,
            generation_method: 'SMART_GENERATE',
            approved: mode !== 'draft',
            published: mode === 'now',
            scheduled_date: mode === 'schedule' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
          })

        if (!error) {
          successCount++
        }
      }

      if (successCount === selectedPosts.length) {
        toast.success(
          `✅ ${successCount} post(s) ${mode === 'draft' ? 'salvo(s)' : mode === 'schedule' ? 'agendado(s)' : 'publicado(s)'}!`
        )
        
        onSuccess?.()
        onOpenChange(false)
        
        // Reset
        setGeneratedPosts([])
        setSelectedIds(new Set())
        setUploadedImages(new Map())
        setStep('config')
      } else {
        throw new Error(`Apenas ${successCount} de ${selectedPosts.length} foram salvos`)
      }

    } catch (error: any) {
      console.error('Publicação erro:', error)
      toast.error(error.message || 'Erro ao publicar')
    } finally {
      setPublishing(false)
    }
  }

  // ==================== RESET ====================

  const handleClose = () => {
    if (generatedPosts.length > 0 && !confirm('Descartar posts gerados?')) {
      return
    }

    onOpenChange(false)
    
    // Reset após animação
    setTimeout(() => {
      setStep('config')
      setGeneratedPosts([])
      setSelectedIds(new Set())
      setUploadedImages(new Map())
      setQuantidade('3')
      setFocusArea('')
      setCustomTheme('')
    }, 200)
  }

  // ==================== RENDER ====================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Geração Inteligente de Conteúdo
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: CONFIGURAÇÃO */}
        {step === 'config' && (
          <div className="space-y-6 py-4">
            {/* Quantidade */}
            <div className="space-y-2">
              <Label htmlFor="quantidade" className="text-base font-semibold">
                Quantos posts gerar?
              </Label>
              <Select value={quantidade} onValueChange={setQuantidade}>
                <SelectTrigger id="quantidade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 post único</SelectItem>
                  <SelectItem value="2">2 posts</SelectItem>
                  <SelectItem value="3">3 posts (recomendado)</SelectItem>
                  <SelectItem value="5">5 posts - lote médio</SelectItem>
                  <SelectItem value="10">10 posts - lote grande</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {quantidade === '1' 
                  ? '✨ Gera 1 post único e focado' 
                  : `🚀 Gera ${quantidade} posts variados em lote`
                }
              </p>
            </div>

            {/* Foco (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="focus" className="text-base font-semibold">
                Área de foco (opcional)
              </Label>
              <Select value={focusArea} onValueChange={setFocusArea}>
                <SelectTrigger id="focus">
                  <SelectValue placeholder="Todas as áreas (mais variado)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as áreas (mais variado)</SelectItem>
                  <SelectItem value="saude">Saúde (clínicas, consultórios)</SelectItem>
                  <SelectItem value="juridico">Jurídico (advocacia)</SelectItem>
                  <SelectItem value="varejo">Varejo (lojas, e-commerce)</SelectItem>
                  <SelectItem value="alimentacao">Alimentação (restaurantes)</SelectItem>
                  <SelectItem value="beleza">Beleza (salões, estética)</SelectItem>
                  <SelectItem value="fitness">Fitness (academias)</SelectItem>
                  <SelectItem value="educacao">Educação (escolas, cursos)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Deixe em branco para maior variedade automática
              </p>
            </div>

            {/* Tema customizado (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="custom" className="text-base font-semibold">
                Tema customizado (opcional)
              </Label>
              <Input
                id="custom"
                placeholder="Ex: Como automatizar atendimento no WhatsApp"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                A IA vai incluir esse tema junto com outros únicos
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                🧠 IA analisa posts recentes e gera conteúdo único e variado
              </p>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                size="lg"
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Wand2 className="h-5 w-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Gerar Posts Inteligentes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: POSTS GERADOS */}
        {step === 'generated' && (
          <div className="space-y-4 py-4">
            {/* Header com ações em lote */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold">
                  {selectedIds.size} de {generatedPosts.length} selecionado(s)
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Selecionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Limpar Seleção
                </Button>
              </div>
            </div>

            {/* Lista de posts */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {generatedPosts.map((post) => {
                const isEditing = editingId === post.id
                const isSelected = selectedIds.has(post.id)
                const hasImage = uploadedImages.has(post.id)
                const isUploading = uploadingIds.has(post.id)
                const isCopied = copiedIds.has(post.id)

                return (
                  <div
                    key={post.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected ? 'border-purple-500 bg-purple-50/50' : 'border-gray-200'
                    }`}
                  >
                    {/* Header do post */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(post.id)}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="flex-1">
                          {isEditing ? (
                            <Input
                              value={editedPost.titulo || post.titulo}
                              onChange={(e) =>
                                setEditedPost({ ...editedPost, titulo: e.target.value })
                              }
                              className="font-semibold text-lg mb-2"
                            />
                          ) : (
                            <h3 className="font-semibold text-lg">{post.titulo}</h3>
                          )}
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{post.nicho}</Badge>
                            {post.estrategia && (
                              <Badge variant="secondary">{post.estrategia}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-1">
                        {!isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(post)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="default" size="sm" onClick={saveEdit}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEdit}>
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Prompt de Imagem */}
                    <div className="mb-3 p-3 bg-gray-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Prompt para Imagem
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPrompt(post.id, post.imagePrompt)}
                        >
                          {isCopied ? (
                            <><Check className="h-4 w-4 text-green-500" /> Copiado!</>
                          ) : (
                            <><Copy className="h-4 w-4" /> Copiar</>
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {post.imagePrompt}
                      </p>
                    </div>

                    {/* Upload de Imagem */}
                    <div className="mb-3">
                      {hasImage ? (
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium">Imagem enviada</span>
                          <img
                            src={uploadedImages.get(post.id)}
                            alt="Preview"
                            className="h-12 w-12 rounded object-cover ml-auto"
                          />
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50 transition-colors">
                          <Upload className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {isUploading ? 'Enviando...' : 'Enviar Imagem Gerada'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(post.id, file)
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Caption */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Legenda</Label>
                      {isEditing ? (
                        <Textarea
                          value={editedPost.caption || post.caption}
                          onChange={(e) =>
                            setEditedPost({ ...editedPost, caption: e.target.value })
                          }
                          rows={6}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                          {post.caption}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer com ações finais */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('config')}>
                ← Gerar Mais
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePublish('draft')}
                  disabled={publishing || selectedIds.size === 0}
                >
                  Salvar Rascunhos
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handlePublish('schedule')}
                  disabled={publishing || selectedIds.size === 0}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Agendar Selecionados
                </Button>
                <Button
                  onClick={() => handlePublish('now')}
                  disabled={publishing || selectedIds.size === 0}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publicar Agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
