import { Button } from '@/components/ui/button'
import { Instagram, Send, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react'
import type { InstagramPost } from '@/lib/instagram'
import { getNicheDisplay, formatDate, getStatusEmoji } from '@/lib/instagram'
import { useState } from 'react'

interface PostPreviewModalProps {
  post: InstagramPost | null
  isPublishing?: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onPublishNow: () => void
}

export function PostPreviewModal({
  post,
  isPublishing = false,
  onClose,
  onApprove,
  onReject,
  onPublishNow
}: PostPreviewModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!post) return null

  const nicheDisplay = getNicheDisplay(post.nicho)

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagem com lazy loading e skeleton */}
        <div className="md:w-3/5 bg-black flex items-center justify-center relative">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-white p-8">
              <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-sm opacity-75">Imagem não disponível</p>
            </div>
          ) : (
            <img
              src={post.image_url}
              alt={post.titulo}
              className={`w-full h-auto max-h-[90vh] object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Erro ao carregar imagem:', post.image_url)
                setImageError(true)
              }}
            />
          )}
        </div>

        {/* Caption e ações */}
        <div className="md:w-2/5 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              <span className="font-semibold">Preview do Post</span>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg ${nicheDisplay.color} flex items-center gap-1`}>
              <span>{nicheDisplay.icon}</span>
              <span>{nicheDisplay.name}</span>
            </span>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">{post.titulo}</h3>
              <p className="text-sm font-semibold text-primary mb-3">{post.texto_imagem}</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.caption}</p>
            </div>

            {/* Metadados */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span>{getStatusEmoji(post.status)} {post.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Criado:</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
              {post.scheduled_for && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <span className="font-semibold">📅 Agendado:</span>
                  <span>{formatDate(post.scheduled_for)}</span>
                </div>
              )}
              {post.published_at && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span className="font-semibold">✅ Publicado:</span>
                  <span>{formatDate(post.published_at)}</span>
                </div>
              )}
              {post.error_message && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <span className="font-semibold">⚠️ Erro:</span>
                  <span className="break-words">{post.error_message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="p-4 border-t flex flex-wrap gap-3 bg-gray-50 dark:bg-gray-800">
            <Button
              variant="secondary"
              className="gap-2 flex-1 min-w-[140px]"
              onClick={onPublishNow}
              disabled={isPublishing}
            >
              <Send className="h-4 w-4" />
              {isPublishing ? 'Publicando...' : '🚀 Publicar'}
            </Button>
            <Button
              className="flex-1 gap-2 min-w-[140px] bg-green-600 hover:bg-green-700"
              onClick={onApprove}
              disabled={isPublishing}
            >
              <CheckCircle className="h-4 w-4" />
              Aprovar
            </Button>
            <Button
              variant="destructive"
              className="gap-2 min-w-[120px]"
              onClick={onReject}
              disabled={isPublishing}
            >
              <XCircle className="h-4 w-4" />
              Rejeitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
