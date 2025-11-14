'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Send, Image as ImageIcon, RefreshCw, ExternalLink, Calendar, Upload } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { ScheduleLinkedInModal } from '@/components/admin/schedule-linkedin-modal'
import Image from 'next/image'

interface BlogArticle {
  title: string
  slug: string
  excerpt: string
  created_at: string
}

interface LinkedInPost {
  id: string
  text: string
  image_url: string | null
  status: 'draft' | 'pending' | 'approved' | 'published' | 'failed'
  scheduled_for: string | null
  published_at: string | null
  post_type: string
  article_slug: string | null
  as_organization: boolean
  created_at: string
}

export default function LinkedInAdminPage() {
  const { showToast } = useToast()
  
  // Estado
  const [postType, setPostType] = useState<'blog-article' | 'fullstack-random'>('fullstack-random')
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [selectedArticle, setSelectedArticle] = useState<string>('')
  const [postText, setPostText] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [asOrganization, setAsOrganization] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  
  // Posts salvos
  const [savedPosts, setSavedPosts] = useState<LinkedInPost[]>([])
  const [loadingSavedPosts, setLoadingSavedPosts] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null) // ID do post carregado para descartar após publicação
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'approved' | 'published'>('all')
  
  // Loading states
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  // Buscar artigos do blog
  useEffect(() => {
    if (postType === 'blog-article') {
      fetchArticles()
    }
  }, [postType])

  // Carregar posts salvos ao iniciar
  useEffect(() => {
    loadSavedPosts()
  }, [])

  const loadSavedPosts = async () => {
    setLoadingSavedPosts(true)
    try {
      const response = await fetch('/api/linkedin/posts')
      if (!response.ok) throw new Error('Erro ao buscar posts salvos')
      
      const data = await response.json()
      setSavedPosts(data.posts || [])
    } catch (error) {
      console.error('Erro ao buscar posts salvos:', error)
    } finally {
      setLoadingSavedPosts(false)
    }
  }

  const fetchArticles = async () => {
    setLoadingArticles(true)
    try {
      const response = await fetch('/api/blog/posts?status=published&limit=50')
      if (!response.ok) throw new Error('Erro ao buscar artigos')
      
      const data = await response.json()
      setArticles(data.posts || [])
    } catch (error) {
      showToast('Não foi possível carregar os artigos', 'error')
    } finally {
      setLoadingArticles(false)
    }
  }

  // Gerar conteúdo do post
  const handleGenerate = async () => {
    if (postType === 'blog-article' && !selectedArticle) {
      showToast('Selecione um artigo do blog', 'error')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/linkedin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: postType,
          articleSlug: postType === 'blog-article' ? selectedArticle : undefined
        })
      })

      if (!response.ok) throw new Error('Erro ao gerar post')

      const data = await response.json()
      setPostText(data.postText)
      setImagePrompt(data.imagePrompt)
      // NÃO gerar imagem automaticamente
      setImageUrl('')

      showToast('✨ Post gerado! Clique em "Gerar Imagem" se desejar adicionar uma imagem.', 'success')
    } catch (error) {
      showToast('Não foi possível gerar o post', 'error')
    } finally {
      setGenerating(false)
    }
  }

  // Upload de imagem externa
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem', 'error')
      return
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Imagem muito grande. Máximo 10MB', 'error')
      return
    }

    setUploadingFile(true)
    try {
      // Fazer upload para o Supabase Storage
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
      setImageUrl(data.url)
      setSelectedFile(file)

      showToast('✅ Imagem enviada com sucesso!', 'success')
    } catch (error) {
      showToast('Erro ao fazer upload da imagem', 'error')
    } finally {
      setUploadingFile(false)
    }
  }

  // Gerar imagem com DALL-E
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      showToast('Prompt de imagem está vazio', 'error')
      return
    }

    setGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: '1024x1024'
        })
      })

      if (!response.ok) throw new Error('Erro ao gerar imagem')

      const data = await response.json()
      setImageUrl(data.url)

      showToast('🎨 Imagem gerada! Pronta para publicação', 'success')
    } catch (error) {
      showToast('Não foi possível gerar a imagem', 'error')
    } finally {
      setGeneratingImage(false)
    }
  }

  // Carregar post salvo
  const handleLoadPost = (post: LinkedInPost) => {
    setPostText(post.text)
    setImageUrl(post.image_url || '')
    setAsOrganization(post.as_organization)
    setPostType(post.post_type as 'blog-article' | 'fullstack-random')
    setLoadedPostId(post.id) // Salvar ID para descartar após publicação
    if (post.article_slug) {
      setSelectedArticle(post.article_slug)
    }
    showToast('Post carregado! Você pode editá-lo ou publicá-lo', 'success')
  }

  // Deletar post salvo
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return

    setDeletingPostId(postId)
    try {
      const response = await fetch(`/api/linkedin/posts?id=${postId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao deletar post')

      showToast('Post deletado com sucesso', 'success')
      loadSavedPosts()
    } catch (error) {
      showToast('Não foi possível deletar o post', 'error')
    } finally {
      setDeletingPostId(null)
    }
  }

  return (
    <AdminGuard>
    <AdminLayoutWrapper>
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Posts</h1>
          <p className="text-muted-foreground mt-1">
            Gere e publique posts profissionais no LinkedIn
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {asOrganization ? '🏢 Como Página' : '👤 Como Perfil'}
        </Badge>
      </div>

      {/* Posts Salvos */}
      {savedPosts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>📝 Posts Salvos ({savedPosts.filter(p => filterStatus === 'all' || p.status === filterStatus).length})</CardTitle>
                <CardDescription>
                  Reutilize posts sem gastar créditos de API
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {/* Filtros de Status */}
                <div className="flex gap-1">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    Todos ({savedPosts.length})
                  </Button>
                  <Button
                    variant={filterStatus === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('draft')}
                  >
                    Rascunhos ({savedPosts.filter(p => p.status === 'draft').length})
                  </Button>
                  <Button
                    variant={filterStatus === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('approved')}
                  >
                    Agendados ({savedPosts.filter(p => p.status === 'approved').length})
                  </Button>
                  <Button
                    variant={filterStatus === 'published' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('published')}
                  >
                    Publicados ({savedPosts.filter(p => p.status === 'published').length})
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSavedPosts}
                  disabled={loadingSavedPosts}
                >
                  {loadingSavedPosts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {savedPosts
                .filter(p => filterStatus === 'all' || p.status === filterStatus)
                .map((post) => (
                <div
                  key={post.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant={
                          post.status === 'published' ? 'default' :
                          post.status === 'approved' ? 'secondary' :
                          post.status === 'failed' ? 'destructive' : 'outline'
                        }>
                          {post.status === 'published' ? '✓ Publicado' :
                           post.status === 'approved' ? '⏰ Agendado' :
                           post.status === 'failed' ? '✗ Falhou' : '📝 Rascunho'}
                        </Badge>
                        {post.image_url && (
                          <Badge variant="outline">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Com imagem
                          </Badge>
                        )}
                        {post.as_organization && (
                          <Badge variant="outline">
                            🏢 Como Página
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3 text-muted-foreground mb-2">
                        {post.text}
                      </p>
                      <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>
                          {new Date(post.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {post.scheduled_for && (
                          <>
                            <span>•</span>
                            <span>
                              📅 {new Date(post.scheduled_for).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadPost(post)}
                      >
                        Usar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPostId === post.id}
                      >
                        {deletingPostId === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          '🗑️'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Configuração */}
        <div className="space-y-6">
          {/* Tipo de Post */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Post</CardTitle>
              <CardDescription>
                Escolha o que você quer compartilhar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={postType}
                onValueChange={(value: any) => {
                  setPostType(value)
                  setPostText('')
                  setImagePrompt('')
                  setImageUrl('')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullstack-random">
                    💼 Post sobre Fullstack (Aleatório)
                  </SelectItem>
                  <SelectItem value="blog-article">
                    📝 Divulgar Artigo do Blog
                  </SelectItem>
                </SelectContent>
              </Select>

              {postType === 'blog-article' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecione o Artigo</label>
                  <Select
                    value={selectedArticle}
                    onValueChange={setSelectedArticle}
                    disabled={loadingArticles}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um artigo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {articles.map((article) => (
                        <SelectItem key={article.slug} value={article.slug}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={generating || (postType === 'blog-article' && !selectedArticle)}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Post com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Texto do Post */}
          <Card>
            <CardHeader>
              <CardTitle>Texto do Post</CardTitle>
              <CardDescription>
                Revise e edite o conteúdo antes de publicar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="O texto do post aparecerá aqui após gerar..."
                rows={12}
                className="font-sans resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {postText.length} / 3000 caracteres
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Imagem e Publicação */}
        <div className="space-y-6">
          {/* Imagem */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem do Post</CardTitle>
              <CardDescription>
                Gere uma imagem profissional com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Prompt da Imagem
                </label>
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Descreva a imagem que você quer gerar..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleGenerateImage}
                  disabled={generatingImage || !imagePrompt.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {generatingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      DALL-E
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => document.getElementById('linkedin-file-upload')?.click()}
                  disabled={uploadingFile}
                  className="w-full"
                  variant="outline"
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>

              <input
                id="linkedin-file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {imageUrl && (
                <div className="border rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Preview da imagem"
                    width={1024}
                    height={1024}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publicação */}
          <Card>
            <CardHeader>
              <CardTitle>Publicar</CardTitle>
              <CardDescription>
                Compartilhe no LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Publicar como:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAsOrganization(!asOrganization)}
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  {asOrganization ? 'Página CatBytes' : 'Perfil Pessoal'}
                </Button>
              </div>

              <Button
                onClick={() => setShowScheduleModal(true)}
                disabled={!postText.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Agendar ou Publicar
              </Button>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">📅 Publicação</p>
                <p className="text-xs leading-relaxed">
                  Escolha uma data/hora específica ou publique imediatamente no LinkedIn
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    {/* Modal de Agendamento */}
    <ScheduleLinkedInModal
      open={showScheduleModal}
      onOpenChange={setShowScheduleModal}
      post={{
        text: postText,
        imageUrl: imageUrl,
        postType: postType,
        articleSlug: postType === 'blog-article' ? selectedArticle : undefined,
        asOrganization: asOrganization
      }}
      postId={loadedPostId || undefined}
      onSuccess={() => {
        // Limpar formulário após sucesso
        setPostText('')
        setImagePrompt('')
        setImageUrl('')
        setSelectedArticle('')
        setLoadedPostId(null)
        loadSavedPosts() // Recarregar lista de posts
        showToast('✅ Operação realizada com sucesso!', 'success')
      }}
    />
    </AdminLayoutWrapper>
    </AdminGuard>
  )
}
