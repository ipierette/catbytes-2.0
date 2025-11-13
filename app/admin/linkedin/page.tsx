'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Send, Image as ImageIcon, RefreshCw, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import Image from 'next/image'

interface BlogArticle {
  title: string
  slug: string
  excerpt: string
  created_at: string
}

export default function LinkedInAdminPage() {
  const { showToast } = useToast()
  
  // Estado
  const [postType, setPostType] = useState<'blog-article' | 'fullstack-random'>('fullstack-random')
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [selectedArticle, setSelectedArticle] = useState<string>('')
  const [postText, setPostText] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [asOrganization, setAsOrganization] = useState(false)
  
  // Loading states
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Buscar artigos do blog
  useEffect(() => {
    if (postType === 'blog-article') {
      fetchArticles()
    }
  }, [postType])

  const fetchArticles = async () => {
    setLoadingArticles(true)
    try {
      const response = await fetch('/api/blog/posts?status=published&limit=50')
      if (!response.ok) throw new Error('Erro ao buscar artigos')
      
      const data = await response.json()
      setArticles(data.posts || [])
    } catch (error) {
      showToast('Não foi possível carregar os artigos', 'error')
    } finally {
      setLoadingArticles(false)
    }
  }

  // Gerar conteúdo do post
  const handleGenerate = async () => {
    if (postType === 'blog-article' && !selectedArticle) {
      showToast('Selecione um artigo do blog', 'error')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/linkedin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: postType,
          articleSlug: postType === 'blog-article' ? selectedArticle : undefined
        })
      })

      if (!response.ok) throw new Error('Erro ao gerar post')

      const data = await response.json()
      setPostText(data.postText)
      setImagePrompt(data.imagePrompt)
      setImageUrl(data.imageUrl || '') // Imagem já gerada pelo backend

      if (data.imageUrl) {
        showToast('✨ Post e imagem gerados com sucesso!', 'success')
      } else {
        showToast('✨ Post gerado! (Imagem não foi gerada)', 'success')
      }
    } catch (error) {
      showToast('Não foi possível gerar o post', 'error')
    } finally {
      setGenerating(false)
    }
  }

  // Gerar imagem com DALL-E
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      showToast('Prompt de imagem está vazio', 'error')
      return
    }

    setGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: '1024x1024'
        })
      })

      if (!response.ok) throw new Error('Erro ao gerar imagem')

      const data = await response.json()
      setImageUrl(data.url)

      showToast('🎨 Imagem gerada! Pronta para publicação', 'success')
    } catch (error) {
      showToast('Não foi possível gerar a imagem', 'error')
    } finally {
      setGeneratingImage(false)
    }
  }

  // Publicar no LinkedIn
  const handlePublish = async () => {
    if (!postText.trim()) {
      showToast('O texto do post não pode estar vazio', 'error')
      return
    }

    setPublishing(true)
    try {
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: postText,
          imageUrl: imageUrl || undefined,
          asOrganization
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao publicar')
      }

      const data = await response.json()

      showToast('🎉 Post publicado com sucesso no LinkedIn!', 'success')

      // Limpar formulário
      setPostText('')
      setImagePrompt('')
      setImageUrl('')
      setSelectedArticle('')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao publicar',
        'error'
      )
    } finally {
      setPublishing(false)
    }
  }

  return (
    <AdminGuard>
    <AdminLayoutWrapper>
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Posts</h1>
          <p className="text-muted-foreground mt-1">
            Gere e publique posts profissionais no LinkedIn
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {asOrganization ? '🏢 Como Página' : '👤 Como Perfil'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Configuração */}
        <div className="space-y-6">
          {/* Tipo de Post */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Post</CardTitle>
              <CardDescription>
                Escolha o que você quer compartilhar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={postType}
                onValueChange={(value: any) => {
                  setPostType(value)
                  setPostText('')
                  setImagePrompt('')
                  setImageUrl('')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullstack-random">
                    💼 Post sobre Fullstack (Aleatório)
                  </SelectItem>
                  <SelectItem value="blog-article">
                    📝 Divulgar Artigo do Blog
                  </SelectItem>
                </SelectContent>
              </Select>

              {postType === 'blog-article' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecione o Artigo</label>
                  <Select
                    value={selectedArticle}
                    onValueChange={setSelectedArticle}
                    disabled={loadingArticles}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um artigo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {articles.map((article) => (
                        <SelectItem key={article.slug} value={article.slug}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={generating || (postType === 'blog-article' && !selectedArticle)}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Post com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Texto do Post */}
          <Card>
            <CardHeader>
              <CardTitle>Texto do Post</CardTitle>
              <CardDescription>
                Revise e edite o conteúdo antes de publicar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="O texto do post aparecerá aqui após gerar..."
                rows={12}
                className="font-sans resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {postText.length} / 3000 caracteres
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Imagem e Publicação */}
        <div className="space-y-6">
          {/* Imagem */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem do Post</CardTitle>
              <CardDescription>
                Gere uma imagem profissional com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Prompt da Imagem
                </label>
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Descreva a imagem que você quer gerar..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleGenerateImage}
                disabled={generatingImage || !imagePrompt.trim()}
                className="w-full"
                variant="outline"
              >
                {generatingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Imagem...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Gerar Imagem com DALL-E
                  </>
                )}
              </Button>

              {imageUrl && (
                <div className="border rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Preview da imagem"
                    width={1024}
                    height={1024}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publicação */}
          <Card>
            <CardHeader>
              <CardTitle>Publicar</CardTitle>
              <CardDescription>
                Compartilhe no LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Publicar como:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAsOrganization(!asOrganization)}
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  {asOrganization ? 'Página CatBytes' : 'Perfil Pessoal'}
                </Button>
              </div>

              <Button
                onClick={handlePublish}
                disabled={publishing || !postText.trim()}
                className="w-full"
                size="lg"
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publicar no LinkedIn
                  </>
                )}
              </Button>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">💡 Dica</p>
                <p className="text-xs leading-relaxed">
                  Revise sempre o conteúdo antes de publicar. Posts com imagem têm ~2x mais engajamento!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </AdminLayoutWrapper>
    </AdminGuard>
  )
}
