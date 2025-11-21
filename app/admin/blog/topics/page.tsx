'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2, Edit, Search, RefreshCw, BarChart3, Clock, Link2, Zap } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = [
  'Automação e Negócios',
  'Programação e IA',
  'Cuidados Felinos',
  'Tech Aleatório'
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponíveis' },
  { value: 'used', label: 'Usados' },
  { value: 'blocked', label: 'Bloqueados' },
  { value: 'archived', label: 'Arquivados' }
]

interface Topic {
  id: string
  topic: string
  category: string
  status: string
  times_used: number
  last_used_at: string | null
  priority: number
  tags: string[]
  approved: boolean
  created_at: string
}

interface Stats {
  category: string
  total_topics: number
  available_topics: number
  used_topics: number
  blocked_topics: number
  never_used: number
  avg_times_used: number
  last_topic_used_at: string | null
}

interface DashboardStats {
  general: Stats[]
  mostUsed: Array<{
    id: string
    topic: string
    category: string
    times_used: number
    successful_posts: number
  }>
  recentUsage: {
    total: number
    successful: number
    failed: number
    successRate: string
    avgGenerationTimeMs: number
  }
  usageByDay: Array<{
    date: string
    count: number
  }>
  similarityBlocks: number
}

export default function TopicsManagementPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTopics, setTotalTopics] = useState(0)
  
  // Modal de criação/edição
  const [showModal, setShowModal] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [formData, setFormData] = useState({
    topic: '',
    category: 'Automação e Negócios',
    priority: 0,
    tags: '',
    approved: true
  })
  
  // Bulk create
  const [bulkTopics, setBulkTopics] = useState('')
  const [bulkCategory, setBulkCategory] = useState('Automação e Negócios')
  const [bulkCreating, setBulkCreating] = useState(false)

  // Fetch topics
  const fetchTopics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/blog/topics?${params}`)
      const data = await response.json()

      if (data.success) {
        setTopics(data.topics)
        setTotalPages(data.pagination.totalPages)
        setTotalTopics(data.pagination.total)
      } else {
        toast.error('Erro ao buscar tópicos')
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
      toast.error('Erro ao buscar tópicos')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const response = await fetch('/api/blog/topics/stats?period=30')
      const data = await response.json()

      if (data.success) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [currentPage, categoryFilter, statusFilter, searchQuery])

  useEffect(() => {
    fetchStats()
  }, [])

  // Create/Update topic
  const handleSaveTopic = async () => {
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const payload = {
        topic: formData.topic,
        category: formData.category,
        priority: formData.priority,
        tags: tagsArray,
        approved: formData.approved,
        ...(editingTopic && { id: editingTopic.id })
      }

      const response = await fetch('/api/blog/topics', {
        method: editingTopic ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingTopic ? 'Tópico atualizado!' : 'Tópico criado!')
        setShowModal(false)
        setEditingTopic(null)
        setFormData({
          topic: '',
          category: 'Automação e Negócios',
          priority: 0,
          tags: '',
          approved: true
        })
        fetchTopics()
        fetchStats()
      } else {
        toast.error(data.error || 'Erro ao salvar tópico')
      }
    } catch (error) {
      console.error('Error saving topic:', error)
      toast.error('Erro ao salvar tópico')
    }
  }

  // Delete topic
  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este tópico?')) return

    try {
      const response = await fetch(`/api/blog/topics?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Tópico deletado!')
        fetchTopics()
        fetchStats()
      } else {
        toast.error('Erro ao deletar tópico')
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
      toast.error('Erro ao deletar tópico')
    }
  }

  // Open edit modal
  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic)
    setFormData({
      topic: topic.topic,
      category: topic.category,
      priority: topic.priority,
      tags: topic.tags.join(', '),
      approved: topic.approved
    })
    setShowModal(true)
  }

  // Bulk create topics
  const handleBulkCreate = async () => {
    const topicLines = bulkTopics
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    if (topicLines.length === 0) {
      toast.error('Digite pelo menos um tópico')
      return
    }

    setBulkCreating(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const topicText of topicLines) {
        try {
          const response = await fetch('/api/blog/topics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: topicText,
              category: bulkCategory,
              priority: 0,
              tags: [],
              approved: true
            })
          })

          const data = await response.json()
          if (data.success) {
            successCount++
          } else {
            errorCount++
          }
        } catch {
          errorCount++
        }
      }

      toast.success(`${successCount} tópicos criados com sucesso!`)
      if (errorCount > 0) {
        toast.error(`${errorCount} tópicos falharam`)
      }

      setBulkTopics('')
      fetchTopics()
      fetchStats()
    } catch (error) {
      console.error('Error in bulk create:', error)
      toast.error('Erro ao criar tópicos em lote')
    } finally {
      setBulkCreating(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Tópicos</h1>
          <p className="text-muted-foreground">
            Sistema inteligente de tópicos com anti-similaridade
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Tópico
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="manage">
            <Edit className="mr-2 h-4 w-4" />
            Gerenciar
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="similarity">
            <Link2 className="mr-2 h-4 w-4" />
            Similaridades
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Plus className="mr-2 h-4 w-4" />
            Criar Lote
          </TabsTrigger>
          <TabsTrigger value="cron">
            <Zap className="mr-2 h-4 w-4" />
            CronJobs
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
              {/* Stats Cards */}
          {loadingStats ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : stats && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.general.map((stat) => (
                  <Card key={stat.category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">{stat.total_topics}</div>
                        <div className="text-xs text-muted-foreground">
                          {stat.available_topics} disponíveis • {stat.never_used} nunca usados
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Média de usos: {stat.avg_times_used.toFixed(1)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estatísticas de Uso (últimos 30 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Total Gerado</div>
                      <div className="text-2xl font-bold">{stats.recentUsage.total}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.recentUsage.successRate}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Tempo Médio</div>
                      <div className="text-2xl font-bold">
                        {(stats.recentUsage.avgGenerationTimeMs / 1000).toFixed(1)}s
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Bloqueios Ativos</div>
                      <div className="text-2xl font-bold">{stats.similarityBlocks}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-4">
          {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tópico..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                fetchTopics()
                fetchStats()
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tópicos ({totalTopics})</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tópico</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium max-w-md">
                        {topic.topic}
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {topic.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{topic.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            topic.status === 'available'
                              ? 'default'
                              : topic.status === 'used'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {topic.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{topic.times_used}x</Badge>
                      </TableCell>
                      <TableCell>{topic.priority}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {topic.last_used_at
                          ? new Date(topic.last_used_at).toLocaleDateString('pt-BR')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTopic(topic)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTopic(topic.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Uso (últimos 30 dias)</CardTitle>
              <CardDescription>
                Tópicos utilizados recentemente com status de geração
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em desenvolvimento... Mostrará histórico detalhado de uso dos tópicos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similarity Tab */}
        <TabsContent value="similarity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bloqueios de Similaridade</CardTitle>
              <CardDescription>
                Pares de tópicos similares (threshold {'>'}= 0.85)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total de bloqueios ativos: {stats?.similarityBlocks || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Em desenvolvimento... Mostrará lista de tópicos bloqueados por similaridade.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Create Tab */}
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Tópicos em Lote</CardTitle>
              <CardDescription>
                Adicione múltiplos tópicos de uma vez (um por linha)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select
                  value={bulkCategory}
                  onValueChange={setBulkCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tópicos (um por linha)
                </label>
                <Textarea
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Digite um tópico por linha, por exemplo:&#10;Como criar chatbots com IA para automatizar atendimento&#10;Estratégias de SEO local para pequenas empresas&#10;Ferramentas no-code para criar aplicações web"
                  value={bulkTopics}
                  onChange={(e) => setBulkTopics(e.target.value)}
                  disabled={bulkCreating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {bulkTopics.split('\n').filter(Boolean).length} tópicos prontos para criar
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleBulkCreate}
                  disabled={bulkCreating || !bulkTopics.trim()}
                  className="flex-1"
                >
                  {bulkCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar {bulkTopics.split('\n').filter(Boolean).length} Tópicos
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setBulkTopics('')}
                  disabled={bulkCreating}
                >
                  Limpar
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">💡 Dicas:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Embeddings OpenAI serão gerados automaticamente</li>
                  <li>• Sistema anti-similaridade ativado (threshold 0.85)</li>
                  <li>• Tópicos aprovados e prontos para uso imediato</li>
                  <li>• Prioridade padrão: 0 (pode editar depois)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CronJobs Tab */}
        <TabsContent value="cron" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CronJobs e Custos de API</CardTitle>
              <CardDescription>
                Execuções automáticas e custos de embeddings OpenAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em desenvolvimento... Mostrará schedule de execução e custos de API.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>
                {editingTopic ? 'Editar Tópico' : 'Novo Tópico'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tópico</label>
                <Input
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  placeholder="Ex: Como automatizar vendas com IA"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Prioridade</label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maior = mais prioritário
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="automação, vendas, marketing"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.approved}
                  onChange={(e) =>
                    setFormData({ ...formData, approved: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <label className="text-sm font-medium">Aprovado</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveTopic} className="flex-1">
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTopic(null)
                    setFormData({
                      topic: '',
                      category: 'Automação e Negócios',
                      priority: 0,
                      tags: '',
                      approved: true
                    })
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
