'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface GeneratedContent {
  titulo: string
  imagePrompt: string
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

  const handleGenerateSuggestedPost = async () => {
    setGeneratingSuggestion(true)
    setMessage(null)

    try {
      // Passo 1: Obter sugestão de tema
      const suggestionResponse = await fetch('/api/instagram/suggest-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const suggestionData = await suggestionResponse.json()

      if (!suggestionResponse.ok) {
        throw new Error(suggestionData.error || 'Erro ao gerar sugestão')
      }

      // Preencher os campos com a sugestão
      setNicho(suggestionData.nicho)
      setTema(suggestionData.tema)
      setEstilo(suggestionData.estilo)
      setPalavrasChave(suggestionData.palavrasChave)

      // Passo 2: Gerar conteúdo completo automaticamente
      const contentResponse = await fetch('/api/instagram/generate-text-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicho: suggestionData.nicho,
          tema: suggestionData.tema,
          estilo: suggestionData.estilo,
          palavrasChave: suggestionData.palavrasChave,
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
          text: '✨ Post sugerido gerado! Tema: ' + suggestionData.categoria + '. Copie o prompt e faça upload da imagem.' 
        })
      }

    } catch (error: any) {
      console.error('Erro ao gerar sugestão:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setGeneratingSuggestion(false)
    }
  }

  const handleCopyPrompt = () => {
    if (generatedContent?.imagePrompt) {
      navigator.clipboard.writeText(generatedContent.imagePrompt)
      setMessage({ type: 'success', text: 'Prompt copiado! 📋' })
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
      // Upload para Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `instagram/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('instagram-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('instagram-images')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      setUploadedImageUrl(publicUrl)
      setMessage({ type: 'success', text: 'Imagem enviada! ✅ Agora você pode aprovar ou postar.' })

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      setMessage({ type: 'error', text: error.message })
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
          texto_imagem: generatedContent.imagePrompt, // Salvamos o prompt como referência
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
          texto_imagem: generatedContent.imagePrompt,
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
                <Button
                  onClick={handleGenerateSuggestedPost}
                  disabled={generatingSuggestion}
                  variant="default"
                  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {generatingSuggestion ? '🤖 Gerando sugestão...' : '✨ Gerar Post Sugerido por IA (Tudo Automático)'}
                </Button>
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
                  className="bg-gray-50 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use este prompt no DALL-E, Midjourney, Stable Diffusion, Sora, ou qualquer ferramenta de IA
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
