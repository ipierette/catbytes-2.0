'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Film, Upload, Wand2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { StudioDashboardEmbedded } from '@/components/studio/studio-dashboard-embedded'
import { VideoUploader } from '@/components/admin/vlog/video-uploader'
import { VideoDescriptionEditor } from '@/components/admin/vlog/video-description-editor'
import { ProcessedVideo } from '@/components/admin/vlog/processed-video'
import { PlatformSelector } from '@/components/admin/vlog/platform-selector'
import { useVlogUpload } from '@/hooks/use-vlog-upload'
import { useVlogPublish } from '@/hooks/use-vlog-publish'
import { usePlatformSelection } from '@/hooks/use-platform-selection'

export default function VlogAdminPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('upload')
  
  // Estado local
  const [file, setFile] = useState<File | null>(null)
  const [userDescription, setUserDescription] = useState('')
  const [improvedDescription, setImprovedDescription] = useState('')
  const [vlogId, setVlogId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  
  // Custom hooks
  const { platforms, togglePlatform, getSelectedPlatforms, hasSelection, reset: resetPlatforms } = usePlatformSelection()
  
  const { upload, uploading } = useVlogUpload({
    onSuccess: (data) => {
      setVlogId(data.vlogId)
      setVideoUrl(data.videoUrl)
      setImprovedDescription(data.improvedDescription)
      showToast('✅ Upload concluído! Vídeo processado e descrição melhorada pela IA', 'success')
    },
    onError: (error) => showToast(error, 'error')
  })
  
  const { publish, publishing } = useVlogPublish({
    onSuccess: (message) => {
      showToast(`🎉 ${message}`, 'success')
      handleReset()
    },
    onError: (error) => showToast(error, 'error')
  })

  // Validação de arquivo
  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null)
      return
    }

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
    if (!file || !userDescription.trim()) {
      showToast('Selecione um vídeo e adicione uma descrição', 'error')
      return
    }

    await upload({ file, description: userDescription })
  }

  // Publicar nas plataformas
  const handlePublish = async () => {
    const selectedPlatforms = getSelectedPlatforms()

    if (selectedPlatforms.length === 0) {
      showToast('Selecione pelo menos uma plataforma', 'error')
      return
    }

    if (!vlogId) {
      showToast('Faça upload do vídeo primeiro', 'error')
      return
    }

    await publish({
      vlogId,
      platforms: selectedPlatforms,
      description: improvedDescription
    })
  }

  // Resetar formulário
  const handleReset = () => {
    setFile(null)
    setUserDescription('')
    setImprovedDescription('')
    setVlogId('')
    setVideoUrl('')
    resetPlatforms()
  }

  const canUpload = !!file && !!userDescription.trim()

  return (
    <AdminGuard>
    <AdminLayoutWrapper>
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vlog & Media Studio</h1>
          <p className="text-muted-foreground mt-1">
            Upload de vídeos, edição profissional e publicação automática
          </p>
        </div>
        <Film className="h-12 w-12 text-purple-500" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Simples
          </TabsTrigger>
          <TabsTrigger value="studio" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Media Studio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Upload */}
            <div className="space-y-6">
              <VideoUploader
                file={file}
                onFileSelect={handleFileSelect}
              />

              <VideoDescriptionEditor
                description={userDescription}
                uploading={uploading}
                canUpload={canUpload}
                onChange={setUserDescription}
                onUpload={handleUpload}
              />
            </div>

            {/* Coluna Direita - Publicação */}
            <div className="space-y-6">
              <ProcessedVideo
                videoUrl={videoUrl}
                improvedDescription={improvedDescription}
                onDescriptionChange={setImprovedDescription}
              />

              <PlatformSelector
                platforms={platforms}
                vlogId={vlogId}
                publishing={publishing}
                hasSelection={hasSelection()}
                onTogglePlatform={togglePlatform}
                onPublish={handlePublish}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="studio">
          <StudioDashboardEmbedded />
        </TabsContent>
      </Tabs>
    </div>
    </AdminLayoutWrapper>
    </AdminGuard>
  )
}
