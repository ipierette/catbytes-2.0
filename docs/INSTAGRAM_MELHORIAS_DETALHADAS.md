# 🚀 Instagram Admin - Melhorias Detalhadas

## 📅 Propostas de Implementação - Janeiro 2025

---

## 1. 📋 **TEMPLATES PRÉ-DEFINIDOS**

### 🎯 **Conceito**
Templates são layouts prontos com textos posicionados e estilizados profissionalmente. O usuário escolhe um template e ele aplica automaticamente várias camadas de texto com posições, tamanhos, cores e fontes pré-configuradas.

### 💡 **Como Funcionaria**

#### A) **Galeria de Templates**
```tsx
const TEMPLATES = [
  {
    id: 'titulo-subtitulo',
    name: '📌 Título + Subtítulo',
    preview: '/templates/preview-1.png',
    description: 'Título grande no topo, subtítulo menor embaixo',
    layers: [
      {
        text: 'SEU TÍTULO AQUI',
        x: 50,
        y: 80,
        fontSize: 72,
        fontFamily: 'Impact',
        color: '#FFFFFF',
        bold: true,
        italic: false,
        rotation: 0
      },
      {
        text: 'Seu subtítulo aqui',
        x: 50,
        y: 180,
        fontSize: 36,
        fontFamily: 'Arial',
        color: '#FFD700',
        bold: false,
        italic: false,
        rotation: 0
      }
    ]
  },
  {
    id: 'destaque-central',
    name: '⭐ Destaque Central',
    preview: '/templates/preview-2.png',
    description: 'Texto grande e chamativo no centro',
    layers: [
      {
        text: 'OFERTA\nIMPERDÍVEL',
        x: 150,
        y: 300,
        fontSize: 96,
        fontFamily: 'Impact',
        color: '#FF0000',
        bold: true,
        italic: false,
        rotation: -5
      },
      {
        text: 'Aproveite agora!',
        x: 200,
        y: 500,
        fontSize: 40,
        fontFamily: 'Arial',
        color: '#FFFFFF',
        bold: true,
        italic: false,
        rotation: 0
      }
    ]
  },
  {
    id: 'lista-3-pontos',
    name: '📝 Lista de 3 Pontos',
    preview: '/templates/preview-3.png',
    description: 'Três pontos principais destacados',
    layers: [
      {
        text: '✓ PONTO 1',
        x: 80,
        y: 150,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#00FF00',
        bold: true,
        italic: false,
        rotation: 0
      },
      {
        text: '✓ PONTO 2',
        x: 80,
        y: 350,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#00FF00',
        bold: true,
        italic: false,
        rotation: 0
      },
      {
        text: '✓ PONTO 3',
        x: 80,
        y: 550,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#00FF00',
        bold: true,
        italic: false,
        rotation: 0
      }
    ]
  },
  {
    id: 'antes-depois',
    name: '⚡ Antes vs Depois',
    preview: '/templates/preview-4.png',
    description: 'Comparação visual em duas colunas',
    layers: [
      {
        text: 'ANTES',
        x: 100,
        y: 80,
        fontSize: 56,
        fontFamily: 'Impact',
        color: '#FF0000',
        bold: true,
        italic: false,
        rotation: 0
      },
      {
        text: 'DEPOIS',
        x: 550,
        y: 80,
        fontSize: 56,
        fontFamily: 'Impact',
        color: '#00FF00',
        bold: true,
        italic: false,
        rotation: 0
      }
    ]
  },
  {
    id: 'dica-do-dia',
    name: '💡 Dica do Dia',
    preview: '/templates/preview-5.png',
    description: 'Header + conteúdo da dica',
    layers: [
      {
        text: '💡 DICA DO DIA',
        x: 80,
        y: 50,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#FFD700',
        bold: true,
        italic: false,
        rotation: 0
      },
      {
        text: 'Sua dica\naqui em\nmúltiplas\nlinhas',
        x: 80,
        y: 200,
        fontSize: 56,
        fontFamily: 'Impact',
        color: '#FFFFFF',
        bold: true,
        italic: false,
        rotation: 0
      }
    ]
  },
  {
    id: 'chamada-acao',
    name: '🎯 Call to Action',
    preview: '/templates/preview-6.png',
    description: 'Frase de impacto + CTA',
    layers: [
      {
        text: 'PRONTO PARA\nMUDAR SUA VIDA?',
        x: 100,
        y: 150,
        fontSize: 64,
        fontFamily: 'Impact',
        color: '#FFFFFF',
        bold: true,
        italic: false,
        rotation: 0
      },
      {
        text: '👉 CLIQUE NO LINK',
        x: 150,
        y: 400,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#00FF00',
        bold: true,
        italic: false,
        rotation: 0
      }
    ]
  }
]
```

