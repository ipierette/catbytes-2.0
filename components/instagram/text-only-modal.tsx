'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Upload, Image as ImageIcon, CheckCircle, Calendar } from 'lucide-react'
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
  const [scheduling, setScheduling] = useState(false)
  const [publishing, setPublishing] = useState(false)
  
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
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)
  
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
      console.log('⚡ [MODAL] Gerando post corporativo direto...')
      
      // Temas corporativos focados em negócios
      const corporateThemes = [
        { nicho: 'Escritórios de Advocacia', tema: 'Automatizar controle de processos jurídicos' },
        { nicho: 'Clínicas Médicas', tema: 'Sistema de agendamento inteligente 24/7' },
        { nicho: 'E-commerce', tema: 'Automação de estoque e vendas' },
        { nicho: 'Restaurantes', tema: 'Delivery automatizado com WhatsApp' },
        { nicho: 'Academias', tema: 'App de treinos personalizados por IA' },
        { nicho: 'Salões de Beleza', tema: 'Agendamento online que reduz no-show' },
        { nicho: 'Consultórios Odontológicos', tema: 'Lembretes automáticos por WhatsApp' },
        { nicho: 'Contabilidade', tema: 'Dashboard financeiro em tempo real' },
        { nicho: 'Imobiliárias', tema: 'CRM automático para leads' },
        { nicho: 'Oficinas Mecânicas', tema: 'Sistema de ordens de serviço digital' }
      ]
      
      // Selecionar tema corporativo aleatório
      const selectedTheme = corporateThemes[Math.floor(Math.random() * corporateThemes.length)]
      
      // Preencher campos
      setNicho(selectedTheme.nicho)
      setTema(selectedTheme.tema)
      setEstilo('Profissional e Persuasivo')
      setPalavrasChave('Automação, Produtividade, Tecnologia Empresarial, CatBytes')

      // Gerar conteúdo completo automaticamente
      const contentResponse = await fetch('/api/instagram/generate-text-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicho: selectedTheme.nicho,
          tema: selectedTheme.tema,
          estilo: 'Profissional e Persuasivo',
          palavrasChave: 'Automação, Produtividade, Tecnologia Empresarial, CatBytes',
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
          text: `💼 Post corporativo gerado! Nicho: ${selectedTheme.nicho}. Copie o prompt e crie sua imagem empresarial!` 
        })
      }

    } catch (error: any) {
      console.error('Erro ao gerar sugestão corporativa:', error)
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
      // Salvar o post como rascunho (pending)
      const saveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          caption: generatedContent.caption,
          image_url: uploadedImageUrl
        })
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        throw new Error(error.error || 'Erro ao salvar post')
      }

      setMessage({ type: 'success', text: '✅ Rascunho salvo com sucesso! Você pode aprovar depois.' })
      
      setTimeout(() => {
        onSuccess?.()
        handleReset()
        onOpenChange(false)
      }, 1500)

    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error)
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

    setPublishing(true)
    setMessage(null)

    try {
      console.log('[TextOnly] Iniciando publicação imediata...')
      
      // 1. Salvar o post
      const saveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          caption: generatedContent.caption,
          image_url: uploadedImageUrl
        })
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        console.error('[TextOnly] Erro ao salvar:', error)
        throw new Error(error.error || 'Erro ao salvar post')
      }

      const saveData = await saveResponse.json()
      const postId = saveData.postId
      console.log('[TextOnly] Post salvo, ID:', postId)

      // 2. Aprovar o post com scheduled_for = agora
      const now = new Date()
      const approveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          postId,
          scheduledFor: now.toISOString()
        })
      })

      if (!approveResponse.ok) {
        const error = await approveResponse.json()
        console.error('[TextOnly] Erro ao aprovar:', error)
        throw new Error(error.error || 'Erro ao aprovar post')
      }
      console.log('[TextOnly] Post aprovado')

      // 3. Publicar imediatamente no Instagram
      const publishResponse = await fetch('/api/instagram/publish-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postId
        })
      })

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json()
        console.error('[TextOnly] Erro ao publicar:', errorData)
        throw new Error(errorData.error || 'Erro ao publicar no Instagram')
      }

      console.log('[TextOnly] Post publicado com sucesso!')
      setMessage({ type: 'success', text: '🎉 Post publicado com sucesso no Instagram!' })
      
      setTimeout(() => {
        onSuccess?.()
        handleReset()
        onOpenChange(false)
      }, 1500)

    } catch (error: any) {
      console.error('[TextOnly] Erro ao postar:', error)
      setMessage({ type: 'error', text: error.message || 'Erro ao postar no Instagram' })
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedulePost = async () => {
    if (!generatedContent || !uploadedImageUrl) {
      setMessage({ type: 'error', text: 'Gere o conteúdo e faça upload da imagem primeiro!' })
      return
    }

    if (!scheduledDate) {
      setMessage({ type: 'error', text: 'Selecione uma data e hora para agendar!' })
      return
    }

    setScheduling(true)
    setMessage(null)

    try {
      console.log('[TextOnly] Iniciando agendamento...')
      
      // 1. Salvar o post
      const saveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          caption: generatedContent.caption,
          image_url: uploadedImageUrl
        })
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        console.error('[TextOnly] Erro ao salvar:', error)
        throw new Error(error.error || 'Erro ao salvar post')
      }

      const saveData = await saveResponse.json()
      const postId = saveData.postId
      console.log('[TextOnly] Post salvo, ID:', postId)

      // 2. Aprovar e agendar
      const approveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          postId,
          scheduledFor: scheduledDate.toISOString()
        })
      })

      if (!approveResponse.ok) {
        const error = await approveResponse.json()
        console.error('[TextOnly] Erro ao aprovar:', error)
        throw new Error(error.error || 'Erro ao agendar post')
      }

      console.log('[TextOnly] Post agendado com sucesso!')
      setMessage({ 
        type: 'success', 
        text: `📅 Post agendado para ${scheduledDate.toLocaleString('pt-BR')}!` 
      })
      
      setTimeout(() => {
        onSuccess?.()
        handleReset()
        onOpenChange(false)
      }, 1500)

    } catch (error: any) {
      console.error('[TextOnly] Erro ao agendar:', error)
      setMessage({ type: 'error', text: error.message || 'Erro ao agendar post' })
    } finally {
      setScheduling(false)
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
    setScheduledDate(undefined)
    setMessage(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900 dark:text-white">🎨 Texto IA + Imagem Manual</DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gere conteúdo com IA, copie o prompt, gere a imagem onde quiser e faça upload
          </p>
        </DialogHeader>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200' 
              : 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Formulário Inicial */}
          {!generatedContent && (
            <div className="space-y-4">
              {/* Botão de Geração Rápida SIMPLIFICADO */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      ⚡ Geração Automática
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Clique para gerar um post completo com conteúdo focado em <strong>negócios corporativos</strong>
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => handleGenerateSuggestedPost(true)}
                    disabled={generatingSuggestion}
                    className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg"
                    size="lg"
                  >
                    {generatingSuggestion ? '🤖 Gerando Post Corporativo...' : '✨ Gerar Post Corporativo Agora'}
                  </Button>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    💼 Foco em: Automação empresarial, produtividade, sistemas corporativos
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Ou preencha manualmente</span>
                </div>
              </div>

              <div>
                <Label className="text-gray-900 dark:text-white">Nicho *</Label>
                <Input
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder="Ex: Escritórios de Advocacia, Clínicas Médicas, E-commerce"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <Label className="text-gray-900 dark:text-white">Tema *</Label>
                <Input
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Automatizar agendamentos, Reduzir trabalho manual"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <Label className="text-gray-900 dark:text-white">Estilo</Label>
                <Input
                  value={estilo}
                  onChange={(e) => setEstilo(e.target.value)}
                  placeholder="Ex: Profissional, Persuasivo, Educativo"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <Label className="text-gray-900 dark:text-white">Palavras-chave</Label>
                <Input
                  value={palavrasChave}
                  onChange={(e) => setPalavrasChave(e.target.value)}
                  placeholder="Ex: Automação, Produtividade, Economia de tempo"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                <Label className="text-gray-900 dark:text-white">Título Gerado</Label>
                <Input 
                  value={generatedContent.titulo} 
                  readOnly 
                  className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                />
              </div>

              {/* Image Prompt com Botão de Copiar */}
              <div>
                <Label className="flex items-center justify-between text-gray-900 dark:text-white">
                  <span>Prompt de Imagem Corporativa (copie e use em qualquer IA)</span>
                  <Button
                    onClick={handleCopyPrompt}
                    variant="outline"
                    size="sm"
                    className="gap-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Prompt
                  </Button>
                </Label>
                <Textarea
                  value={generatedContent.imagePrompt}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 min-h-[120px]"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  💼 Prompt otimizado para imagens corporativas: escritórios, reuniões, tecnologia empresarial.
                  Use no DALL-E, Midjourney, Sora, Stable Diffusion, etc.
                </p>
              </div>

              {/* Legenda */}
              <div>
                <Label className="text-gray-900 dark:text-white">Legenda Completa</Label>
                <Textarea
                  value={generatedContent.caption}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 min-h-[150px]"
                />
              </div>

              {/* Upload de Imagem */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4">
                <Label className="text-lg text-gray-900 dark:text-white">Fazer Upload da Imagem</Label>
                
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />

                {previewUrl && (
                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Preview:</Label>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-w-md rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}

                {selectedFile && !uploadedImageUrl && (
                  <Button
                    onClick={handleUploadImage}
                    disabled={uploading}
                    variant="secondary"
                    className="w-full gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Enviando...' : 'Enviar Imagem para Supabase'}
                  </Button>
                )}

                {uploadedImageUrl && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Imagem enviada com sucesso!</span>
                  </div>
                )}
              </div>

              {/* Ações Finais */}
              {uploadedImageUrl && (
                <div className="space-y-4">
                  {/* Botão Salvar Rascunho */}
                  <Button
                    onClick={handleApprove}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    size="lg"
                  >
                    💾 Salvar como Rascunho
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                        Ou Publicar
                      </span>
                    </div>
                  </div>

                  {/* Seletor de Data/Hora para Agendamento */}
                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">
                      Agendar para data/hora específica (opcional)
                    </Label>
                    <Input
                      type="datetime-local"
                      value={scheduledDate ? new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const localDate = new Date(e.target.value)
                          setScheduledDate(localDate)
                        } else {
                          setScheduledDate(undefined)
                        }
                      }}
                      min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleSchedulePost}
                      disabled={scheduling || publishing || !scheduledDate}
                      variant="outline"
                      className="w-full"
                    >
                      {scheduling ? (
                        <>⏳ Agendando...</>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Agendar
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handlePostNow}
                      disabled={scheduling || publishing}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {publishing ? (
                        <>📤 Publicando...</>
                      ) : (
                        '🚀 Publicar Agora'
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    💡 <strong>Agendar:</strong> Selecione data/hora e clique em Agendar | 
                    <strong> Publicar Agora:</strong> Posta imediatamente no Instagram
                  </p>
                </div>
              )}

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
