'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, Sparkles, Send, Video, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function VlogAdminPage() {
  const { showToast } = useToast()
  
  // Estado
  const [file, setFile] = useState<File | null>(null)
  const [userDescription, setUserDescription] = useState('')
  const [improvedDescription, setImprovedDescription] = useState('')
  const [vlogId, setVlogId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  
  // Plataformas selecionadas
  const [platforms, setPlatforms] = useState({
    instagram_feed: false,
    instagram_reels: false,
    linkedin: false
  })

  // Loading states
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Upload do vídeo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) return

    // Validar tamanho
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (selectedFile.size > maxSize) {
      showToast('O vídeo deve ter no máximo 10MB', 'error')
      return
    }

    // Validar tipo
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!allowedTypes.includes(selectedFile.type)) {
      showToast('Use MP4, MOV, AVI ou WEBM', 'error')
      return
    }

    setFile(selectedFile)
  }

  // Upload e processamento
  const handleUpload = async () => {
    if (!file) {
      showToast('Selecione um vídeo para fazer upload', 'error')
      return
    }

    if (!userDescription.trim()) {
      showToast('Adicione uma descrição para o vídeo', 'error')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('description', userDescription)

      const response = await fetch('/api/vlog/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const data = await response.json()

      setVlogId(data.vlog.id)
      setVideoUrl(data.vlog.videoUrl)
      setImprovedDescription(data.vlog.improvedDescription)

      showToast('✅ Upload concluído! Vídeo processado e descrição melhorada pela IA', 'success')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro no upload',
        'error'
      )
    } finally {
      setUploading(false)
    }
  }

  // Publicar nas plataformas
  const handlePublish = async () => {
    const selectedPlatforms = Object.entries(platforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform)

    if (selectedPlatforms.length === 0) {
      showToast('Selecione pelo menos uma plataforma', 'error')
      return
    }

    if (!vlogId) {
      showToast('Faça upload do vídeo primeiro', 'error')
      return
    }

    setPublishing(true)
    try {
      const response = await fetch('/api/vlog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vlogId,
          platforms: selectedPlatforms,
          description: improvedDescription
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao publicar')
      }

      const data = await response.json()

      showToast('🎉 Publicado com sucesso! ' + data.message, 'success')

      // Resetar formulário
      setFile(null)
      setUserDescription('')
      setImprovedDescription('')
      setVlogId('')
      setVideoUrl('')
      setPlatforms({
        instagram_feed: false,
        instagram_reels: false,
        linkedin: false
      })

    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao publicar',
        'error'
      )
    } finally {
      setPublishing(false)
    }
  }

  const fileSize = file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : null

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vlog - Publicação de Vídeos</h1>
          <p className="text-muted-foreground mt-1">
            Upload de vídeos até 10MB para Instagram e LinkedIn
          </p>
        </div>
        <Video className="h-12 w-12 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Upload */}
        <div className="space-y-6">
          {/* Upload */}
          <Card>
            <CardHeader>
              <CardTitle>1. Upload do Vídeo</CardTitle>
              <CardDescription>
                Selecione um vídeo de até 10MB (MP4, MOV, AVI, WEBM)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  {file ? (
                    <div className="space-y-2">
                      <p className="font-medium text-green-600">
                        ✓ {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {fileSize}
                      </p>
                      <Button variant="outline" size="sm" type="button">
                        Trocar vídeo
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">Clique para selecionar</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ou arraste o vídeo aqui
                      </p>
                    </>
                  )}
                </label>
              </div>

              {videoUrl && (
                <div className="border rounded-lg overflow-hidden">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle>2. Descrição do Vídeo</CardTitle>
              <CardDescription>
                Descreva brevemente o assunto do vídeo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="Ex: Neste vídeo eu explico os benefícios de usar Next.js para criar aplicações web modernas..."
                rows={6}
                className="resize-none"
              />

              <Button
                onClick={handleUpload}
                disabled={uploading || !file || !userDescription.trim()}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Processar e Melhorar com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Publicação */}
        <div className="space-y-6">
          {/* Descrição Melhorada */}
          <Card>
            <CardHeader>
              <CardTitle>3. Descrição Profissional</CardTitle>
              <CardDescription>
                Gerada automaticamente pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {improvedDescription ? (
                <div className="space-y-4">
                  <Textarea
                    value={improvedDescription}
                    onChange={(e) => setImprovedDescription(e.target.value)}
                    rows={10}
                    className="resize-none font-sans"
                  />
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Descrição melhorada pela IA</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>A descrição melhorada aparecerá aqui</p>
                  <p className="text-sm mt-1">após processar o vídeo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plataformas */}
          <Card>
            <CardHeader>
              <CardTitle>4. Selecione as Plataformas</CardTitle>
              <CardDescription>
                Onde você quer publicar este vídeo?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id="instagram_feed"
                    checked={platforms.instagram_feed}
                    onCheckedChange={(checked) =>
                      setPlatforms({ ...platforms, instagram_feed: !!checked })
                    }
                  />
                  <label htmlFor="instagram_feed" className="flex-1 cursor-pointer">
                    <div className="font-medium">Instagram Feed</div>
                    <div className="text-xs text-muted-foreground">
                      Post de vídeo no feed
                    </div>
                  </label>
                  <Badge variant="outline">📸</Badge>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id="instagram_reels"
                    checked={platforms.instagram_reels}
                    onCheckedChange={(checked) =>
                      setPlatforms({ ...platforms, instagram_reels: !!checked })
                    }
                  />
                  <label htmlFor="instagram_reels" className="flex-1 cursor-pointer">
                    <div className="font-medium">Instagram Reels</div>
                    <div className="text-xs text-muted-foreground">
                      Vídeo curto em formato vertical
                    </div>
                  </label>
                  <Badge variant="outline">🎬</Badge>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id="linkedin"
                    checked={platforms.linkedin}
                    onCheckedChange={(checked) =>
                      setPlatforms({ ...platforms, linkedin: !!checked })
                    }
                  />
                  <label htmlFor="linkedin" className="flex-1 cursor-pointer">
                    <div className="font-medium">LinkedIn</div>
                    <div className="text-xs text-muted-foreground">
                      Post profissional com vídeo
                    </div>
                  </label>
                  <Badge variant="outline">💼</Badge>
                </div>
              </div>

              <Button
                onClick={handlePublish}
                disabled={
                  publishing ||
                  !vlogId ||
                  !Object.values(platforms).some(Boolean)
                }
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
                    Publicar nas Plataformas
                  </>
                )}
              </Button>

              {!vlogId && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-900 dark:text-amber-100">
                    Faça o upload e processamento do vídeo antes de publicar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