#### B) **Interface no Editor**
```tsx
// Nova aba no editor: "🎨 Templates"
<TabsContent value="templates" className="flex-1 overflow-auto mt-4">
  <div className="space-y-4">
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">📋 Como usar Templates</h3>
      <p className="text-sm text-muted-foreground">
        Escolha um template abaixo para aplicar um layout profissional instantaneamente.
        Você pode editar todos os textos depois de aplicar o template.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TEMPLATES.map(template => (
        <Card 
          key={template.id}
          className="cursor-pointer hover:border-primary transition-all"
          onClick={() => applyTemplate(template)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                {template.name.split(' ')[0]}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{template.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{template.layers.length} camadas</span>
                  <span>•</span>
                  <span>1 clique</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Button 
      variant="outline" 
      className="w-full"
      onClick={() => setShowCustomTemplateBuilder(true)}
    >
      ➕ Criar Meu Próprio Template
    </Button>
  </div>
</TabsContent>
```

#### C) **Função de Aplicar Template**
```tsx
const applyTemplate = (template: Template) => {
  // Confirmar se quer substituir layers existentes
  if (textLayers.length > 0) {
    const confirm = window.confirm(
      `Você tem ${textLayers.length} camada(s) de texto. Deseja substituí-las pelo template?`
    )
    if (!confirm) return
  }

  // Aplicar layers do template
  const newLayers = template.layers.map((layer, index) => ({
    ...layer,
    id: `template-${Date.now()}-${index}`,
  }))

  setTextLayers(newLayers)
  setSelectedLayer(newLayers[0]?.id || null)
  setActiveTab('image') // Voltar para aba de edição
  
  setMessage({
    type: 'success',
    text: `✅ Template "${template.name}" aplicado! Agora você pode editar os textos.`
  })
}
```

#### D) **Salvar Templates Personalizados**
```tsx
const saveAsTemplate = async () => {
  const templateName = prompt('Nome do seu template:')
  if (!templateName) return

  const newTemplate = {
    id: `custom-${Date.now()}`,
    name: `⭐ ${templateName}`,
    description: 'Template personalizado',
    isCustom: true,
    layers: textLayers.map(layer => ({
      text: layer.text,
      x: layer.x,
      y: layer.y,
      fontSize: layer.fontSize,
      fontFamily: layer.fontFamily,
      color: layer.color,
      bold: layer.bold,
      italic: layer.italic,
      rotation: layer.rotation
    }))
  }

  // Salvar no localStorage ou banco
  const saved = await saveCustomTemplate(newTemplate)
  
  if (saved) {
    alert('✅ Template salvo com sucesso!')
  }
}
```

### 🎁 **Benefícios**
- ✅ **Velocidade:** Criar posts profissionais em segundos
- ✅ **Consistência:** Manter padrão visual da marca
- ✅ **Inspiração:** Para quem não sabe por onde começar
- ✅ **Produtividade:** Reduz tempo de design em 70%
- ✅ **Personalização:** Pode editar tudo após aplicar

---

## 2. ⚡ **AÇÕES EM LOTE MELHORADAS**

### 🎯 **Conceito**
Expandir as ações em lote além de apenas "Rejeitar", permitindo aprovar, agendar, publicar e até editar múltiplos posts simultaneamente.

### 💡 **Como Funcionaria**

