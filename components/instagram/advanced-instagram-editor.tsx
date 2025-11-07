'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import Image from 'next/image'
import { Bold, Italic, Sparkles, Plus, Trash2 } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { useToast } from '@/components/ui/toast'

interface TextLayer {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  bold: boolean
  italic: boolean
  rotation: number
}

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

interface AdvancedInstagramEditorProps {
  post: InstagramPost
  isOpen: boolean
  onClose: () => void
  onSave: (updatedPost: InstagramPost, finalImageUrl: string) => Promise<void>
}

const FONTS = [
  { value: 'Arial', label: 'Arial (Moderna)' },
  { value: 'Georgia', label: 'Georgia (Elegante)' },
  { value: 'Impact', label: 'Impact (Forte)' },
]

export function AdvancedInstagramEditor({ post, isOpen, onClose, onSave }: AdvancedInstagramEditorProps) {
  const [editedPost, setEditedPost] = useState<InstagramPost>(post)
  const [textLayers, setTextLayers] = useState<TextLayer[]>([])
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const { showToast } = useToast()
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Inicializar com uma camada de texto se houver texto_imagem
  useEffect(() => {
    if (post.texto_imagem && textLayers.length === 0) {
      addTextLayer(post.texto_imagem)
    }
  }, [post.texto_imagem])

  const addTextLayer = (initialText = 'Novo texto') => {
    // Calcular tamanho baseado no comprimento do texto para melhor visualização
    const textLength = initialText.length
    let idealFontSize = 64 // Padrão para textos curtos (títulos)
    
    if (textLength > 50) {
      idealFontSize = 40 // Textos médios
    } else if (textLength > 100) {
      idealFontSize = 32 // Textos longos
    } else if (textLength < 20) {
      idealFontSize = 80 // Títulos muito curtos e impactantes
    }
    
    const newLayer: TextLayer = {
      id: `layer-${Date.now()}`,
      text: initialText,
      x: 50,
      y: 50,
      fontSize: idealFontSize,
      fontFamily: 'Impact',
      color: '#FFFFFF',
      bold: true,
      italic: false,
      rotation: 0
    }
    setTextLayers([...textLayers, newLayer])
    setSelectedLayer(newLayer.id)
  }

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(textLayers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ))
  }

  const deleteLayer = (id: string) => {
    setTextLayers(textLayers.filter(layer => layer.id !== id))
    if (selectedLayer === id) {
      setSelectedLayer(null)
    }
  }

  const handleMouseDown = (e: React.MouseEvent | React.PointerEvent, layerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const layer = textLayers.find(l => l.id === layerId)
    if (!layer || !imageContainerRef.current) return
    
    setSelectedLayer(layerId)
    setIsDragging(true)
    
    // Calcular posição inicial relativa ao container
    const rect = imageContainerRef.current.getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left - layer.x,
      y: e.clientY - rect.top - layer.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent | React.PointerEvent) => {
    if (!isDragging || !selectedLayer || !imageContainerRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    // Usar requestAnimationFrame para movimento suave
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = imageContainerRef.current!.getBoundingClientRect()
      
      // Calcular nova posição
      const newX = e.clientX - rect.left - dragStart.x
      const newY = e.clientY - rect.top - dragStart.y
      
      // Limitar aos bounds do container
      const maxX = rect.width - 100
      const maxY = rect.height - 50
      
      const boundedX = Math.max(0, Math.min(newX, maxX))
      const boundedY = Math.max(0, Math.min(newY, maxY))
      
      updateLayer(selectedLayer, { x: boundedX, y: boundedY })
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }
  
  // Limpar RAF ao desmontar
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const generateAISuggestion = async () => {
    try {
      setIsGeneratingAI(true)
      
      const response = await fetch('/api/instagram/suggest-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicho: post.nicho,
          caption: editedPost.caption,
          titulo: editedPost.titulo
        })
      })

      const data = await response.json()
      
      if (data.suggestions && data.suggestions.length > 0) {
        // Adiciona as sugestões como novas camadas
        data.suggestions.forEach((text: string, index: number) => {
          setTimeout(() => {
            const newLayer: TextLayer = {
              id: `ai-layer-${Date.now()}-${index}`,
              text,
              x: 50 + (index * 20),
              y: 50 + (index * 80),
              fontSize: index === 0 ? 64 : 48,
              fontFamily: index === 0 ? 'Impact' : 'Arial',
              color: index === 0 ? '#FFFFFF' : '#FFD700',
              bold: true,
              italic: false,
              rotation: 0
            }
            setTextLayers(prev => [...prev, newLayer])
          }, index * 200)
        })
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
      showToast('Erro ao gerar sugestões. Tente novamente.', 'error')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const renderToCanvas = async (): Promise<string> => {
    const canvas = canvasRef.current
    if (!canvas) throw new Error('Canvas not found')

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not found')

    // Set canvas size to Instagram square
    canvas.width = 1080
    canvas.height = 1080

    // Load and draw base image
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = post.image_url
    })

    // Draw image (cover fit)
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
    const x = (canvas.width - img.width * scale) / 2
    const y = (canvas.height - img.height * scale) / 2
    
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

    // Draw text layers
    textLayers.forEach(layer => {
      ctx.save()
      
      // Calculate scale factor
      const containerWidth = imageContainerRef.current?.offsetWidth || 500
      const scaleX = canvas.width / containerWidth
      
      // Position
      const scaledX = layer.x * scaleX
      const scaledY = layer.y * scaleX
      
      ctx.translate(scaledX, scaledY)
      ctx.rotate((layer.rotation * Math.PI) / 180)

      // Font style
      let fontStyle = ''
      if (layer.italic) fontStyle += 'italic '
      if (layer.bold) fontStyle += 'bold '
      
      const scaledFontSize = layer.fontSize * scaleX
      ctx.font = `${fontStyle}${scaledFontSize}px ${layer.fontFamily}`
      ctx.fillStyle = layer.color
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      // Text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      // Draw text
      ctx.fillText(layer.text, 0, 0)
      
      ctx.restore()
    })

    return canvas.toDataURL('image/png')
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Render final image
      const finalImageDataUrl = await renderToCanvas()

      // Upload to Supabase
      const uploadResponse = await fetch('/api/instagram/upload-custom-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: finalImageDataUrl,
          postId: post.id
        })
      })

      const uploadData = await uploadResponse.json()
      
      if (!uploadData.success) {
        throw new Error('Failed to upload image')
      }

      // Save with new image URL
      await onSave(editedPost, uploadData.imageUrl)
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
      showToast('Erro ao salvar post. Tente novamente.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedLayerData = textLayers.find(l => l.id === selectedLayer)
  const charCount = editedPost.caption.length
  const charLimit = 2200

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>✨ Editor Avançado de Post Instagram</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">📝 Legenda</TabsTrigger>
            <TabsTrigger value="image">🎨 Editar Imagem</TabsTrigger>
            <TabsTrigger value="preview">👁️ Preview</TabsTrigger>
          </TabsList>

          {/* Aba de Legenda */}
          <TabsContent value="content" className="flex-1 overflow-auto space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título Interno</Label>
              <Input
                id="titulo"
                value={editedPost.titulo}
                onChange={(e) => setEditedPost({ ...editedPost, titulo: e.target.value })}
                placeholder="Título para identificação interna"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Legenda do Post)</Label>
              <Textarea
                id="caption"
                value={editedPost.caption}
                onChange={(e) => setEditedPost({ ...editedPost, caption: e.target.value })}
                placeholder="Escreva a legenda do seu post..."
                className="min-h-[400px] font-sans"
                maxLength={charLimit}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Use emojis 😊 e quebras de linha para melhor visualização</span>
                <span className={charCount > charLimit - 100 ? 'text-orange-500 font-semibold' : ''}>
                  {charCount} / {charLimit}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">💡 Dicas:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Use emojis para destacar pontos importantes</li>
                <li>• Adicione espaços entre parágrafos</li>
                <li>• Inclua hashtags relevantes no final</li>
                <li>• Call-to-action no primeiro parágrafo</li>
              </ul>
            </div>
          </TabsContent>

          {/* Aba de Edição de Imagem */}
          <TabsContent value="image" className="flex-1 overflow-auto mt-4">
            <div className="grid grid-cols-[350px_1fr] gap-4 h-full">
              {/* Controles */}
              <div className="space-y-4 overflow-y-auto pr-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Camadas de Texto</Label>
                    <Button size="sm" onClick={() => addTextLayer()} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>

                  {textLayers.map(layer => (
                    <div
                      key={layer.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedLayer === layer.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedLayer(layer.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium truncate flex-1">
                          {layer.text || 'Texto vazio'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLayer(layer.id)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: layer.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {layer.fontFamily} • {layer.fontSize}px
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={generateAISuggestion}
                  disabled={isGeneratingAI}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGeneratingAI ? 'Gerando...' : 'Sugerir Textos com IA'}
                </Button>

                {selectedLayerData && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold text-sm">Editar Camada Selecionada</h4>

                    <div className="space-y-2">
                      <Label>Texto</Label>
                      <Textarea
                        value={selectedLayerData.text}
                        onChange={(e) => updateLayer(selectedLayerData.id, { text: e.target.value })}
                        rows={2}
                        placeholder="Digite o texto..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fonte</Label>
                      <Select
                        value={selectedLayerData.fontFamily}
                        onValueChange={(value) => updateLayer(selectedLayerData.id, { fontFamily: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map(font => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tamanho: {selectedLayerData.fontSize}px</Label>
                      <Slider
                        value={[selectedLayerData.fontSize]}
                        onValueChange={([value]) => updateLayer(selectedLayerData.id, { fontSize: value })}
                        min={20}
                        max={120}
                        step={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cor do Texto</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          style={{ backgroundColor: selectedLayerData.color, color: '#fff' }}
                        >
                          {selectedLayerData.color}
                        </Button>
                      </div>
                      {showColorPicker && (
                        <div className="p-2 border rounded-lg">
                          <HexColorPicker
                            color={selectedLayerData.color}
                            onChange={(color) => updateLayer(selectedLayerData.id, { color })}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={selectedLayerData.bold ? 'default' : 'outline'}
                        onClick={() => updateLayer(selectedLayerData.id, { bold: !selectedLayerData.bold })}
                        className="flex-1 gap-2"
                      >
                        <Bold className="h-4 w-4" />
                        Negrito
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedLayerData.italic ? 'default' : 'outline'}
                        onClick={() => updateLayer(selectedLayerData.id, { italic: !selectedLayerData.italic })}
                        className="flex-1 gap-2"
                      >
                        <Italic className="h-4 w-4" />
                        Itálico
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Rotação: {selectedLayerData.rotation}°</Label>
                      <Slider
                        value={[selectedLayerData.rotation]}
                        onValueChange={([value]) => updateLayer(selectedLayerData.id, { rotation: value })}
                        min={-45}
                        max={45}
                        step={1}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Canvas de Preview */}
              <div className="flex flex-col gap-2">
                <div className="bg-muted/30 rounded-lg p-2 text-sm text-center">
                  💡 Clique e arraste os textos para posicionar
                </div>
                
                <div
                  ref={imageContainerRef}
                  className="relative bg-black rounded-lg overflow-hidden select-none"
                  style={{ aspectRatio: '1/1', touchAction: 'none' }}
                  onPointerMove={handleMouseMove}
                  onPointerUp={handleMouseUp}
                  onPointerLeave={handleMouseUp}
                  role="application"
                  aria-label="Editor de imagem com textos arrastáveis"
                >
                  <Image
                    src={post.image_url}
                    alt={post.titulo}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  {textLayers.map(layer => (
                    <div
                      key={layer.id}
                      className={`absolute cursor-move select-none transition-shadow ${
                        selectedLayer === layer.id ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{
                        left: `${layer.x}px`,
                        top: `${layer.y}px`,
                        fontSize: `${layer.fontSize}px`,
                        fontFamily: layer.fontFamily,
                        color: layer.color,
                        fontWeight: layer.bold ? 'bold' : 'normal',
                        fontStyle: layer.italic ? 'italic' : 'normal',
                        transform: `rotate(${layer.rotation}deg)`,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '80%',
                        touchAction: 'none',
                        userSelect: 'none'
                      }}
                      onPointerDown={(e) => handleMouseDown(e, layer.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Camada de texto: ${layer.text}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedLayer(layer.id)
                        }
                      }}
                    >
                      {layer.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Preview */}
          <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
            <div className="bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6">
              <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                {/* Instagram Header */}
                <div className="flex items-center gap-3 p-3 border-b dark:border-gray-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    CB
                  </div>
                  <div>
                    <p className="font-semibold text-sm">catbytes.site</p>
                    <p className="text-xs text-muted-foreground">{editedPost.nicho}</p>
                  </div>
                </div>

                {/* Imagem com Preview dos Textos */}
                <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800">
                  <Image
                    src={post.image_url}
                    alt={post.titulo}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {textLayers.map(layer => {
                    // Calculate proper preview sizing
                    const containerWidth = imageContainerRef.current?.offsetWidth || 500
                    const previewWidth = 400 // Approximate preview container width
                    const scaleFactor = previewWidth / containerWidth
                    
                    return (
                      <div
                        key={`preview-${layer.id}`}
                        className="absolute"
                        style={{
                          left: `${layer.x * scaleFactor}px`,
                          top: `${layer.y * scaleFactor}px`,
                          fontSize: `${layer.fontSize * scaleFactor}px`,
                          fontFamily: layer.fontFamily,
                          color: layer.color,
                          fontWeight: layer.bold ? 'bold' : 'normal',
                          fontStyle: layer.italic ? 'italic' : 'normal',
                          transform: `rotate(${layer.rotation}deg)`,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                          whiteSpace: 'pre-wrap',
                          maxWidth: '80%'
                        }}
                      >
                        {layer.text}
                      </div>
                    )
                  })}
                </div>

                {/* Instagram Actions */}
                <div className="flex items-center gap-4 p-3 border-b dark:border-gray-800">
                  <span className="text-2xl">❤️</span>
                  <span className="text-2xl">💬</span>
                  <span className="text-2xl">📤</span>
                  <span className="text-2xl ml-auto">🔖</span>
                </div>

                {/* Caption */}
                <div className="p-3 max-h-[300px] overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">
                    <span className="font-semibold">catbytes.site</span> {editedPost.caption}
                  </p>
                </div>

                <div className="p-3 text-xs text-muted-foreground border-t dark:border-gray-800">
                  há alguns segundos
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Canvas oculto para renderização */}
        <canvas ref={canvasRef} className="hidden" />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : '💾 Salvar Post Completo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}