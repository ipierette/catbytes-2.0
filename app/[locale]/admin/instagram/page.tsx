'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Instagram, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, Play, Power, PowerOff, Clock, Eye } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  const [pendingPosts, setPendingPosts] = useState<InstagramPost[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoGenEnabled, setAutoGenEnabled] = useState(true)
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Busca posts pendentes
      const postsRes = await fetch('/api/instagram/posts?status=pending')
      if (postsRes.ok) {
        const data = await postsRes.json()
        setPendingPosts(data.posts || [])
      }

      // Busca estatísticas
      const statsRes = await fetch('/api/instagram/post')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.data?.stats)
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

  const handleApprove = async (postId: string) => {
    try {
      const response = await fetch(`/api/instagram/approve/${postId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setSelectedPost(null)
        await loadData()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao aprovar post' })
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
      setMessage({ type: 'error', text: 'Erro ao rejeitar post' })
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
    <div className="container mx-auto p-8 space-y-8">
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.approved || 0}</div>
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
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
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

      {/* Schedule Info */}
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
              <h4 className="font-semibold mb-2">🤖 Geração Automática</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Dias:</strong> Sábado, Terça e Quinta<br/>
                <strong>Quantidade:</strong> 10 posts por execução<br/>
                <strong>Status:</strong> <span className={autoGenEnabled ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {autoGenEnabled ? 'ATIVA' : 'PAUSADA'}
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📤 Publicação Automática</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Dias:</strong> Segunda, Quarta, Sexta e Domingo<br/>
                <strong>Horário:</strong> 10:00 BRT<br/>
                <strong>Publica:</strong> Posts aprovados automaticamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Posts Aguardando Aprovação</CardTitle>
          <CardDescription>
            Clique em um post para visualizar em tela cheia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPosts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum post pendente. A próxima geração será em breve!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPosts.map(post => (
                <div
                  key={post.id}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPost(post)}
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{post.titulo}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.texto_imagem}</p>
                    <div className="mt-3 flex gap-2">
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
                        className="flex-1 gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReject(post.id)
                        }}
                      >
                        <XCircle className="h-3 w-3" />
                        Rejeitar
                      </Button>
                    </div>
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

              <div className="p-4 border-t flex gap-3">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => handleApprove(selectedPost.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprovar e Agendar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
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
    </div>
  )
}