#### A) **Painel de Ações em Lote**
```tsx
// Quando bulkMode = true
<Card className="mb-6 border-primary">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <CheckSquare className="h-5 w-5" />
      Modo de Seleção em Lote
      <Badge variant="secondary">{selectedPosts.size} selecionados</Badge>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Aprovar em Lote */}
      <Button
        onClick={handleBulkApprove}
        className="gap-2"
        disabled={selectedPosts.size === 0}
      >
        <CheckCircle className="h-4 w-4" />
        Aprovar ({selectedPosts.size})
      </Button>

      {/* Rejeitar em Lote */}
      <Button
        variant="destructive"
        onClick={handleBulkReject}
        className="gap-2"
        disabled={selectedPosts.size === 0}
      >
        <XCircle className="h-4 w-4" />
        Rejeitar ({selectedPosts.size})
      </Button>

      {/* Publicar Agora em Lote */}
      <Button
        variant="secondary"
        onClick={handleBulkPublishNow}
        className="gap-2"
        disabled={selectedPosts.size === 0}
      >
        <Send className="h-4 w-4" />
        Publicar ({selectedPosts.size})
      </Button>

      {/* Agendar para Data Específica */}
      <Button
        variant="outline"
        onClick={() => setShowBulkScheduleDialog(true)}
        className="gap-2"
        disabled={selectedPosts.size === 0}
      >
        <Calendar className="h-4 w-4" />
        Agendar ({selectedPosts.size})
      </Button>

      {/* Mudar Nicho em Lote */}
      <Button
        variant="outline"
        onClick={() => setShowBulkChangeNicheDialog(true)}
        className="gap-2"
        disabled={selectedPosts.size === 0}
      >
        <Tag className="h-4 w-4" />
        Mudar Nicho
      </Button>

      {/* Editar Caption em Lote */}
      <Button
        variant="outline"
        onClick={() => setShowBulkEditCaptionDialog(true)}
        className="gap-2"
        disabled={selectedPosts.size === 0}
      >
        <Edit className="h-4 w-4" />
        Editar Captions
      </Button>

      {/* Deletar Permanentemente */}
      <Button
        variant="destructive"
        onClick={handleBulkDelete}
        className="gap-2"
        disabled={selectedPosts.size === 0}
      >
        <Trash2 className="h-4 w-4" />
        Deletar ({selectedPosts.size})
      </Button>

      {/* Exportar Selecionados */}
      <Button
        variant="outline"
        onClick={handleBulkExport}
        className="gap-2"
        disabled={selectedPosts.size === 0}
      >
        <Download className="h-4 w-4" />
        Exportar
      </Button>
    </div>

    {/* Progresso de Ações em Lote */}
    {bulkActionProgress && (
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span>{bulkActionProgress.action}</span>
          <span>{bulkActionProgress.current}/{bulkActionProgress.total}</span>
        </div>
        <Progress value={(bulkActionProgress.current / bulkActionProgress.total) * 100} />
      </div>
    )}
  </CardContent>
</Card>
```

#### B) **Aprovar em Lote**
```tsx
const handleBulkApprove = async () => {
  if (selectedPosts.size === 0) return

  const confirmed = confirm(
    `Deseja aprovar ${selectedPosts.size} posts selecionados?\n\n` +
    `Eles serão agendados automaticamente para publicação.`
  )
  if (!confirmed) return

  setBulkActionProgress({
    action: 'Aprovando posts...',
    current: 0,
    total: selectedPosts.size
  })

  const promises = Array.from(selectedPosts).map(async (postId, index) => {
    try {
      const response = await fetch(`/api/instagram/approve/${postId}`, {
        method: 'POST'
      })
      
      setBulkActionProgress(prev => prev ? {
        ...prev,
        current: index + 1
      } : null)

      return { postId, success: response.ok }
    } catch (error) {
      return { postId, success: false, error }
    }
  })

  const results = await Promise.allSettled(promises)
  const successful = results.filter(r => 
    r.status === 'fulfilled' && r.value.success
  ).length

  setBulkActionProgress(null)
  setSelectedPosts(new Set())
  setBulkMode(false)

  setMessage({
    type: 'success',
    text: `✅ ${successful} de ${selectedPosts.size} posts aprovados com sucesso!`
  })

  await loadData()
}
```

