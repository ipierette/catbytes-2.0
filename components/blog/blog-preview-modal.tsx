'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Bold, 
  Italic, 
  Type, 
  Palette, 
  Wand2, 
  Eye, 
  Save, 
  X,
  RefreshCw 
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { addTextOverlay } from '@/lib/image-text-overlay'

interface BlogPost {
  title: string
  excerpt: string
  content: string
  cover_image_url?: string
  category: string
  tags: string[]
}

interface BlogPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (post: BlogPost & { imageText?: string; imageSettings?: ImageTextSettings }) => void
  initialPost: Partial<BlogPost>
  theme: string
}

interface ImageTextSettings {
  text: string
  fontSize: number
  fontFamily: string
  color: string
  isBold: boolean
  isItalic: boolean
  strokeColor: string
  strokeWidth: number
  backgroundColor: string
  position: 'center' | 'top' | 'bottom'
}

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial (Padrão)' },
  { value: 'Georgia', label: 'Georgia (Elegante)' },
  { value: 'Impact', label: 'Impact (Impactante)' }
]

export function BlogPreviewModal({
  isOpen,
  onClose,
  onSave,
  initialPost,
  theme
}: BlogPreviewModalProps) {
  const [post, setPost] = useState<BlogPost>({
    title: '',
    excerpt: '',
    content: '',
    category: theme,
    tags: [],
    ...initialPost
  })

  const [imageSettings, setImageSettings] = useState<ImageTextSettings>({
    text: '',
    fontSize: 55,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    isBold: true,
    isItalic: false,
    strokeColor: '#000000',
    strokeWidth: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    position: 'center'
  })

  const [previewImage, setPreviewImage] = useState<string>('')
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [isGeneratingTextSuggestion, setIsGeneratingTextSuggestion] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'stroke' | null>(null)

  // Atualiza post quando initialPost muda
  useEffect(() => {
    if (initialPost) {
      setPost(prev => ({ ...prev, ...initialPost }))
    }
  }, [initialPost])

  // Gera sugestão de texto para imagem usando OpenAI
  const generateTextSuggestion = async () => {
    try {
      setIsGeneratingTextSuggestion(true)
      
      const response = await fetch('/api/blog/suggest-image-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          theme: theme,
          content: post.content.substring(0, 500) // Primeiros 500 chars
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setImageSettings(prev => ({ ...prev, text: data.suggestion }))
      }
    } catch (error) {
      console.error('Error generating text suggestion:', error)
    } finally {
      setIsGeneratingTextSuggestion(false)
    }
  }

  // Gera preview da imagem com texto
  const generateImagePreview = async () => {
    if (!post.cover_image_url || !imageSettings.text) return

    try {
      setIsGeneratingPreview(true)

      // Configura fonte baseado nas opções
      let fontFamily = imageSettings.fontFamily
      if (imageSettings.isBold && imageSettings.isItalic) {
        fontFamily = `bold italic ${imageSettings.fontSize}px ${imageSettings.fontFamily}`
      } else if (imageSettings.isBold) {
        fontFamily = `bold ${imageSettings.fontSize}px ${imageSettings.fontFamily}`
      } else if (imageSettings.isItalic) {
        fontFamily = `italic ${imageSettings.fontSize}px ${imageSettings.fontFamily}`
      } else {
        fontFamily = `${imageSettings.fontSize}px ${imageSettings.fontFamily}`
      }

      const previewDataUrl = await addTextOverlay({
        text: imageSettings.text,
        imageUrl: post.cover_image_url,
        fontSize: imageSettings.fontSize,
        fontFamily: fontFamily,
        textColor: imageSettings.color,
        strokeColor: imageSettings.strokeColor,
        strokeWidth: imageSettings.strokeWidth,
        backgroundColor: imageSettings.backgroundColor,
        position: imageSettings.position,
        maxWidth: 700
      })

      setPreviewImage(previewDataUrl)
    } catch (error) {
      console.error('Error generating image preview:', error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  // Auto-gera preview quando configurações mudam
  useEffect(() => {
    if (imageSettings.text && post.cover_image_url) {
      const timeout = setTimeout(generateImagePreview, 500)
      return () => clearTimeout(timeout)
    }
  }, [imageSettings, post.cover_image_url])

  const handleSave = () => {
    onSave({
      ...post,
      imageText: imageSettings.text,
      imageSettings
    })
  }

  const handleTagsChange = (tagsStr: string) => {
    const tags = tagsStr.split(',').map(tag => tag.trim()).filter(Boolean)
    setPost(prev => ({ ...prev, tags }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Pré-visualização e Edição do Artigo
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">📝 Conteúdo</TabsTrigger>
            <TabsTrigger value="image">🎨 Imagem & Texto</TabsTrigger>
            <TabsTrigger value="preview">👁️ Preview Final</TabsTrigger>
          </TabsList>

          {/* Tab: Conteúdo do Post */}
          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={post.title}
                    onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do artigo..."
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Resumo</Label>
                  <Textarea
                    id="excerpt"
                    value={post.excerpt}
                    onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Resumo atrativo do artigo..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={post.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="tecnologia, automação, IA..."
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview do Título</CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-2xl font-bold mb-2">{post.title || 'Título do Artigo'}</h2>
                  <p className="text-muted-foreground text-sm mb-3">
                    {post.excerpt || 'Resumo do artigo aparecerá aqui...'}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label htmlFor="content">Conteúdo do Artigo</Label>
              <Textarea
                id="content"
                value={post.content}
                onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Conteúdo completo do artigo em Markdown..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          {/* Tab: Configuração da Imagem */}
          <TabsContent value="image" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Configurações do Texto */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Texto da Imagem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Campo de texto com sugestão IA */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Texto para a Imagem</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={generateTextSuggestion}
                        disabled={isGeneratingTextSuggestion || !post.title}
                        className="gap-1"
                      >
                        {isGeneratingTextSuggestion ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Wand2 className="h-3 w-3" />
                        )}
                        Sugerir com IA
                      </Button>
                    </div>
                    <Textarea
                      value={imageSettings.text}
                      onChange={(e) => setImageSettings(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Digite o texto que aparecerá na imagem..."
                      rows={3}
                    />
                  </div>

                  {/* Fonte */}
                  <div>
                    <Label>Fonte</Label>
                    <Select 
                      value={imageSettings.fontFamily} 
                      onValueChange={(value) => setImageSettings(prev => ({ ...prev, fontFamily: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tamanho da Fonte */}
                  <div>
                    <Label>Tamanho da Fonte: {imageSettings.fontSize}px</Label>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={imageSettings.fontSize}
                      onChange={(e) => setImageSettings(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Estilo do Texto */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={imageSettings.isBold ? "default" : "outline"}
                      onClick={() => setImageSettings(prev => ({ ...prev, isBold: !prev.isBold }))}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={imageSettings.isItalic ? "default" : "outline"}
                      onClick={() => setImageSettings(prev => ({ ...prev, isItalic: !prev.isItalic }))}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Cores */}
                  <div className="space-y-3">
                    <div>
                      <Label>Cor do Texto</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                          className="w-12 h-8 p-0"
                          style={{ backgroundColor: imageSettings.color }}
                        >
                          <Palette className="h-3 w-3 text-white" />
                        </Button>
                        <Input
                          value={imageSettings.color}
                          onChange={(e) => setImageSettings(prev => ({ ...prev, color: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                      {showColorPicker === 'text' && (
                        <div className="mt-2">
                          <HexColorPicker
                            color={imageSettings.color}
                            onChange={(color) => setImageSettings(prev => ({ ...prev, color }))}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Cor da Borda</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowColorPicker(showColorPicker === 'stroke' ? null : 'stroke')}
                          className="w-12 h-8 p-0"
                          style={{ backgroundColor: imageSettings.strokeColor }}
                        >
                          <Palette className="h-3 w-3 text-white" />
                        </Button>
                        <Input
                          value={imageSettings.strokeColor}
                          onChange={(e) => setImageSettings(prev => ({ ...prev, strokeColor: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                      {showColorPicker === 'stroke' && (
                        <div className="mt-2">
                          <HexColorPicker
                            color={imageSettings.strokeColor}
                            onChange={(color) => setImageSettings(prev => ({ ...prev, strokeColor: color }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Posição */}
                  <div>
                    <Label>Posição do Texto</Label>
                    <Select 
                      value={imageSettings.position} 
                      onValueChange={(value: 'center' | 'top' | 'bottom') => 
                        setImageSettings(prev => ({ ...prev, position: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Topo</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="bottom">Rodapé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Preview da Imagem */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview da Imagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.cover_image_url ? (
                    <div className="space-y-4">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full rounded-lg border"
                        />
                      ) : (
                        <img
                          src={post.cover_image_url}
                          alt="Original"
                          className="w-full rounded-lg border opacity-75"
                        />
                      )}
                      
                      <Button
                        onClick={generateImagePreview}
                        disabled={isGeneratingPreview || !imageSettings.text}
                        className="w-full"
                      >
                        {isGeneratingPreview ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        Gerar Preview
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Type className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Imagem será gerada junto com o artigo</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Preview Final */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview Final do Artigo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Imagem com texto */}
                {(previewImage || post.cover_image_url) && (
                  <img
                    src={previewImage || post.cover_image_url}
                    alt={post.title}
                    className="w-full max-w-2xl mx-auto rounded-lg"
                  />
                )}
                
                {/* Título e metadata */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex gap-2 mb-6">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Conteúdo */}
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap">{post.content}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões de Ação */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Artigo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}