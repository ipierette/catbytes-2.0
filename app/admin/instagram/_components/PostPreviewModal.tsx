import { Button } from '@/components/ui/button'
import { Instagram, Send, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react'
import { InstagramPost } from '../_hooks/useInstagramPosts'

interface PostPreviewModalProps {
  post: InstagramPost | null
  isPublishing?: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onPublishNow: () => void
}

const nicheColors: Record<string, string> = {
  advogados: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medicos: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  terapeutas: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  nutricionistas: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

const nicheNames: Record<string, string> = {
  advogados: 'Advogados',
  medicos: 'Médicos',
  terapeutas: 'Terapeutas',
  nutricionistas: 'Nutricionistas'
}

export function PostPreviewModal({
  post,
  isPublishing = false,
  onClose,
  onApprove,
  onReject,
  onPublishNow
}: PostPreviewModalProps) {
  if (!post) return null

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagem */}
        <div className="md:w-3/5 bg-black flex items-center justify-center">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.titulo}
              className="w-full h-auto max-h-[90vh] object-contain"
              onError={(e) => {
                console.error('Erro ao carregar imagem:', post.image_url)
                e.currentTarget.src = '/images/placeholder-instagram.png'
                e.currentTarget.alt = 'Imagem não disponível'
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white p-8">
              <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-sm opacity-75">Imagem não disponível</p>
            </div>
          )}
        </div>

        {/* Caption e ações */}
        <div className="md:w-2/5 flex flex-col max-h-[90vh]">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5" />
              <span className="font-semibold">Preview do Post</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${nicheColors[post.nicho]}`}>
              {nicheNames[post.nicho] || post.nicho}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">{post.titulo}</h3>
              <p className="text-sm font-semibold text-primary mb-3">{post.texto_imagem}</p>
              <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Gerado em: {new Date(post.created_at).toLocaleString('pt-BR')}</p>
              {post.scheduled_for && (
                <p>Agendado para: {new Date(post.scheduled_for).toLocaleString('pt-BR')}</p>
              )}
              {post.published_at && (
                <p>Publicado em: {new Date(post.published_at).toLocaleString('pt-BR')}</p>
              )}
              {post.error_message && (
                <p className="text-red-600">Erro: {post.error_message}</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t flex flex-wrap gap-3">
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
              className="flex-1 gap-2 min-w-[140px]"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4" />
              Aprovar
            </Button>
            <Button
              variant="destructive"
              className="gap-2 min-w-[120px]"
              onClick={onReject}
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
