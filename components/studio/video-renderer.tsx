'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Film, Loader2, Download, CheckCircle, XCircle, Settings } from 'lucide-react'

interface RenderStatus {
  id: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  videoUrl?: string
  error?: string
}

interface VideoRendererProps {
  projectId: string
  projectTitle: string
  onClose: () => void
  onRenderComplete?: (renderId: string) => void
}

export function VideoRenderer({ projectId, projectTitle, onClose, onRenderComplete }: VideoRendererProps) {
  const [format, setFormat] = useState<'mp4' | 'webm' | 'mov'>('mp4')
  const [quality, setQuality] = useState<'720p' | '1080p' | '4k'>('1080p')
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5'>('16:9')
  const [rendering, setRendering] = useState(false)
  const [renderStatus, setRenderStatus] = useState<RenderStatus | null>(null)

  useEffect(() => {
    if (!renderStatus || renderStatus.status !== 'processing') return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/studio/render-video?renderId=${renderStatus.id}`
        )
        
        if (!response.ok) throw new Error('Failed to get status')
        
        const data = await response.json()
        setRenderStatus(data.render)

        if (data.render.status !== 'processing') {
          clearInterval(interval)
          
          // Call callback when completed
          if (data.render.status === 'completed' && onRenderComplete) {
            onRenderComplete(data.render.id)
          }
        }
      } catch (error) {
        console.error('Poll render status error:', error)
        clearInterval(interval)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [renderStatus])

  const startRender = async () => {
    setRendering(true)
    
    try {
      const response = await fetch('/api/studio/render-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          format,
          quality,
          aspectRatio,
        }),
      })

      if (!response.ok) throw new Error('Failed to start render')

      const data = await response.json()
      setRenderStatus(data.render)
    } catch (error) {
      console.error('Start render error:', error)
      alert('Erro ao iniciar renderização')
      setRendering(false)
    }
  }

  const downloadVideo = () => {
    if (!renderStatus?.videoUrl) return
    
    const link = document.createElement('a')
    link.href = renderStatus.videoUrl
    link.download = `${projectTitle}.${format}`
    link.click()
  }

  const isProcessing = renderStatus?.status === 'processing'
  const isCompleted = renderStatus?.status === 'completed'
  const isFailed = renderStatus?.status === 'failed'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Renderizar Vídeo</h2>
              <p className="text-sm text-gray-400">{projectTitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!rendering ? (
            <>
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Formato
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['mp4', 'webm', 'mov'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`
                        p-4 rounded-lg border-2 text-center transition-all
                        ${format === fmt
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }
                      `}
                    >
                      <p className="text-white font-medium uppercase">{fmt}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {fmt === 'mp4' && 'Compatível universalmente'}
                        {fmt === 'webm' && 'Menor tamanho'}
                        {fmt === 'mov' && 'Alta qualidade'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Qualidade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['720p', '1080p', '4k'] as const).map((qual) => (
                    <button
                      key={qual}
                      onClick={() => setQuality(qual)}
                      className={`
                        p-4 rounded-lg border-2 text-center transition-all
                        ${quality === qual
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }
                      `}
                    >
                      <p className="text-white font-medium">{qual}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {qual === '720p' && '1280x720'}
                        {qual === '1080p' && '1920x1080'}
                        {qual === '4k' && '3840x2160'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Proporção
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(['16:9', '9:16', '1:1', '4:5'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`
                        p-4 rounded-lg border-2 text-center transition-all
                        ${aspectRatio === ratio
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }
                      `}
                    >
                      <p className="text-white font-medium">{ratio}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {ratio === '16:9' && 'YouTube'}
                        {ratio === '9:16' && 'Stories'}
                        {ratio === '1:1' && 'Instagram'}
                        {ratio === '4:5' && 'Feed'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <details className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Settings className="w-4 h-4" />
                  Configurações Avançadas
                </summary>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <p>• Codec de vídeo: H.264</p>
                  <p>• Codec de áudio: AAC</p>
                  <p>• Taxa de bits: Automática</p>
                  <p>• FPS: 30 (adaptativo)</p>
                </div>
              </details>

              {/* Render Button */}
              <button
                onClick={startRender}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Film className="w-5 h-5" />
                Iniciar Renderização
              </button>
            </>
          ) : (
            <div className="space-y-6">
              {/* Progress */}
              {isProcessing && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Renderizando vídeo...
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Isso pode levar alguns minutos
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${renderStatus?.progress || 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {renderStatus?.progress || 0}% completo
                  </p>
                </div>
              )}

              {/* Completed */}
              {isCompleted && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Vídeo pronto!
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Seu vídeo foi renderizado com sucesso
                  </p>
                  
                  <button
                    onClick={downloadVideo}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Baixar Vídeo
                  </button>
                </div>
              )}

              {/* Failed */}
              {isFailed && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Erro na renderização
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {renderStatus?.error || 'Ocorreu um erro inesperado'}
                  </p>
                  
                  <button
                    onClick={() => {
                      setRendering(false)
                      setRenderStatus(null)
                    }}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {isCompleted ? 'Fechar' : 'Cancelar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
