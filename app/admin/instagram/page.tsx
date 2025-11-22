'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Instagram, Calendar, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { InstagramEditModal } from '@/components/instagram/instagram-edit-modal'
import { DALLEConfigModal } from '@/components/instagram/dalle-config-modal'
import { SmartGenerateModal } from '@/components/instagram/SmartGenerateModal'
import { ScheduleInstagramModal } from '@/components/instagram/schedule-instagram-modal'
import type { InstagramPost, PostStatus } from '@/lib/instagram'

// Hooks modulares
import {
  useInstagramPosts,
  useInstagramStats,
  useInstagramApproval
} from './_hooks'

// Componentes modulares
import {
  StatsGrid,
  PostGrid,
  BulkActions,
  PostPreviewModal
} from './_components'

export default function InstagramAdminPage() {
  // Estados de UI
  const [filterStatus, setFilterStatus] = useState<'all' | PostStatus>('all')
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null)
  const [postToSchedule, setPostToSchedule] = useState<InstagramPost | null>(null)
  const [showDALLEModal, setShowDALLEModal] = useState(false)
  const [showSmartModal, setShowSmartModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Hooks customizados
  const { posts, loading: postsLoading, refetch: refetchPosts, updatePost } = useInstagramPosts({ 
    status: filterStatus,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minuto
  })

  const { stats, loading: statsLoading, refetch: refetchStats, decrementStat, incrementStat } = useInstagramStats()

  const {
    approving,
    approvingIds,
    approvePost,
    bulkApprove,
    rejectPost,
    bulkReject,
    publishNow
  } = useInstagramApproval()

  const loading = postsLoading || statsLoading

  // Handlers

  const handleDALLEGenerate = async (config: {
    nicho: string
    tema: string
    quantidade: number
    estilo: string
    palavrasChave?: string[]
  }) => {
    try {
      setShowDALLEModal(false)
      setMessage({ 
        type: 'success', 
        text: '🎨 Gerando posts com DALL-E 3... Isso pode levar alguns minutos.' 
      })

      const response = await fetch('/api/instagram/generate-with-dalle3', {
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
          text: `✅ ${data.posts.length} posts gerados com DALL-E 3!` 
        })
        refetchPosts()
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
    }
  }

  const handleApprove = async (post: InstagramPost) => {
    // Otimistic update
    decrementStat('pending')
    incrementStat('approved')

    const result = await approvePost(post.id)

    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: result.message || 'Post aprovado com sucesso!' 
      })
      setSelectedPost(null)
      setPostToSchedule(null)
      refetchPosts()
      refetchStats()
    } else {
      // Reverter otimistic update
      incrementStat('pending')
      decrementStat('approved')
      setMessage({ type: 'error', text: result.error || 'Erro ao aprovar post' })
    }
  }

  const handleBulkApprove = async () => {
    if (selectedPosts.size === 0) {
      setMessage({ type: 'error', text: '❌ Nenhum post selecionado' })
      return
    }

    if (!confirm(`Deseja aprovar ${selectedPosts.size} post(s)?`)) return

    setMessage({ type: 'success', text: `⏳ Aprovando ${selectedPosts.size} posts...` })

    const result = await bulkApprove(Array.from(selectedPosts))

    if (result.successful > 0 && result.failed === 0) {
      setMessage({ 
        type: 'success', 
        text: `✅ ${result.successful} post(s) aprovado(s) com sucesso!` 
      })
    } else if (result.successful > 0 && result.failed > 0) {
      setMessage({ 
        type: 'error', 
        text: `⚠️ ${result.successful} aprovado(s), ${result.failed} falhou(ram).` 
      })
      console.error('Erros na aprovação em lote:', result.errors)
    } else {
      setMessage({ 
        type: 'error', 
        text: `❌ Nenhum post foi aprovado. Verifique os logs.` 
      })
      console.error('Erros na aprovação em lote:', result.errors)
    }

    setSelectedPosts(new Set())
    setBulkMode(false)
    refetchPosts()
    refetchStats()
  }

  const handleReject = async (post: InstagramPost) => {
    if (!confirm('Deseja realmente rejeitar este post?')) return

    const result = await rejectPost(post.id)

    if (result.success) {
      setMessage({ type: 'success', text: 'Post rejeitado' })
      setSelectedPost(null)
      refetchPosts()
      refetchStats()
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao rejeitar post' })
    }
  }

  const handleBulkReject = async () => {
    if (selectedPosts.size === 0) return

    if (!confirm(`Deseja realmente rejeitar ${selectedPosts.size} posts?`)) return

    setMessage({ type: 'success', text: 'Rejeitando posts em lote...' })

    const result = await bulkReject(Array.from(selectedPosts))

    if (result.successful > 0) {
      setMessage({ 
        type: 'success', 
        text: `${result.successful} posts rejeitados${result.failed > 0 ? `, ${result.failed} falharam` : ''}` 
      })
      setSelectedPosts(new Set())
      setBulkMode(false)
      refetchPosts()
      refetchStats()
    } else {
      setMessage({ type: 'error', text: 'Erro ao rejeitar posts em lote' })
    }
  }

  const handlePublishNow = async (post: InstagramPost) => {
    if (!confirm('🚀 Deseja publicar este post AGORA no Instagram?\n\nEsta ação é irreversível.')) return

    setMessage({ type: 'success', text: '📤 Publicando no Instagram... Aguarde.' })

    const result = await publishNow(post.id)

    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: result.message || '✅ Post publicado com sucesso!' 
      })
      setSelectedPost(null)
      decrementStat('pending')
      incrementStat('published')
      refetchPosts()
      refetchStats()
    } else {
      setMessage({ 
        type: 'error', 
        text: result.error || 'Erro ao publicar no Instagram' 
      })
    }
  }

  const handleSaveEdit = async (updatedPost: InstagramPost, finalImageUrl?: string) => {
    setMessage({ type: 'success', text: '💾 Salvando alterações...' })

    const result = await updatePost(updatedPost.id, {
      titulo: updatedPost.titulo,
      texto_imagem: updatedPost.texto_imagem,
      caption: updatedPost.caption,
      image_url: finalImageUrl || updatedPost.image_url
    })

    if (result.success) {
      setMessage({ type: 'success', text: '✅ Post atualizado com sucesso!' })
      setEditingPost(null)
      refetchPosts()
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao atualizar post' })
      throw new Error(result.error)
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
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(posts.map(p => p.id)))
    }
  }

  const handleRefresh = () => {
    refetchPosts()
    refetchStats()
  }

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const pendingCount = posts.filter(p => p.status === 'pending').length

  return (
    <AdminGuard>
      <AdminLayoutWrapper
        title="Instagram Admin"
        description="Gerencie e aprove posts do Instagram"
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Instagram className="h-8 w-8" />
                Aprovação de Posts do Instagram
              </h1>
              <p className="text-muted-foreground mt-1">
                {pendingCount} post{pendingCount !== 1 ? 's' : ''} aguardando aprovação
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setShowDALLEModal(true)}
                variant="default"
                size="lg" 
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.5"/>
                  <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="currentColor"/>
                </svg>
                DALL-E 3
              </Button>
              <Button 
                onClick={() => setShowSmartModal(true)}
                variant="default"
                size="lg" 
                className="gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 shadow-lg"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                ✨ Geração Inteligente
              </Button>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">📊 Estatísticas</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            
            <StatsGrid 
              stats={stats} 
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />
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
                  <h4 className="font-semibold mb-2">🤖 Geração de Posts</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>DALL-E 3:</strong><br/>
                    • Gera imagem com texto integrado<br/>
                    • Mais rápido e profissional<br/>
                    • Você pode editar manualmente depois<br/>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Automático:</strong> Cron jobs geram posts automaticamente (segunda, terça, quinta e sábado às 9:00)<br/>
                    <strong>Manual:</strong> Use os botões de geração a qualquer momento
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📤 Publicação Automática</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Dias:</strong> Segunda, Quarta, Sexta e Domingo<br/>
                    <strong>Horário:</strong> 9:00 BRT<br/>
                    <strong>Publica:</strong> Posts aprovados automaticamente<br/>
                    <strong>Funciona:</strong> Independente da geração automática
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Posts {filterStatus !== 'all' && `(${filterStatus})`}</CardTitle>
                  <CardDescription>
                    {bulkMode ? 'Selecione posts para ações em lote' : 'Clique em um post para visualizar'}
                  </CardDescription>
                </div>
                <BulkActions
                  bulkMode={bulkMode}
                  selectedCount={selectedPosts.size}
                  totalCount={posts.length}
                  allSelected={selectedPosts.size === posts.length}
                  loading={approving}
                  onToggleBulkMode={() => {
                    setBulkMode(!bulkMode)
                    setSelectedPosts(new Set())
                  }}
                  onSelectAll={handleSelectAll}
                  onBulkApprove={filterStatus === 'pending' ? handleBulkApprove : undefined}
                  onBulkReject={handleBulkReject}
                  onCancel={() => {
                    setSelectedPosts(new Set())
                    setBulkMode(false)
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <PostGrid
                posts={posts}
                loading={postsLoading}
                emptyMessage={
                  filterStatus === 'all' 
                    ? 'Nenhum post encontrado. Gere novos posts usando os botões acima!' 
                    : `Nenhum post ${filterStatus}.`
                }
                bulkMode={bulkMode}
                selectedIds={selectedPosts}
                onSelectPost={handleSelectPost}
                onPostClick={setSelectedPost}
                onEditPost={setEditingPost}
                onApprovePost={(post) => setPostToSchedule(post)}
                onRejectPost={handleReject}
              />
            </CardContent>
          </Card>

          {/* Modals */}
          <PostPreviewModal
            post={selectedPost}
            isPublishing={selectedPost ? approvingIds.has(selectedPost.id) : false}
            onClose={() => setSelectedPost(null)}
            onApprove={() => selectedPost && handleApprove(selectedPost)}
            onReject={() => selectedPost && handleReject(selectedPost)}
            onPublishNow={() => selectedPost && handlePublishNow(selectedPost)}
          />

          {editingPost && (
            <InstagramEditModal
              post={editingPost}
              isOpen={!!editingPost}
              onClose={() => setEditingPost(null)}
              onSave={handleSaveEdit}
            />
          )}

          <DALLEConfigModal
            open={showDALLEModal}
            onClose={() => setShowDALLEModal(false)}
            onGenerate={handleDALLEGenerate}
            mode="dalle"
          />

          <SmartGenerateModal
            open={showSmartModal}
            onOpenChange={setShowSmartModal}
            onSuccess={() => {
              refetchPosts()
              refetchStats()
            }}
          />

          {postToSchedule && (
            <ScheduleInstagramModal
              open={!!postToSchedule}
              onOpenChange={(open) => !open && setPostToSchedule(null)}
              post={postToSchedule}
              onSuccess={() => {
                refetchPosts()
                refetchStats()
              }}
            />
          )}
        </div>
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}