#### C) **Agendar para Data Específica**
```tsx
// Dialog para escolher data/hora
const BulkScheduleDialog = () => {
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date())
  const [scheduleTime, setScheduleTime] = useState('13:00')

  const handleSchedule = async () => {
    const scheduledFor = new Date(scheduleDate)
    const [hours, minutes] = scheduleTime.split(':')
    scheduledFor.setHours(parseInt(hours), parseInt(minutes))

    // Agendar todos os posts selecionados para mesma data/hora
    const promises = Array.from(selectedPosts).map(postId =>
      fetch(`/api/instagram/schedule/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledFor: scheduledFor.toISOString() })
      })
    )

    await Promise.all(promises)
    setShowBulkScheduleDialog(false)
    await loadData()
  }

  return (
    <Dialog open={showBulkScheduleDialog} onOpenChange={setShowBulkScheduleDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar {selectedPosts.size} Posts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Data</Label>
            <Input
              type="date"
              value={scheduleDate.toISOString().split('T')[0]}
              onChange={(e) => setScheduleDate(new Date(e.target.value))}
            />
          </div>
          <div>
            <Label>Horário</Label>
            <Input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Todos os {selectedPosts.size} posts serão agendados para {
                scheduleDate.toLocaleDateString('pt-BR')
              } às {scheduleTime}
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowBulkScheduleDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSchedule}>
            Agendar Posts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

#### D) **Editar Caption em Lote (Find & Replace)**
```tsx
const BulkEditCaptionDialog = () => {
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [appendText, setAppendText] = useState('')

  const handleBulkEdit = async () => {
    const operations = []

    if (findText && replaceText) {
      // Find and Replace
      operations.push({
        type: 'replace',
        find: findText,
        replace: replaceText
      })
    }

    if (appendText) {
      // Adicionar texto no final
      operations.push({
        type: 'append',
        text: appendText
      })
    }

    // Aplicar operações em todos os posts selecionados
    const promises = Array.from(selectedPosts).map(async postId => {
      const post = pendingPosts.find(p => p.id === postId)
      if (!post) return

      let newCaption = post.caption

      operations.forEach(op => {
        if (op.type === 'replace') {
          newCaption = newCaption.replace(new RegExp(op.find, 'g'), op.replace)
        } else if (op.type === 'append') {
          newCaption += '\n\n' + op.text
        }
      })

      return fetch(`/api/instagram/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: newCaption })
      })
    })

    await Promise.all(promises)
    setShowBulkEditCaptionDialog(false)
    await loadData()
  }

  return (
    <Dialog open={showBulkEditCaptionDialog} onOpenChange={setShowBulkEditCaptionDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Captions em Lote ({selectedPosts.size} posts)</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="replace">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="replace">Substituir Texto</TabsTrigger>
            <TabsTrigger value="append">Adicionar Texto</TabsTrigger>
          </TabsList>
          
          <TabsContent value="replace" className="space-y-4">
            <div>
              <Label>Encontrar</Label>
              <Input
                placeholder="Texto para procurar..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
              />
            </div>
            <div>
              <Label>Substituir por</Label>
              <Input
                placeholder="Novo texto..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
            </div>
            <Alert>
              <AlertDescription>
                Exemplo: Trocar "#empreendedorismo" por "#empreendedor"
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="append" className="space-y-4">
            <div>
              <Label>Texto a adicionar no final</Label>
              <Textarea
                placeholder="Será adicionado no final de todas as captions..."
                value={appendText}
                onChange={(e) => setAppendText(e.target.value)}
                rows={4}
              />
            </div>
            <Alert>
              <AlertDescription>
                Exemplo: Adicionar "Siga para mais conteúdo!" em todos
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowBulkEditCaptionDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleBulkEdit}>
            Aplicar em {selectedPosts.size} Posts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 🎁 **Benefícios**
- ✅ **Eficiência:** Processar dezenas de posts em minutos
- ✅ **Controle:** Ações precisas em múltiplos posts
- ✅ **Flexibilidade:** Várias operações disponíveis
- ✅ **Segurança:** Confirmações antes de ações destrutivas
- ✅ **Progresso:** Barra visual de progresso das operações

---

## 3. 📱 **PREVIEW MULTI-DISPOSITIVO**

### 🎯 **Conceito**
Visualizar como o post aparecerá em diferentes formatos do Instagram: Feed (1:1), Stories (9:16), Reels (9:16), e até em diferentes tamanhos de tela.

### 💡 **Como Funcionaria**

#### A) **Tabs de Preview por Formato**
```tsx
<TabsContent value="preview" className="flex-1 overflow-auto mt-4">
  <Tabs defaultValue="feed" className="w-full">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="feed" className="gap-2">
        📱 Feed
      </TabsTrigger>
      <TabsTrigger value="stories" className="gap-2">
        📖 Stories
      </TabsTrigger>
      <TabsTrigger value="reels" className="gap-2">
        🎬 Reels
      </TabsTrigger>
      <TabsTrigger value="carousel" className="gap-2">
        🎠 Carrossel
      </TabsTrigger>
    </TabsList>

    {/* Feed - Formato Quadrado 1:1 */}
    <TabsContent value="feed">
      <div className="max-w-md mx-auto">
        <InstagramFeedPreview post={editedPost} textLayers={textLayers} />
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">📱 Instagram Feed</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Formato: 1080 x 1080px (1:1)</li>
            <li>• Aparece no feed principal</li>
            <li>• Melhor para imagens quadradas</li>
            <li>• Suporta até 10 imagens em carrossel</li>
          </ul>
        </div>
      </div>
    </TabsContent>

    {/* Stories - Formato Vertical 9:16 */}
    <TabsContent value="stories">
      <div className="max-w-sm mx-auto">
        <InstagramStoriesPreview post={editedPost} textLayers={textLayers} />
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">📖 Instagram Stories</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Formato: 1080 x 1920px (9:16)</li>
            <li>• Aparece por 24 horas</li>
            <li>• Pode adicionar stickers, enquetes, links</li>
            <li>• Imagem será cropada vertical</li>
          </ul>
        </div>
      </div>
    </TabsContent>

    {/* Reels - Formato Vertical 9:16 */}
    <TabsContent value="reels">
      <div className="max-w-sm mx-auto">
        <InstagramReelsPreview post={editedPost} textLayers={textLayers} />
        <div className="mt-4 p-4 bg-pink-50 dark:bg-pink-950 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">🎬 Instagram Reels</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Formato: 1080 x 1920px (9:16)</li>
            <li>• Ideal para vídeos curtos</li>
            <li>• Maior alcance que posts normais</li>
            <li>• Textos devem ser legíveis rapidamente</li>
          </ul>
        </div>
      </div>
    </TabsContent>

    {/* Carrossel - Múltiplas Imagens */}
    <TabsContent value="carousel">
      <div className="max-w-md mx-auto">
        <Alert className="mb-4">
          <AlertDescription>
            Em posts carrossel, sua imagem será slide 1. 
            Configure os outros slides em "Configurações Avançadas".
          </AlertDescription>
        </Alert>
        <InstagramCarouselPreview post={editedPost} textLayers={textLayers} />
      </div>
    </TabsContent>
  </Tabs>
</TabsContent>
```

#### B) **Componente Stories Preview**
```tsx
const InstagramStoriesPreview = ({ post, textLayers }) => {
  return (
    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-1 rounded-2xl">
      <div className="bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
        {/* Header Stories */}
        <div className="p-3 flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <span className="text-white text-sm font-semibold">catbytes.site</span>
          <span className="text-white/70 text-xs ml-auto">agora</span>
        </div>

        {/* Imagem com crop vertical */}
        <div className="relative" style={{ height: 'calc(100% - 120px)' }}>
          <img
            src={post.image_url}
            alt={post.titulo}
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center'
            }}
          />

          {/* Text Layers ajustados para stories */}
          {textLayers.map(layer => {
            const storiesScale = 1.78 // 1920/1080
            return (
              <div
                key={`stories-${layer.id}`}
                className="absolute"
                style={{
                  left: `${layer.x * 0.5}px`,
                  top: `${layer.y * storiesScale * 0.5}px`,
                  fontSize: `${layer.fontSize * 0.8}px`,
                  fontFamily: layer.fontFamily,
                  color: layer.color,
                  fontWeight: layer.bold ? 'bold' : 'normal',
                  fontStyle: layer.italic ? 'italic' : 'normal',
                  transform: `rotate(${layer.rotation}deg)`,
                  textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-wrap',
                  maxWidth: '80%'
                }}
              >
                {layer.text}
              </div>
            )
          })}
        </div>

        {/* Barra de resposta stories */}
        <div className="p-3 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent">
          <input
            type="text"
            placeholder="Envie uma mensagem..."
            className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 px-4 py-2 rounded-full text-sm"
            disabled
          />
          <Heart className="w-6 h-6 text-white" />
          <Send className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
```

#### C) **Botão para Exportar em Cada Formato**
```tsx
<div className="flex gap-2 mt-4">
  <Button
    variant="outline"
    onClick={() => exportAsFormat('feed')}
    className="gap-2"
  >
    <Download className="h-4 w-4" />
    Baixar para Feed (1:1)
  </Button>
  <Button
    variant="outline"
    onClick={() => exportAsFormat('stories')}
    className="gap-2"
  >
    <Download className="h-4 w-4" />
    Baixar para Stories (9:16)
  </Button>
  <Button
    variant="outline"
    onClick={() => exportAsFormat('reels')}
    className="gap-2"
  >
    <Download className="h-4 w-4" />
    Baixar para Reels (9:16)
  </Button>
</div>
```

#### D) **Função para Renderizar em Diferentes Tamanhos**
```tsx
const exportAsFormat = async (format: 'feed' | 'stories' | 'reels') => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Definir dimensões baseado no formato
  const dimensions = {
    feed: { width: 1080, height: 1080 },
    stories: { width: 1080, height: 1920 },
    reels: { width: 1080, height: 1920 }
  }

  canvas.width = dimensions[format].width
  canvas.height = dimensions[format].height

  // Carregar imagem
  const img = new window.Image()
  img.crossOrigin = 'anonymous'
  await new Promise((resolve) => {
    img.onload = resolve
    img.src = post.image_url
  })

  // Desenhar imagem com crop apropriado
  if (format === 'feed') {
    // Quadrado - crop center
    const size = Math.min(img.width, img.height)
    const x = (img.width - size) / 2
    const y = (img.height - size) / 2
    ctx.drawImage(img, x, y, size, size, 0, 0, 1080, 1080)
  } else {
    // Vertical - crop center
    const targetRatio = 9 / 16
    const imgRatio = img.width / img.height
    
    if (imgRatio > targetRatio) {
      // Imagem muito larga, crop horizontal
      const newWidth = img.height * targetRatio
      const x = (img.width - newWidth) / 2
      ctx.drawImage(img, x, 0, newWidth, img.height, 0, 0, 1080, 1920)
    } else {
      // Imagem muito alta, crop vertical
      const newHeight = img.width / targetRatio
      const y = (img.height - newHeight) / 2
      ctx.drawImage(img, 0, y, img.width, newHeight, 0, 0, 1080, 1920)
    }
  }

  // Desenhar text layers com ajuste de escala
  const scale = format === 'feed' ? 1 : 1.78
  textLayers.forEach(layer => {
    ctx.save()
    // ... desenhar textos com escala ajustada
    ctx.restore()
  })

  // Download
  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `${post.titulo}-${format}.png`
  link.href = dataUrl
  link.click()
}
```

### 🎁 **Benefícios**
- ✅ **Versatilidade:** Um post para múltiplos formatos
- ✅ **Profissionalismo:** Ver exatamente como vai aparecer
- ✅ **Economia:** Não precisa criar versões separadas
- ✅ **Otimização:** Ajustar textos para cada formato
- ✅ **Export:** Baixar em todos os formatos necessários

---

## 4. 🤖 **IA CONTEXTUAL MELHORADA**

### 🎯 **Conceito**
IA que não apenas sugere textos genéricos, mas analisa o contexto do nicho, histórico de engagement, tendências atuais e fornece sugestões personalizadas e dados acionáveis.

### 💡 **Como Funcionaria**

#### A) **Análise Inteligente do Post**
```tsx
const analyzePost = async (post: InstagramPost) => {
  const response = await fetch('/api/instagram/ai-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nicho: post.nicho,
      titulo: post.titulo,
      caption: post.caption,
      texto_imagem: post.texto_imagem,
      historicalData: await getHistoricalEngagement(post.nicho)
    })
  })

  return await response.json()
  // Retorna:
  // {
  //   score: 85, // 0-100
  //   strengths: ['Bom uso de emojis', 'Call-to-action claro'],
  //   improvements: ['Caption poderia ser mais curta', 'Falta hashtags'],
  //   suggestions: {
  //     caption: '...',
  //     hashtags: ['#tech', '#inovacao'],
  //     bestTimeToPost: '18:00',
  //     predictedReach: '~2.5k impressões'
  //   }
  // }
}
```

#### B) **Painel de IA no Editor**
```tsx
<Card className="mt-4 border-purple-200 dark:border-purple-800">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-purple-500" />
      Análise Inteligente do Post
      {aiAnalysis && (
        <Badge variant={aiAnalysis.score >= 80 ? 'default' : 'secondary'}>
          Score: {aiAnalysis.score}/100
        </Badge>
      )}
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Loading */}
    {analyzingAI && (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Analisando seu post com IA...
      </div>
    )}

    {/* Análise Completa */}
    {aiAnalysis && (
      <>
        {/* Pontos Fortes */}
        {aiAnalysis.strengths.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Pontos Fortes
            </h4>
            <ul className="text-sm space-y-1">
              {aiAnalysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Melhorias Sugeridas */}
        {aiAnalysis.improvements.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-orange-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pode Melhorar
            </h4>
            <ul className="text-sm space-y-1">
              {aiAnalysis.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sugestões Aplicáveis */}
        <div>
          <h4 className="font-semibold text-sm mb-2 text-purple-600 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Sugestões da IA
          </h4>

          {/* Caption Melhorada */}
          {aiAnalysis.suggestions.caption && (
            <div className="space-y-2 mb-3">
              <Label className="text-xs">Caption Otimizada:</Label>
              <div className="bg-muted p-3 rounded-lg text-sm">
                {aiAnalysis.suggestions.caption}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditedPost(prev => ({
                    ...prev,
                    caption: aiAnalysis.suggestions.caption
                  }))
                }}
                className="w-full gap-2"
              >
                <Wand2 className="h-3 w-3" />
                Aplicar Caption Sugerida
              </Button>
            </div>
          )}

          {/* Hashtags Sugeridas */}
          {aiAnalysis.suggestions.hashtags?.length > 0 && (
            <div className="space-y-2 mb-3">
              <Label className="text-xs">Hashtags Recomendadas:</Label>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.suggestions.hashtags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      setEditedPost(prev => ({
                        ...prev,
                        caption: prev.caption + `\n#${tag}`
                      }))
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const hashtags = aiAnalysis.suggestions.hashtags
                    .map(tag => `#${tag}`)
                    .join(' ')
                  setEditedPost(prev => ({
                    ...prev,
                    caption: prev.caption + '\n\n' + hashtags
                  }))
                }}
                className="w-full gap-2"
              >
                <Plus className="h-3 w-3" />
                Adicionar Todas as Hashtags
              </Button>
            </div>
          )}

          {/* Melhor Horário */}
          {aiAnalysis.suggestions.bestTimeToPost && (
            <Alert className="mb-3">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Melhor horário:</strong> {aiAnalysis.suggestions.bestTimeToPost}
                <br />
                <span className="text-xs text-muted-foreground">
                  Baseado no histórico de engagement do seu nicho
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Previsão de Alcance */}
          {aiAnalysis.suggestions.predictedReach && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Alcance previsto:</strong> {aiAnalysis.suggestions.predictedReach}
                <br />
                <span className="text-xs text-muted-foreground">
                  Estimativa baseada em posts similares
                </span>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Botão para Re-analisar */}
        <Button
          variant="outline"
          onClick={() => analyzePostWithAI()}
          className="w-full gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Re-analisar Post
        </Button>
      </>
    )}

    {/* Primeira Análise */}
    {!aiAnalysis && !analyzingAI && (
      <Button
        onClick={() => analyzePostWithAI()}
        className="w-full gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Analisar com IA
      </Button>
    )}
  </CardContent>
