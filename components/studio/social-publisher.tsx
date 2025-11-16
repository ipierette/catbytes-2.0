'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, Loader2, CheckCircle, XCircle, 
  Youtube, Instagram, Linkedin, Send
} from 'lucide-react'

interface PublishResult {
  platform: string
  success: boolean
  url?: string
  postId?: string
  error?: string
}

interface SocialPublisherProps {
  renderId: string
  projectTitle: string
  onClose: () => void
}

export function SocialPublisher({ renderId, projectTitle, onClose }: SocialPublisherProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [results, setResults] = useState<PublishResult[] | null>(null)

  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500',
      description: 'Vídeos longos e Shorts',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Send,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500',
      description: 'Vídeos curtos virais',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500',
      description: 'Reels e Feed',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500',
      description: 'Conteúdo profissional',
    },
  ]

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const publishToSocial = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Selecione pelo menos uma plataforma')
      return
    }

    setPublishing(true)
    
    try {
      const response = await fetch('/api/studio/publish-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renderId,
          platforms: selectedPlatforms,
        }),
      })

      if (!response.ok) throw new Error('Failed to publish')

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Publish error:', error)
      alert('Erro ao publicar vídeo')
    } finally {
      setPublishing(false)
    }
  }

  const isCompleted = results !== null
  const successCount = results?.filter(r => r.success).length || 0
  const failedCount = results?.filter(r => !r.success).length || 0

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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Publicar nas Redes Sociais</h2>
              <p className="text-sm text-gray-400">{projectTitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!publishing && !isCompleted ? (
            <>
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Selecione as plataformas
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {platforms.map((platform) => {
                    const Icon = platform.icon
                    const isSelected = selectedPlatforms.includes(platform.id)
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`
                          p-4 rounded-lg border-2 transition-all text-left
                          ${isSelected
                            ? `${platform.borderColor} ${platform.bgColor}`
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${isSelected ? platform.bgColor : 'bg-gray-700'}
                          `}>
                            <Icon className={`w-5 h-5 ${isSelected ? platform.color : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{platform.name}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {platform.description}
                            </p>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="mt-3 flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${platform.color}`} />
                            <span className={`text-xs font-medium ${platform.color}`}>
                              Selecionado
                            </span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300">
                  💡 <strong>Nota:</strong> Certifique-se de ter conectado suas contas nas 
                  configurações do Studio antes de publicar.
                </p>
              </div>

              {/* Publish Button */}
              <button
                onClick={publishToSocial}
                disabled={selectedPlatforms.length === 0}
                className={`
                  w-full py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                  ${selectedPlatforms.length > 0
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Share2 className="w-5 h-5" />
                Publicar em {selectedPlatforms.length} plataforma{selectedPlatforms.length !== 1 ? 's' : ''}
              </button>
            </>
          ) : publishing ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Publicando vídeo...
              </h3>
              <p className="text-sm text-gray-400">
                Enviando para {selectedPlatforms.length} plataforma{selectedPlatforms.length !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results */}
              <div className="text-center">
                {successCount > 0 && (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-white mb-2">
                  {successCount === selectedPlatforms.length
                    ? 'Publicação concluída!'
                    : failedCount === selectedPlatforms.length
                    ? 'Falha na publicação'
                    : 'Publicação parcial'
                  }
                </h3>
                
                <p className="text-sm text-gray-400 mb-6">
                  {successCount > 0 && `${successCount} publicação(ões) bem-sucedida(s)`}
                  {successCount > 0 && failedCount > 0 && ' • '}
                  {failedCount > 0 && `${failedCount} falha(s)`}
                </p>
              </div>

              {/* Platform Results */}
              <div className="space-y-3">
                {results?.map((result) => {
                  const platform = platforms.find(p => p.id === result.platform)
                  if (!platform) return null
                  
                  const Icon = platform.icon
                  
                  return (
                    <div
                      key={result.platform}
                      className={`
                        p-4 rounded-lg border-2
                        ${result.success
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-red-500/30 bg-red-500/5'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${platform.color}`} />
                        <div className="flex-1">
                          <p className="font-medium text-white">{platform.name}</p>
                          {result.success && result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline"
                            >
                              Ver publicação →
                            </a>
                          )}
                          {!result.success && result.error && (
                            <p className="text-xs text-red-400">{result.error}</p>
                          )}
                        </div>
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
