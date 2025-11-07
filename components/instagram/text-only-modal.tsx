'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSuggestions, hasCachedSuggestions } from '@/lib/instagram-suggestions-cache'

interface GeneratedContent {
  titulo: string
  imagePrompt: string  // Prompt completo em português (com texto incluído)
  caption: string
  nicho: string
  tema: string
  estilo: string
  palavrasChave: string
}

interface TextOnlyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TextOnlyModal({ open, onOpenChange, onSuccess }: TextOnlyModalProps) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false)
  
  // Form inicial
  const [nicho, setNicho] = useState('')
  const [tema, setTema] = useState('')
  const [estilo, setEstilo] = useState('')
  const [palavrasChave, setPalavrasChave] = useState('')
  
  // Conteúdo gerado
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  
  // Imagem e preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Auto-carregar sugestões quando modal abre
  useEffect(() => {
    if (open && !nicho && !tema) {
      handleLoadSuggestions()
    }
  }, [open])

  const handleLoadSuggestions = async (forceNew = false) => {
    try {
      const suggestion = await getSuggestions(forceNew)
      
      setNicho(suggestion.nicho)
      setTema(suggestion.tema)
      setEstilo(suggestion.estilo)
      setPalavrasChave(suggestion.palavrasChave.join(', '))
      
      const fromCache = hasCachedSuggestions() && !forceNew
      console.log(`✨ Sugestões carregadas${fromCache ? ' (do cache)' : ' (novas)'}`)
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error)
    }
  }

  const handleGenerate = async () => {
    if (!nicho || !tema) {
      setMessage({ type: 'error', text: 'Preencha nicho e tema!' })
      return
    }

    setGenerating(true)
    setMessage(null)

    try {
      const response = await fetch('/api/instagram/generate-text-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicho,
          tema,
          estilo,
          palavrasChave,
          quantidade: 1
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar conteúdo')
      }

      if (data.posts && data.posts.length > 0) {
        setGeneratedContent(data.posts[0])
        setMessage({ type: 'success', text: 'Conteúdo gerado! 🎉 Agora copie o prompt e faça upload da imagem.' })
      }

    } catch (error: any) {
      console.error('Erro ao gerar:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateSuggestedPost = async (forceNew = false) => {
    setGeneratingSuggestion(true)
    setMessage(null)

    try {
      // Usa o sistema de cache compartilhado
      const suggestion = await getSuggestions(forceNew)

      // Preencher os campos com a sugestão
      setNicho(suggestion.nicho)
      setTema(suggestion.tema)
      setEstilo(suggestion.estilo)
      setPalavrasChave(suggestion.palavrasChave.join(', '))

      // Gerar conteúdo completo automaticamente
      const contentResponse = await fetch('/api/instagram/generate-text-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicho: suggestion.nicho,
          tema: suggestion.tema,
          estilo: suggestion.estilo,
          palavrasChave: suggestion.palavrasChave.join(', '),
          quantidade: 1
        })
      })

      const contentData = await contentResponse.json()

      if (!contentResponse.ok) {
        throw new Error(contentData.error || 'Erro ao gerar conteúdo')
      }

      if (contentData.posts && contentData.posts.length > 0) {
        setGeneratedContent(contentData.posts[0])
        setMessage({ 
          type: 'success', 
          text: `✨ Post sugerido gerado! Tema: ${suggestion.tema}. Copie o prompt e faça upload da imagem.` 
        })
      }

    } catch (error: any) {
      console.error('Erro ao gerar sugestão:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setGeneratingSuggestion(false)
    }
  }

  const handleCopyPrompt = async () => {
    if (!generatedContent?.imagePrompt) {
      setMessage({ type: 'error', text: 'Nenhum prompt para copiar' })
      return
    }

    const textToCopy = generatedContent.imagePrompt
    console.log('📋 [COPY] Tentando copiar:', textToCopy.substring(0, 100))

    try {
      // Método moderno - funciona na maioria dos navegadores
      await navigator.clipboard.writeText(textToCopy)
      console.log('✅ [COPY] Copiado com sucesso via Clipboard API')
      setMessage({ type: 'success', text: '✅ Prompt copiado para área de transferência!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('❌ [COPY] Erro:', err)
      
      // Fallback: Mostrar em um textarea selecionável
      const textarea = document.createElement('textarea')
      textarea.value = textToCopy
      textarea.style.position = 'fixed'
      textarea.style.top = '0'
      textarea.style.left = '0'
      textarea.style.width = '100%'
      textarea.style.height = '100%'
      textarea.style.padding = '20px'
      textarea.style.fontSize = '14px'
      textarea.style.zIndex = '9999'
      textarea.style.backgroundColor = 'white'
      textarea.style.color = 'black'
      textarea.readOnly = true
      
      document.body.appendChild(textarea)
      textarea.select()
      textarea.setSelectionRange(0, textToCopy.length)
      
      // Tentar copiar com execCommand
      try {
        const success = document.execCommand('copy')
        if (success) {
          console.log('✅ [COPY] Copiado via execCommand')
          setMessage({ type: 'success', text: '✅ Prompt copiado!' })
          setTimeout(() => setMessage(null), 3000)
        }
      } catch (e) {
        console.error('❌ [COPY] execCommand falhou:', e)
      }
      
      // Aguardar um pouco antes de remover
      setTimeout(() => {
        document.body.removeChild(textarea)
      }, 100)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadImage = async () => {
    if (!selectedFile || !generatedContent) {
      setMessage({ type: 'error', text: 'Selecione uma imagem primeiro!' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      console.log('📤 Iniciando upload via API...')

      // Criar FormData
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Upload via API (usa SERVICE_ROLE_KEY para bypass de RLS)
      const uploadResponse = await fetch('/api/instagram/upload-image', {
        method: 'POST',
        body: formData
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok || !uploadResult.success) {
        console.error('❌ Erro no upload:', uploadResult)
        throw new Error(uploadResult.error || 'Erro ao fazer upload')
      }

      const publicUrl = uploadResult.publicUrl
      console.log('✅ Upload bem-sucedido! URL:', publicUrl)

      setUploadedImageUrl(publicUrl)
      setMessage({ type: 'success', text: '✅ Imagem enviada! Agora você pode aprovar o post.' })

    } catch (error: any) {
      console.error('❌ Erro ao fazer upload:', error)
      setMessage({ 
        type: 'error', 
        text: `❌ ${error.message || 'Erro ao fazer upload'}` 
      })
    } finally {
      setUploading(false)
    }
  }

  const handleApprove = async () => {
    if (!generatedContent || !uploadedImageUrl) {
      setMessage({ type: 'error', text: 'Gere o conteúdo e faça upload da imagem primeiro!' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('instagram_posts')
        .insert({
          nicho: generatedContent.nicho,
          titulo: generatedContent.titulo,
          texto_imagem: generatedContent.titulo.substring(0, 100), // Título truncado para max 100 chars
          caption: generatedContent.caption,
          image_url: uploadedImageUrl,
          status: 'pending',
          generation_method: 'text-only-manual'
        })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Post aprovado e adicionado à fila! 🎉' })
      
      setTimeout(() => {
        onSuccess?.()
        handleReset()
        onOpenChange(false)
      }, 1500)

    } catch (error: any) {
      console.error('Erro ao aprovar:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handlePostNow = async () => {
    if (!generatedContent || !uploadedImageUrl) {
      setMessage({ type: 'error', text: 'Gere o conteúdo e faça upload da imagem primeiro!' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('instagram_posts')
        .insert({
          nicho: generatedContent.nicho,
          titulo: generatedContent.titulo,
          texto_imagem: generatedContent.titulo.substring(0, 100), // Título truncado para max 100 chars
          caption: generatedContent.caption,
          image_url: uploadedImageUrl,
          status: 'published',
          scheduled_for: new Date().toISOString(),
          generation_method: 'text-only-manual'
        })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Post publicado imediatamente! 🚀' })
      
      setTimeout(() => {
        onSuccess?.()
        handleReset()
        onOpenChange(false)
      }, 1500)

    } catch (error: any) {
      console.error('Erro ao postar:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setNicho('')
    setTema('')
    setEstilo('')
    setPalavrasChave('')
    setGeneratedContent(null)
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadedImageUrl(null)
    setMessage(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">🎨 Texto IA + Imagem Manual</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Gere conteúdo com IA, copie o prompt, gere a imagem onde quiser e faça upload
          </p>
        </DialogHeader>

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Formulário Inicial */}
          {!generatedContent && (
            <div className="space-y-4">
              {/* Botão de Sugestão Rápida */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>💡 Dica:</strong> Deixe a IA sugerir um post completo com tema estratégico e conteúdo pronto!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerateSuggestedPost(false)}
                    disabled={generatingSuggestion}
                    variant="default"
                    className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                  >
                    {generatingSuggestion ? '🤖 Gerando...' : '✨ Post Sugerido por IA'}
                  </Button>
                  <Button
                    onClick={() => handleGenerateSuggestedPost(true)}
                    disabled={generatingSuggestion}
                    variant="outline"
                    className="gap-2 bg-green-600 text-white hover:bg-green-700"
                    size="lg"
                    title="Gerar nova sugestão (ignora cache)"
                  >
                    🔄
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Ou preencha manualmente</span>
                </div>
              </div>

              <div>
                <Label>Nicho *</Label>
                <Input
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder="Ex: Desenvolvimento Web, Automação, IA"
                />
              </div>

              <div>
                <Label>Tema *</Label>
                <Input
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Como automatizar X, Antes vs Depois de Y"
                />
              </div>

              <div>
                <Label>Estilo</Label>
                <Input
                  value={estilo}
                  onChange={(e) => setEstilo(e.target.value)}
                  placeholder="Ex: Profissional, Descontraído, Técnico"
                />
              </div>

              <div>
                <Label>Palavras-chave</Label>
                <Input
                  value={palavrasChave}
                  onChange={(e) => setPalavrasChave(e.target.value)}
                  placeholder="Ex: Tecnologia, IA, Automação, Python"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                {generating ? '🤔 Gerando conteúdo...' : '✨ Gerar Conteúdo com IA'}
              </Button>
            </div>
          )}

          {/* Conteúdo Gerado */}
          {generatedContent && (
            <div className="space-y-4">
              {/* Título */}
              <div>
                <Label>Título Gerado</Label>
                <Input value={generatedContent.titulo} readOnly className="bg-gray-50" />
              </div>

              {/* Image Prompt com Botão de Copiar */}
              <div>
                <Label className="flex items-center justify-between">
                  <span>Prompt de Imagem (copie e use em qualquer IA)</span>
                  <Button
                    onClick={handleCopyPrompt}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Prompt
                  </Button>
                </Label>
                <Textarea
                  value={generatedContent.imagePrompt}
                  readOnly
                  className="bg-gray-50 min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ✨ Use este prompt no DALL-E, Midjourney, Sora, Stable Diffusion, ou qualquer ferramenta de IA.
                  O prompt já inclui o texto em português que deve aparecer na imagem!
                </p>
              </div>

              {/* Legenda */}
              <div>
                <Label>Legenda Completa</Label>
                <Textarea
                  value={generatedContent.caption}
                  readOnly
                  className="bg-gray-50 min-h-[150px]"
                />
              </div>

              {/* Upload de Imagem */}
              <div className="border-2 border-dashed rounded-lg p-6 space-y-4">
                <Label className="text-lg">Fazer Upload da Imagem</Label>
                
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />

                {previewUrl && (
                  <div className="space-y-2">
                    <Label>Preview:</Label>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-w-md rounded-lg border"
                    />
                  </div>
                )}

                {selectedFile && !uploadedImageUrl && (
                  <Button
                    onClick={handleUploadImage}
                    disabled={uploading}
                    variant="secondary"
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Enviando...' : 'Enviar Imagem para Supabase'}
                  </Button>
                )}

                {uploadedImageUrl && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Imagem enviada com sucesso!</span>
                  </div>
                )}
              </div>

              {/* Ações Finais */}
              {uploadedImageUrl && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={loading}
                    variant="default"
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {loading ? 'Aprovando...' : 'Aprovar (Adicionar à Fila)'}
                  </Button>
                  
                  <Button
                    onClick={handlePostNow}
                    disabled={loading}
                    variant="default"
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {loading ? 'Postando...' : 'Postar Agora'}
                  </Button>
                </div>
              )}

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                🔄 Começar Novo Post
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
