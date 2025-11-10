'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Eye, 
  Edit, 
  Archive, 
  Copy, 
  ExternalLink,
  TrendingUp,
  Users,
  MousePointerClick,
  Percent,
  Rocket,
  Loader2
} from 'lucide-react'
import { NICHES, COLOR_THEMES_ARRAY } from '@/lib/landing-pages-constants'
import { CreateLandingPageModal } from '@/components/admin/create-landing-page-modal'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'

interface LandingPage {
  id: string
  title: string
  slug: string
  niche: string
  theme_color: string
  headline: string
  subheadline: string
  hero_image_url: string
  deploy_url: string | null
  deploy_status: string
  views_count: number
  leads_count: number
  conversion_rate: number
  status: string
  created_at: string
  published_at: string | null
}

interface Stats {
  total: number
  published: number
  draft: number
  archived: number
  totalViews: number
  totalLeads: number
  avgConversion: string
}

export default function LandingPagesAdminPage() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deployingId, setDeployingId] = useState<string | null>(null)

  useEffect(() => {
    loadLandingPages()
  }, [])

  async function loadLandingPages() {
    try {
      setLoading(true)
      const response = await fetch('/api/landing-pages/list')
      const data = await response.json()
      
      if (data.success) {
        setLandingPages(data.landingPages)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar landing pages:', error)
    } finally {
      setLoading(false)
    }
  }

  function getNicheLabel(value: string) {
    return NICHES.find(n => n.value === value)?.label || value
  }

  function getNicheEmoji(value: string) {
    return NICHES.find(n => n.value === value)?.emoji || '📄'
  }

  function getThemeColors(value: string) {
    return COLOR_THEMES_ARRAY.find(t => t.value === value) || COLOR_THEMES_ARRAY[0]
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Rascunho', variant: 'secondary' },
      published: { label: 'Publicada', variant: 'default' },
      archived: { label: 'Arquivada', variant: 'outline' },
    }
    const config = variants[status] || variants.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  function getDeployStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      deploying: { label: 'Deployando...', variant: 'outline' },
      published: { label: 'Online', variant: 'default' },
      failed: { label: 'Erro', variant: 'destructive' },
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  async function handleDeploy(landingPageId: string) {
    try {
      setDeployingId(landingPageId)
      
      const response = await fetch('/api/landing-pages/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer deploy')
      }

      // Recarregar lista
      await loadLandingPages()
      
      // Mostrar sucesso
      alert(`✅ Deploy realizado com sucesso!\n\nURL: ${data.deployUrl}`)
      
    } catch (error: any) {
      console.error('Erro ao fazer deploy:', error)
      alert(`❌ Erro ao fazer deploy: ${error.message}`)
    } finally {
      setDeployingId(null)
    }
  }

  async function handleArchive(landingPageId: string) {
    const confirmed = confirm('🗄️ Arquivar esta landing page?\n\nEla será marcada como arquivada mas os dados serão preservados.')
    if (!confirmed) return

    try {
      const response = await fetch('/api/landing-pages/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao arquivar')
      }

      // Recarregar lista
      await loadLandingPages()
      
      alert('✅ Landing page arquivada com sucesso!')
      
    } catch (error: any) {
      console.error('Erro ao arquivar:', error)
      alert(`❌ Erro ao arquivar: ${error.message}`)
    }
  }

  async function handleRelaunch(landingPageId: string, newDeploy: boolean = false) {
    const message = newDeploy
      ? '🚀 Relançar com NOVO deploy?\n\nSerá criado um novo projeto no Vercel.'
      : '🔄 Relançar usando o deploy existente?\n\nRecomendado para manter SEO.'
    
    const confirmed = confirm(message)
    if (!confirmed) return

    try {
      setDeployingId(landingPageId)

      const response = await fetch('/api/landing-pages/relaunch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageId, newDeploy })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao relançar')
      }

      // Recarregar lista
      await loadLandingPages()
      
      alert(`✅ Landing page relançada!\n\nURL: ${data.data.deploy_url}`)
      
    } catch (error: any) {
      console.error('Erro ao relançar:', error)
      alert(`❌ Erro ao relançar: ${error.message}`)
    } finally {
      setDeployingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <AdminLayoutWrapper
      title="Landing Pages"
      description="Geração automática com IA para captura de leads"
    >
      <div className="space-y-6">
        {/* Header com botão */}
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nova Landing Page
          </Button>
        </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Páginas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.published} publicadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Total de pageviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Capturados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                Leads qualificados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversão Média</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgConversion}%</div>
              <p className="text-xs text-muted-foreground">
                Taxa de conversão
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Landing Pages List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {landingPages.map((lp) => {
          const theme = getThemeColors(lp.theme_color)
          return (
            <Card key={lp.id} className="overflow-hidden">
              <div 
                className="h-32 bg-gradient-to-br from-purple-500 to-pink-500"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                }}
              >
                {lp.hero_image_url && (
                  <img 
                    src={lp.hero_image_url} 
                    alt={lp.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {getNicheEmoji(lp.niche)} {lp.headline}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {lp.subheadline}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  {getStatusBadge(lp.status)}
                  {getDeployStatusBadge(lp.deploy_status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nicho:</span>
                  <span className="font-medium">{getNicheLabel(lp.niche)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold">{lp.views_count}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lp.leads_count}</div>
                    <div className="text-xs text-muted-foreground">Leads</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lp.conversion_rate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Conv.</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`/lp/${lp.slug}`} target="_blank">
                        <Eye className="mr-1 h-4 w-4" />
                        Preview
                      </a>
                    </Button>
                    
                    {lp.deploy_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={lp.deploy_url} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Botão Deploy */}
                  {lp.deploy_status === 'pending' || lp.deploy_status === 'failed' ? (
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                      onClick={() => handleDeploy(lp.id)}
                      disabled={deployingId === lp.id}
                    >
                      {deployingId === lp.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deployando...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-4 w-4" />
                          Deploy na Vercel
                        </>
                      )}
                    </Button>
                  ) : null}

                  {/* Botão Archive (se publicada) */}
                  {lp.status === 'published' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleArchive(lp.id)}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Arquivar
                    </Button>
                  )}

                  {/* Botão Relaunch (se arquivada) */}
                  {lp.status === 'archived' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                        onClick={() => handleRelaunch(lp.id, false)}
                        disabled={deployingId === lp.id}
                      >
                        {deployingId === lp.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Rocket className="mr-2 h-4 w-4" />
                        )}
                        Relançar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRelaunch(lp.id, true)}
                        disabled={deployingId === lp.id}
                        title="Novo deploy"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {landingPages.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma landing page criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira landing page com IA em menos de 2 minutos!
            </p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Landing Page
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação */}
      <CreateLandingPageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          loadLandingPages()
        }}
      />
      </div>
    </AdminLayoutWrapper>
  )
}
