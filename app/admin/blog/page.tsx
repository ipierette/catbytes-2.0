'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileText, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, Plus, Edit, Trash2, Eye, Clock, ChevronDown, Sparkles } from 'lucide-react'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StructuredPostEditor } from '@/components/blog/structured-post-editor'
import type { BlogPost as BlogPostType } from '@/types/blog'

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
  const [generating, setGenerating] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('')
  // Removed message state - using toast instead
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewTheme, setPreviewTheme] = useState('')
  const [generatedPost, setGeneratedPost] = useState<any>(null)
  const [textOnlyMode, setTextOnlyMode] = useState(false)
  const [customThemeDialogOpen, setCustomThemeDialogOpen] = useState(false)
  const [customTheme, setCustomTheme] = useState('')
  const [structuredEditorOpen, setStructuredEditorOpen] = useState(false)
  // Removed message state - using toast instead

  // Filtrar posts baseado no status e período selecionados
  const filteredPosts = posts.filter(p => {
    // Filtro de status
    if (filterStatus !== 'all' && p.status !== filterStatus) {
      return false
    }
    
    // Filtro de período
    if (filterPeriod) {
      const postDate = new Date(p.created_at)
      const now = new Date()
      let dateFrom = new Date()
      
      switch (filterPeriod) {
        case 'last7days':
          dateFrom.setDate(now.getDate() - 7)
          break
        case 'last30days':
          dateFrom.setDate(now.getDate() - 30)
          break
        case 'last3months':
          dateFrom.setMonth(now.getMonth() - 3)
          break
        case 'last6months':
          dateFrom.setMonth(now.getMonth() - 6)
          break
        case 'lastyear':
          dateFrom.setFullYear(now.getFullYear() - 1)
          break
      }
      
      if (postDate < dateFrom) {
        return false
      }
    }
    
    return true
  })

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
        toast.error('Erro ao carregar posts. Verifique se está autenticado.')
      }
    } catch (error) {
      console.error('Error loading blog data:', error)
      toast.error('Erro ao carregar posts do blog')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePost = async (theme?: string) => {
    if (generating) {
      console.log('[Generate] Already generating, skipping duplicate call')
      return
    }

    try {
      setGenerating(true)
      const modeText = textOnlyMode ? ' (Texto + Prompt)' : ''
      const themeText = theme ? ` (${theme})` : ''
      toast.loading(`Gerando e publicando artigo${themeText}${modeText}...`, { id: 'generate' })
      
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          theme, 
          textOnly: textOnlyMode,
          // Removido generateOnly - agora publica direto
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`✅ Artigo "${data.post?.title}" publicado com sucesso!`, { id: 'generate' })
        await loadData()
      } else {
        toast.error(data.error || 'Erro ao gerar artigo', { id: 'generate' })
      }
    } catch (error) {
      console.error('[Generate] Error:', error)
      toast.error('Erro ao gerar artigo', { id: 'generate' })
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateWithCustomTheme = async () => {
    if (!customTheme.trim()) {
      toast.error('Digite um tema para o artigo')
      return
    }
    setCustomThemeDialogOpen(false)
    await handleGeneratePost(customTheme)
    setCustomTheme('')
  }

  const handleSaveFromPreview = async (postData: any) => {
    try {
      toast.loading('Salvando artigo personalizado...', { id: 'save' })
      
      const response = await fetch('/api/blog/save-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Artigo "${data.post?.title}" salvo com sucesso!`, { id: 'save' })
        setPreviewModalOpen(false)
        await loadData()
      } else {
        toast.error(data.error || 'Erro ao salvar artigo', { id: 'save' })
      }
    } catch (error) {
      toast.error('Erro ao salvar artigo', { id: 'save' })
    }
  }

  const handleTranslatePost = async (postId: string, title: string) => {
    if (!confirm(`Traduzir "${title}" para inglês? Esta ação criará uma versão em inglês do post.`)) return

    try {
      toast.loading(`Traduzindo "${title}"...`, { id: 'translate' })

      const response = await fetch('/api/blog/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })

      const data = await response.json()

      if (data.success) {
        const slug = data.post?.slug || 'unknown'
        toast.success(`✅ Post traduzido! Versão em inglês: /en-US/blog/${slug}`, { id: 'translate' })
        await loadData() // Recarrega lista para mostrar nova tradução
      } else {
        toast.error(data.error || 'Erro ao traduzir post', { id: 'translate' })
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Erro ao conectar com o servidor de tradução', { id: 'translate' })
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Deseja realmente excluir este post?')) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Post excluído com sucesso')
        await loadData()
      } else {
        toast.error('Erro ao excluir post')
      }
    } catch (error) {
      toast.error('Erro ao excluir post')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) {
      toast.error('Selecione pelo menos um post para deletar')
      return
    }

    if (!confirm(`Tem certeza que deseja deletar ${selectedPosts.length} post(s)?`)) return

    try {
      setLoading(true)
      toast.loading('Deletando posts...', { id: 'bulk-delete' })
      
      const deletePromises = selectedPosts.map(postId =>
        fetch('/api/admin/blog/posts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: postId })
        })
      )

      await Promise.all(deletePromises)
      
      toast.success(`${selectedPosts.length} post(s) deletado(s) com sucesso!`, { id: 'bulk-delete' })
      setSelectedPosts([])
      await loadData()
    } catch (error) {
      toast.error('Erro ao deletar posts', { id: 'bulk-delete' })
    } finally {
      setLoading(false)
    }
  }

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(posts.map(p => p.id))
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
      <div className="space-y-8 bg-slate-900 min-h-screen p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-100">
              <FileText className="h-8 w-8 text-blue-400" />
              Administração do Blog
            </h1>
            <p className="text-slate-400 mt-1">
              {posts.length} post{posts.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button
              variant="default"
              size="lg"
              className="gap-2 flex-1 md:flex-initial bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => setStructuredEditorOpen(true)}
            >
              ✨ Editor Estruturado (Recomendado)
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="gap-2 flex-1 md:flex-initial">
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
                  onClick={() => handleGeneratePost('Tech Aleatório')}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">🚀 Tech Aleatório</span>
                    <span className="text-xs text-muted-foreground">Tutoriais, SEO, tendências tech</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => setCustomThemeDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">✨ Tema Customizado</span>
                    <span className="text-xs text-muted-foreground">Digite seu próprio tema</span>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Rascunhos</CardTitle>
              <Edit className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-300">{stats?.drafts || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Agendados</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats?.scheduled || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Publicados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats?.published || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{stats?.total || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Calendar className="h-5 w-5 text-blue-400" />
              Sistema Temático de Blog
            </CardTitle>
            <CardDescription className="text-slate-400">
              4 categorias de artigos que rotacionam por dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">🗓️ Segunda-feira</h4>
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <p className="font-medium text-sm mb-1 text-slate-200">💼 Automação e Negócios</p>
                  <p className="text-xs text-slate-400">
                    Para clientes e recrutadores sobre vantagens de sistemas automáticos, 
                    ROI digital e transformação empresarial
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-purple-400">🗓️ Quinta-feira</h4>
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <p className="font-medium text-sm mb-1 text-slate-200">💻 Programação Web Full Stack</p>
                  <p className="text-xs text-slate-400">
                    De HTML básico até frameworks modernos (React, Angular, Node.js, bancos de dados, 
                    N8N, ferramentas e atualizações). Tudo explicado para leigos com imagens didáticas.
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-pink-400">🗓️ Sábado</h4>
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <p className="font-medium text-sm mb-1 text-slate-200">🐱 Cuidados Felinos</p>
                  <p className="text-xs text-slate-400">
                    Artigos acolhedores sobre cuidados com gatinhos: saúde, alimentação, 
                    bem-estar animal com fotos adoráveis de gatinhos
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-emerald-400">🗓️ Domingo</h4>
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <p className="font-medium text-sm mb-1 text-slate-200">🚀 Tech Aleatório</p>
                  <p className="text-xs text-slate-400">
                    Tutoriais técnicos, SEO e marketing digital, tendências tech mais atualizadas: 
                    ferramentas, frameworks, melhores práticas e inovações
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-emerald-900/30 rounded-lg border border-emerald-700/50">
              <p className="text-sm text-slate-200">
                <strong className="text-emerald-400">Status do Sistema:</strong>{' '}
                <span className="text-emerald-300 font-semibold">ATIVO</span> - 
                <span className="text-slate-300"> Geração automática nos dias programados (Segunda, Quinta, Sábado, Domingo) + geração manual por tema</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Posts */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-100">Todos os Posts</CardTitle>
                <CardDescription className="text-slate-400">
                  Gerencie e visualize todos os posts do blog
                </CardDescription>
              </div>
              {selectedPosts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar {selectedPosts.length} selecionado(s)
                </Button>
              )}
            </div>

            {/* Filtro de Status e Período */}
            <div className="flex flex-col gap-4 mt-4">
              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Todos ({posts.length})
                </button>
                <button
                  onClick={() => setFilterStatus('published')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'published'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Publicados ({stats?.published || 0})
                </button>
                <button
                  onClick={() => setFilterStatus('draft')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'draft'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Rascunhos ({stats?.drafts || 0})
                </button>
                <button
                  onClick={() => setFilterStatus('scheduled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'scheduled'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Agendados ({stats?.scheduled || 0})
                </button>
              </div>

              {/* Period Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Filtrar por Período
                </label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="">Todos os períodos</option>
                  <option value="last7days">Últimos 7 dias</option>
                  <option value="last30days">Últimos 30 dias</option>
                  <option value="last3months">Últimos 3 meses</option>
                  <option value="last6months">Últimos 6 meses</option>
                  <option value="lastyear">Último ano</option>
                </select>
              </div>

              {/* Filter Summary */}
              {(filterStatus !== 'all' || filterPeriod) && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Mostrando {filteredPosts.length} de {posts.length} posts</span>
                  <button
                    onClick={() => {
                      setFilterStatus('all')
                      setFilterPeriod('')
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                {filterStatus === 'all' && !filterPeriod
                  ? 'Nenhum post encontrado. Gere o primeiro post!'
                  : `Nenhum post encontrado com os filtros selecionados.`
                }
              </p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {/* Select All */}
                <div className="flex items-center gap-2 pb-2 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                  <Checkbox
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    id="select-all"
                  />
                  <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer text-slate-200">
                    Selecionar todos ({filteredPosts.length})
                  </Label>
                </div>

                {filteredPosts.map(post => (
                  <div
                    key={post.id}
                    className="border border-slate-700 rounded-lg p-3 md:p-4 hover:bg-slate-700/30 transition-colors bg-slate-800/50"
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <Checkbox
                        checked={selectedPosts.includes(post.id)}
                        onCheckedChange={() => togglePostSelection(post.id)}
                        id={`post-${post.id}`}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-base md:text-lg text-slate-100 break-words">{post.title}</h3>
                              <span className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap ${getStatusColor(post.status)}`}>
                                {getStatusLabel(post.status)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-slate-400 mb-3 line-clamp-2 break-words">
                              {post.excerpt}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-slate-500">
                              <span className="whitespace-nowrap">Por: {post.author}</span>
                              <span className="hidden md:inline">•</span>
                              <span className="whitespace-nowrap">Criado: {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                              {post.published_at && (
                                <>
                                  <span className="hidden md:inline">•</span>
                                  <span className="whitespace-nowrap">Publicado: {new Date(post.published_at).toLocaleDateString('pt-BR')}</span>
                                </>
                              )}
                              <span className="hidden md:inline">•</span>
                              <span className="text-emerald-400 break-all">/{post.slug}</span>
                            </div>
                            
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-2 py-1 rounded whitespace-nowrap">
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs text-slate-500">+{post.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 w-full md:w-auto md:ml-4 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 flex-1 md:flex-initial"
                              onClick={() => window.open(`/pt-BR/blog/${post.slug}`, '_blank')}
                            >
                              <Eye className="h-3 w-3" />
                              <span className="hidden sm:inline">Ver</span>
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-1 flex-1 md:flex-initial"
                              onClick={() => handleTranslatePost(post.id, post.title)}
                              disabled={loading}
                            >
                              🌐 <span className="hidden sm:inline">Traduzir</span>
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1 flex-1 md:flex-initial"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="hidden sm:inline">Excluir</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Tema Customizado */}
      <Dialog open={customThemeDialogOpen} onOpenChange={setCustomThemeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✨ Gerar Artigo com Tema Customizado</DialogTitle>
            <DialogDescription>
              Digite o tema ou assunto sobre o qual você quer gerar um artigo. A IA criará conteúdo relevante e otimizado para SEO.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-theme">Tema do Artigo</Label>
              <Input
                id="custom-theme"
                placeholder="Ex: Como criar um chatbot com IA, Tendências de automação 2025..."
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleGenerateWithCustomTheme()
                  }
                }}
                className="w-full"
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 <strong>Dica:</strong> Seja específico! Quanto mais detalhado o tema, melhor será o conteúdo gerado.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCustomThemeDialogOpen(false)
                setCustomTheme('')
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateWithCustomTheme}
              disabled={!customTheme.trim()}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Gerar Artigo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor Estruturado de Posts */}
      <StructuredPostEditor
        isOpen={structuredEditorOpen}
        onClose={() => setStructuredEditorOpen(false)}
        onSave={loadData}
      />
    </AdminLayoutWrapper>
    </AdminGuard>
  )
}