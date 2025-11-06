'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Instagram, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, Play, Power, PowerOff, Clock, CheckSquare, Square, Trash2, Edit, Send, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { InstagramEditModal } from '@/components/instagram/instagram-edit-modal'
import { DALLEConfigModal } from '@/components/instagram/dalle-config-modal'

interface InstagramPost {
  id: string
  created_at: string
  nicho: string
  titulo: string
  texto_imagem: string
  caption: string
  image_url: string
  instagram_post_id?: string
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'failed'
  error_message?: string
  scheduled_for?: string
  approved_at?: string
  published_at?: string
}

interface Stats {
  total: number
  published: number
  pending: number
  approved: number
  failed: number
  byNiche: Record<string, number>
}

export default function InstagramAdminPage() {
  const [allPosts, setAllPosts] = useState<InstagramPost[]>([])
  const [pendingPosts, setPendingPosts] = useState<InstagramPost[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoGenEnabled, setAutoGenEnabled] = useState(true)
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null)
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null)
  
  // Novos estados
  const [showDALLEModal, setShowDALLEModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'published' | 'failed'>('all')
  
  // Posts filtrados
  const filteredPosts = filterStatus === 'all' 
    ? allPosts 
    : allPosts.filter(p => p.status === filterStatus)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Busca TODOS os posts
      const postsRes = await fetch('/api/instagram/posts')
      if (postsRes.ok) {
        const data = await postsRes.json()
        const posts = data.posts || []
        setAllPosts(posts)
        setPendingPosts(posts.filter((p: InstagramPost) => p.status === 'pending'))
      }

      // Busca estatísticas
      const statsRes = await fetch('/api/instagram/stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }

      // Busca configurações
      const settingsRes = await fetch('/api/instagram/settings')
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setAutoGenEnabled(data.settings?.autoGenerationEnabled ?? true)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAutoGen = async () => {
    try {
      const newValue = !autoGenEnabled
      const response = await fetch('/api/instagram/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoGenerationEnabled: newValue })
      })

      if (response.ok) {
        setAutoGenEnabled(newValue)
        setMessage({ 
          type: 'success', 
          text: `Geração automática ${newValue ? 'ATIVADA' : 'PAUSADA'}` 
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar configuração' })
    }
  }

  const handleGenerateBatch = async () => {
    try {
      setLoading(true)
      setMessage({ 
        type: 'success', 
        text: '🎨 Iniciando geração de posts... A geração está rodando em background e os posts aparecerão em alguns minutos. Você pode continuar usando o painel.' 
      })

      const response = await fetch('/api/instagram/generate-batch', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'C@T-BYt3s1460071--admin-api-2024'
        }
      })

      const data = await response.json()

      if (data.success) {
        if (data.status === 'processing') {
          // Geração em background
          setMessage({ 
            type: 'success', 
            text: `✅ ${data.message} Atualize a página em alguns minutos para ver os novos posts.` 
          })
          
          // Agenda reload automático após 3 minutos
          setTimeout(() => {
            loadData()
            setMessage({ 
              type: 'success', 
              text: '🔄 Página atualizada! Verifique se os posts foram gerados.' 
            })
          }, 180000) // 3 minutos
        } else {
          // Geração completa (cron job)
          setMessage({ 
            type: 'success', 
            text: `✅ Lote gerado com sucesso! ${data.generated || data.postsGenerated || 10} posts criados e aguardando aprovação.` 
          })
          await loadData()
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Erro ao gerar lote de posts' 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao conectar com o servidor. Tente novamente.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateWithDALLE = async () => {
    setShowDALLEModal(true)
  }

  const handleDALLEGenerate = async (config: {
    nicho: string
    tema: string
    quantidade: number
    estilo: string
    palavrasChave?: string[]
  }) => {
    try {
      setLoading(true)
      setShowDALLEModal(false)
      setMessage({ 
        type: 'success', 
        text: '🎨 Gerando posts com DALL-E 3... Isso pode levar alguns minutos.' 
      })

      const response = await fetch('/api/instagram/generate-with-dalle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'C@T-BYt3s1460071--admin-api-2024'
        },
        body: JSON.stringify(config)
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${data.posts.length} posts gerados com DALL-E 3! Você pode editá-los manualmente antes de publicar.` 
        })
        await loadData()
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Erro ao gerar posts com DALL-E 3' 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao gerar posts com DALL-E 3' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (postId: string) => {
    try {
      // Feedback visual IMEDIATO - Optimistic Update
      setMessage({ type: 'success', text: '⏳ Aprovando post...' })
      
      // Remover da lista de pendentes IMEDIATAMENTE
      setPendingPosts(prev => prev.filter(p => p.id !== postId))
      
      // Atualizar contador de pendentes
      setStats(prevStats => prevStats ? {
        ...prevStats,
        pending: Math.max(0, prevStats.pending - 1),
        approved: prevStats.approved + 1
      } : null)

      const response = await fetch(`/api/instagram/approve/${postId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        // Sucesso - Mostrar mensagem com data de agendamento
        setMessage({ 
          type: 'success', 
          text: data.message || 'Post aprovado e agendado com sucesso!' 
        })
        setSelectedPost(null)
        
        // Recarregar dados para garantir sincronia
        setTimeout(() => loadData(), 1000)
      } else {
        // Erro - Reverter mudanças otimistas
        setMessage({ type: 'error', text: data.error || 'Erro ao aprovar post' })
        await loadData() // Recarregar estado real
      }
    } catch (error) {
      console.error('Error approving post:', error)
      setMessage({ type: 'error', text: 'Erro ao aprovar post. Tente novamente.' })
      await loadData() // Recarregar estado real
    }
  }

  const handleReject = async (postId: string) => {
    if (!confirm('Deseja realmente rejeitar este post?')) return

    try {
      const response = await fetch(`/api/instagram/reject/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Qualidade da imagem/conteúdo não aprovada' })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Post rejeitado' })
        setSelectedPost(null)
        await loadData()
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
      setMessage({ type: 'error', text: 'Erro ao rejeitar post' })
    }
  }

  const handlePublishNow = async (postId: string) => {
    if (!confirm('🚀 Deseja publicar este post AGORA no Instagram?\n\nEsta ação é irreversível e o post será publicado imediatamente.')) return

    try {
      setPublishingPostId(postId)
      setMessage({ type: 'success', text: '📤 Publicando no Instagram... Aguarde.' })

      const response = await fetch(`/api/instagram/publish-now/${postId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Post publicado com sucesso! Ver no Instagram: ${data.instagramUrl || ''}` 
        })
        
        // Remover dos pendentes e atualizar estatísticas IMEDIATAMENTE
        setPendingPosts(prev => prev.filter(p => p.id !== postId))
        setStats(prevStats => prevStats ? {
          ...prevStats,
          pending: Math.max(0, prevStats.pending - 1),
          published: prevStats.published + 1
        } : null)
        
        setSelectedPost(null)
        
        // Recarregar dados completos após 1 segundo
        setTimeout(() => loadData(), 1000)
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Erro ao publicar no Instagram' 
        })
        // Recarregar em caso de erro para sincronizar
        await loadData()
      }
    } catch (error) {
      console.error('Erro ao publicar:', error)
      setMessage({ type: 'error', text: 'Erro ao publicar post. Verifique sua conexão.' })
    } finally {
      setPublishingPostId(null)
    }
  }

  const handleSaveEdit = async (updatedPost: InstagramPost, finalImageUrl?: string) => {
    try {
      setMessage({ type: 'success', text: '💾 Salvando alterações...' })

      const response = await fetch(`/api/instagram/posts/${updatedPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: updatedPost.titulo,
          texto_imagem: updatedPost.texto_imagem,
          caption: updatedPost.caption,
          image_url: finalImageUrl || updatedPost.image_url
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: '✅ Post atualizado com sucesso!' })
        setEditingPost(null)
        await loadData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar post' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar alterações' })
      throw error
    }
  }

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPosts.size === pendingPosts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(pendingPosts.map(p => p.id)))
    }
  }

  const handleBulkReject = async () => {
    if (selectedPosts.size === 0) return

    const confirmed = confirm(`Deseja realmente rejeitar ${selectedPosts.size} posts selecionados?`)
    if (!confirmed) return

    try {
      setMessage({ type: 'success', text: 'Rejeitando posts em lote...' })
      
      const promises = Array.from(selectedPosts).map(postId =>
        fetch(`/api/instagram/reject/${postId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Rejeição em lote via admin' })
        })
      )

      const results = await Promise.allSettled(promises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.length - successful

      if (successful > 0) {
        setMessage({ 
          type: 'success', 
          text: `${successful} posts rejeitados com sucesso${failed > 0 ? `, ${failed} falharam` : ''}` 
        })
        setSelectedPosts(new Set())
        setBulkMode(false)
        await loadData()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao rejeitar posts em lote' })
    }
  }

  const nicheColors: Record<string, string> = {
    advogados: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medicos: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    terapeutas: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    nutricionistas: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  }

  const nicheNames: Record<string, string> = {
    advogados: 'Advogados',
    medicos: 'Médicos',
    terapeutas: 'Terapeutas',
    nutricionistas: 'Nutricionistas'
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
        title="Instagram Admin"
        description="Gerencie e aprove posts do Instagram"
      >
      <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Instagram className="h-8 w-8" />
            Aprovação de Posts do Instagram
          </h1>
          <p className="text-muted-foreground mt-1">
            {pendingPosts.length} post{pendingPosts.length !== 1 ? 's' : ''} aguardando aprovação
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleToggleAutoGen}
            variant={autoGenEnabled ? 'default' : 'outline'}
            size="lg"
            className="gap-2"
          >
            {autoGenEnabled ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
            {autoGenEnabled ? 'Geração Ativa' : 'Geração Pausada'}
          </Button>
          <Button 
            onClick={handleGenerateBatch}
            variant="secondary"
            size="lg" 
            className="gap-2"
            disabled={loading}
          >
            <Play className="h-4 w-4" />
            {loading ? 'Gerando...' : '🤖 Gerar com IA (Tradicional)'}
          </Button>
          <Button 
            onClick={handleGenerateWithDALLE}
            variant="default"
            size="lg" 
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={loading}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.5"/>
              <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="currentColor"/>
            </svg>
            {loading ? 'Gerando...' : '✨ Gerar com DALL-E 3'}
          </Button>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">📊 Estatísticas</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card 
            className="cursor-pointer hover:border-yellow-600 hover:shadow-lg transition-all"
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
              {filterStatus === 'pending' && (
                <p className="text-xs text-yellow-600 mt-1">✓ Filtro ativo</p>
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-blue-600 hover:shadow-lg transition-all"
            onClick={() => setFilterStatus(filterStatus === 'approved' ? 'all' : 'approved')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendados</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.approved || 0}</div>
              {filterStatus === 'approved' && (
                <p className="text-xs text-blue-600 mt-1">✓ Filtro ativo</p>
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-green-600 hover:shadow-lg transition-all"
            onClick={() => setFilterStatus(filterStatus === 'published' ? 'all' : 'published')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.published || 0}</div>
              {filterStatus === 'published' && (
                <p className="text-xs text-green-600 mt-1">✓ Filtro ativo</p>
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-red-600 hover:shadow-lg transition-all"
            onClick={() => setFilterStatus(filterStatus === 'failed' ? 'all' : 'failed')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
              {filterStatus === 'failed' && (
                <p className="text-xs text-red-600 mt-1">✓ Filtro ativo</p>
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-gray-600 hover:shadow-lg transition-all"
            onClick={() => setFilterStatus('all')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              {filterStatus === 'all' && (
                <p className="text-xs text-muted-foreground mt-1">✓ Todos</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>      {/* Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sistema de Agendamento
          </CardTitle>
          <CardDescription>
            Posts são gerados e publicados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">🤖 Geração de Posts</h4>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Opção 1 - IA Tradicional:</strong><br/>
                • Usa GPT-4 para criar conteúdo<br/>
                • Você edita texto e imagem manualmente<br/>
                • Mais controle e personalização<br/>
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Opção 2 - DALL-E 3:</strong><br/>
                • Gera imagem com texto integrado<br/>
                • Mais rápido e profissional<br/>
                • Você pode editar manualmente depois<br/>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Automático:</strong> Cron jobs geram posts automaticamente (segunda, terça, quinta e sábado às 13:00)<br/>
                <strong>Manual:</strong> Use os botões de geração a qualquer momento<br/>
                <strong>Status:</strong> <span className={autoGenEnabled ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {autoGenEnabled ? 'ATIVA' : 'PAUSADA'}
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📤 Publicação Automática</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Dias:</strong> Segunda, Quarta, Sexta e Domingo<br/>
                <strong>Horário:</strong> 13:00 BRT<br/>
                <strong>Publica:</strong> Posts aprovados automaticamente<br/>
                <strong>Funciona:</strong> Independente da geração automática
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Pendentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Posts Aguardando Aprovação</CardTitle>
              <CardDescription>
                {bulkMode ? 'Selecione posts para rejeitar em lote' : 'Clique em um post para visualizar em tela cheia'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {pendingPosts.length > 0 && (
                <Button
                  variant={bulkMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setBulkMode(!bulkMode)
                    setSelectedPosts(new Set())
                  }}
                  className="gap-2"
                >
                  {bulkMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  {bulkMode ? 'Cancelar Seleção' : 'Selecionar Múltiplos'}
                </Button>
              )}
              {bulkMode && selectedPosts.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkReject}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Rejeitar {selectedPosts.size} Selecionados
                </Button>
              )}
            </div>
          </div>
          {bulkMode && pendingPosts.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                checked={selectedPosts.size === pendingPosts.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Selecionar todos ({selectedPosts.size}/{pendingPosts.length} selecionados)
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {filterStatus === 'all' 
                ? 'Nenhum post encontrado. Gere novos posts usando os botões acima!' 
                : `Nenhum post ${filterStatus === 'pending' ? 'pendente' : filterStatus === 'approved' ? 'agendado' : filterStatus === 'published' ? 'publicado' : 'com falha'}.`
              }
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    bulkMode 
                      ? `cursor-pointer ${selectedPosts.has(post.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/30'}` 
                      : 'cursor-pointer hover:shadow-lg'
                  }`}
                  onClick={() => bulkMode ? handleSelectPost(post.id) : setSelectedPost(post)}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={post.image_url}
                      alt={post.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${nicheColors[post.nicho]}`}>
                        {nicheNames[post.nicho]}
                      </span>
                    </div>
                    {bulkMode && (
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedPosts.has(post.id)}
                          onCheckedChange={() => handleSelectPost(post.id)}
                          className="bg-white/90 border-2"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{post.titulo}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.texto_imagem}</p>
                    {!bulkMode && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingPost(post)
                          }}
                          title="Editar conteúdo"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApprove(post.id)
                          }}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReject(post.id)
                          }}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {bulkMode && (
                      <div className="mt-3 text-center">
                        <span className="text-xs text-muted-foreground">
                          {selectedPosts.has(post.id) ? '✓ Selecionado' : 'Clique para selecionar'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Preview (estilo Instagram) */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagem */}
            <div className="md:w-3/5 bg-black flex items-center justify-center">
              <img
                src={selectedPost.image_url}
                alt={selectedPost.titulo}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </div>

            {/* Caption e ações */}
            <div className="md:w-2/5 flex flex-col max-h-[90vh]">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" />
                  <span className="font-semibold">Preview do Post</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${nicheColors[selectedPost.nicho]}`}>
                  {nicheNames[selectedPost.nicho]}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">{selectedPost.titulo}</h3>
                  <p className="text-sm font-semibold text-primary mb-3">{selectedPost.texto_imagem}</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedPost.caption}</p>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Gerado em: {new Date(selectedPost.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="p-4 border-t flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  className="gap-2 flex-1 min-w-[140px]"
                  onClick={() => handlePublishNow(selectedPost.id)}
                  disabled={publishingPostId === selectedPost.id}
                >
                  <Send className="h-4 w-4" />
                  {publishingPostId === selectedPost.id ? 'Publicando...' : '🚀 Publicar'}
                </Button>
                <Button
                  className="flex-1 gap-2 min-w-[140px]"
                  onClick={() => handleApprove(selectedPost.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2 min-w-[120px]"
                  onClick={() => handleReject(selectedPost.id)}
                >
                  <XCircle className="h-4 w-4" />
                  Rejeitar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingPost && (
        <InstagramEditModal
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
        />
      )}
      
      {/* Modal de Configuração DALL-E 3 */}
      <DALLEConfigModal
        open={showDALLEModal}
        onClose={() => setShowDALLEModal(false)}
        onGenerate={handleDALLEGenerate}
      />
      </div>
    </AdminLayoutWrapper>
    </AdminGuard>
  )
}
