'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, Plus, Edit, Trash2, Eye, Clock, ChevronDown } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BlogPreviewModal } from '@/components/blog/blog-preview-modal'

interface BlogPost {
  id: string
  created_at: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: 'draft' | 'published' | 'scheduled'
  published_at?: string
  scheduled_for?: string
  author: string
  tags: string[]
  image_url?: string
}

interface Stats {
  total: number
  published: number
  drafts: number
  scheduled: number
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewTheme, setPreviewTheme] = useState('')
  const [generatedPost, setGeneratedPost] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Busca todos os posts do blog (incluindo não publicados)
      // Precisa incluir credentials para passar o cookie de admin
      const postsRes = await fetch('/api/admin/blog/posts', {
        credentials: 'include'
      })
      
      if (postsRes.ok) {
        const data = await postsRes.json()
        setPosts(data.posts || [])
        
        // Calcula estatísticas
        const allPosts = data.posts || []
        const stats = {
          total: allPosts.length,
          published: allPosts.filter((p: BlogPost) => p.status === 'published').length,
          drafts: allPosts.filter((p: BlogPost) => p.status === 'draft').length,
          scheduled: allPosts.filter((p: BlogPost) => p.status === 'scheduled').length
        }
        setStats(stats)
      } else {
        setMessage({ type: 'error', text: 'Erro ao carregar posts. Verifique se está autenticado.' })
      }
    } catch (error) {
      console.error('Error loading blog data:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar posts do blog' })
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePost = async (theme?: string) => {
    try {
      const themeText = theme ? ` (${theme})` : ''
      setMessage({ type: 'success', text: `Gerando rascunho do artigo${themeText}... Prepare-se para personalizar!` })
      
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, generateOnly: true }) // Só gera, não salva ainda
      })

      const data = await response.json()

      if (data.success) {
        // Abre modal de preview com o post gerado
        setGeneratedPost({
          title: data.post?.title || '',
          excerpt: data.post?.excerpt || '',
          content: data.post?.content || '',
          cover_image_url: data.post?.cover_image_url || '',
          category: theme || data.post?.category || '',
          tags: data.post?.tags || []
        })
        setPreviewTheme(theme || data.metadata?.theme || 'Automação e Negócios')
        setPreviewModalOpen(true)
        setMessage({ type: 'success', text: 'Rascunho gerado! Agora você pode personalizar antes de publicar.' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao gerar artigo' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao gerar artigo' })
    }
  }

  const handleSaveFromPreview = async (postData: any) => {
    try {
      setMessage({ type: 'success', text: 'Salvando artigo personalizado...' })
      
      const response = await fetch('/api/blog/save-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Artigo "${data.post?.title}" salvo com sucesso!` })
        setPreviewModalOpen(false)
        await loadData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar artigo' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar artigo' })
    }
  }

  const handleTranslatePost = async (postId: string, title: string) => {
    if (!confirm(`Traduzir "${title}" para inglês? Esta ação criará uma versão em inglês do post.`)) return

    try {
      setLoading(true)
      setMessage({ 
        type: 'success', 
        text: `Traduzindo "${title}"... Isso pode demorar alguns minutos.` 
      })

      const response = await fetch('/api/blog/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: postId,
          targetLanguage: 'en'
        })
      })

      const data = await response.json()

      if (data.success) {
        const slug = data.post?.slug || 'unknown'
        setMessage({ 
          type: 'success', 
          text: `Post traduzido com sucesso! A versão em inglês estará disponível em /en-US/blog/${slug}` 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Erro ao traduzir post' 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao conectar com o servidor de tradução' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Deseja realmente excluir este post?')) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post excluído com sucesso' })
        await loadData()
      } else {
        setMessage({ type: 'error', text: 'Erro ao excluir post' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao excluir post' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado'
      case 'draft':
        return 'Rascunho'
      case 'scheduled':
        return 'Agendado'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <AdminGuard>
      <AdminLayoutWrapper
        title="Blog Admin"
        description="Gerencie posts e conteúdo do blog"
      >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Administração do Blog
            </h1>
            <p className="text-muted-foreground mt-1">
              {posts.length} post{posts.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Gerar Artigos
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Escolha o Tema do Artigo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => handleGeneratePost('Automação e Negócios')}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">💼 Automação e Negócios</span>
                    <span className="text-xs text-muted-foreground">Para clientes e recrutadores</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleGeneratePost('Programação e IA')}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">💻 Programação e IA</span>
                    <span className="text-xs text-muted-foreground">Dicas técnicas acessíveis</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleGeneratePost('Cuidados Felinos')}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">🐱 Cuidados Felinos</span>
                    <span className="text-xs text-muted-foreground">Gatinhos e bem-estar animal</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleGeneratePost('Novidades sobre IA')}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">🤖 Novidades sobre IA</span>
                    <span className="text-xs text-muted-foreground">Últimas notícias de IA</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => handleGeneratePost()}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">🎯 Automático</span>
                    <span className="text-xs text-muted-foreground">Baseado no dia atual</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
              <Edit className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats?.drafts || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendados</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.scheduled || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.published || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sistema Temático de Blog
            </CardTitle>
            <CardDescription>
              4 categorias de artigos que rotacionam por dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">🗓️ Segunda-feira</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1">💼 Automação e Negócios</p>
                  <p className="text-xs text-muted-foreground">
                    Para clientes e recrutadores sobre vantagens de sistemas automáticos, 
                    ROI digital e transformação empresarial
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-purple-600">🗓️ Quinta-feira</h4>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1">💻 Programação Web Full Stack</p>
                  <p className="text-xs text-muted-foreground">
                    De HTML básico até frameworks modernos (React, Angular, Node.js, bancos de dados, 
                    N8N, ferramentas e atualizações). Tudo explicado para leigos com imagens didáticas.
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-pink-600">🗓️ Sábado</h4>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1">🐱 Cuidados Felinos</p>
                  <p className="text-xs text-muted-foreground">
                    Artigos acolhedores sobre cuidados com gatinhos: saúde, alimentação, 
                    bem-estar animal com fotos adoráveis de gatinhos
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-emerald-600">🗓️ Domingo</h4>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1">🤖 Novidades sobre IA</p>
                  <p className="text-xs text-muted-foreground">
                    Últimas notícias sobre inteligência artificial: novos modelos (ChatGPT, Gemini, Claude), 
                    ferramentas, atualizações e tendências de fontes confiáveis
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm">
                <strong className="text-green-700">Status do Sistema:</strong>{' '}
                <span className="text-green-600 font-semibold">ATIVO</span> - 
                Geração automática nos dias programados (Segunda, Quinta, Sábado, Domingo) + geração manual por tema
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Posts</CardTitle>
            <CardDescription>
              Gerencie e visualize todos os posts do blog
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum post encontrado. Gere o primeiro post!
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div
                    key={post.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${getStatusColor(post.status)}`}>
                            {getStatusLabel(post.status)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Por: {post.author}</span>
                          <span>•</span>
                          <span>Criado: {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                          {post.published_at && (
                            <>
                              <span>•</span>
                              <span>Publicado: {new Date(post.published_at).toLocaleDateString('pt-BR')}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Slug: /{post.slug}</span>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => window.open(`/pt-BR/blog/${post.slug}`, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                          Ver
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1"
                          onClick={() => handleTranslatePost(post.id, post.title)}
                          disabled={loading}
                        >
                          🌐 Traduzir
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Preview e Edição */}
      <BlogPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onSave={handleSaveFromPreview}
        initialPost={generatedPost || {}}
        theme={previewTheme}
      />
    </AdminLayoutWrapper>
    </AdminGuard>
  )
}