</Card>
```

#### C) **Endpoint de IA Contextual**
```typescript
// /app/api/instagram/ai-analyze/route.ts
export async function POST(request: NextRequest) {
  const { nicho, titulo, caption, texto_imagem, historicalData } = await request.json()

  // Análise por IA (OpenAI, Claude, etc.)
  const prompt = `
Analise este post do Instagram e forneça feedback acionável:

**Nicho:** ${nicho}
**Título:** ${titulo}
**Texto da Imagem:** ${texto_imagem}
**Caption:** ${caption}

**Dados Históricos:**
- Posts similares tiveram em média ${historicalData.avgLikes} likes
- Melhor horário de postagem: ${historicalData.bestHour}:00
- Hashtags que performaram bem: ${historicalData.topHashtags.join(', ')}

Por favor, forneça:
1. Score de 0-100 para qualidade do post
2. 3-5 pontos fortes
3. 3-5 melhorias sugeridas
4. Caption otimizada (mantendo tom e essência)
5. 10-15 hashtags relevantes
6. Melhor horário para postar
7. Previsão de alcance

Formato de resposta em JSON.
`

  const aiResponse = await callAI(prompt)
  
  return NextResponse.json(aiResponse)
}
```

#### D) **Análise de Tendências**
```tsx
// Mostrar trending topics do nicho
<Card className="mb-4">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      🔥 Tendências em {nicheNames[post.nicho]}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {trendingTopics.map((topic, i) => (
        <div key={i} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="font-medium">#{topic.name}</span>
          </div>
          <Badge variant="secondary">
            +{topic.growth}% esta semana
          </Badge>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

#### E) **Comparação com Concorrentes**
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      📊 Benchmark do Nicho
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{caption.length}</div>
          <div className="text-xs text-muted-foreground">Caracteres</div>
          <div className="text-xs text-green-500">
            Média do nicho: {benchmarkData.avgCaptionLength}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{countEmojis(caption)}</div>
          <div className="text-xs text-muted-foreground">Emojis</div>
          <div className="text-xs text-green-500">
            Média do nicho: {benchmarkData.avgEmojis}
          </div>
        </div>
      </div>
      
      <Alert>
        <AlertDescription className="text-xs">
          Posts com {benchmarkData.optimalHashtagCount} hashtags 
          performam {benchmarkData.hashtagBoost}% melhor neste nicho
        </AlertDescription>
      </Alert>
    </div>
  </CardContent>
</Card>
```

### 🎁 **Benefícios**
- ✅ **Inteligência:** Sugestões baseadas em dados reais
- ✅ **Personalização:** Adaptado ao seu nicho específico
- ✅ **Otimização:** Melhorar engagement automaticamente
- ✅ **Aprendizado:** Entender o que funciona
- ✅ **Previsibilidade:** Estimar resultados antes de postar

---

## 🎯 **RESUMO DAS 4 MELHORIAS**

| Melhoria | Complexidade | Impacto | Tempo Est. |
|----------|--------------|---------|------------|
| **Templates Pré-definidos** | Média | Alto | 2-3 dias |
| **Ações em Lote** | Média-Alta | Muito Alto | 3-4 dias |
| **Preview Multi-dispositivo** | Alta | Médio | 4-5 dias |
| **IA Contextual** | Muito Alta | Muito Alto | 5-7 dias |

### 📊 **Priorização Recomendada:**

1. **🥇 Ações em Lote** - Máximo impacto na produtividade
2. **🥈 Templates Pré-definidos** - Rápido de implementar, grande valor
3. **🥉 IA Contextual** - Grande diferencial competitivo
4. **📱 Preview Multi-dispositivo** - Nice to have, menos urgente

---

**Qual dessas melhorias você gostaria que eu implementasse primeiro?** 🚀
