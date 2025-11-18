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

const nicheConfig: Record<string, { name: string; color: string; icon: string }> = {
  'Escritórios de Advocacia': { name: 'Advocacia', color: 'bg-blue-500 text-white', icon: '⚖️' },
  'Clínicas Médicas': { name: 'Medicina', color: 'bg-red-500 text-white', icon: '🏥' },
  'E-commerce': { name: 'E-commerce', color: 'bg-purple-500 text-white', icon: '🛒' },
  'Restaurantes': { name: 'Gastronomia', color: 'bg-orange-500 text-white', icon: '🍽️' },
  'Academias': { name: 'Fitness', color: 'bg-green-500 text-white', icon: '💪' },
  'Salões de Beleza': { name: 'Beleza', color: 'bg-pink-500 text-white', icon: '💇' },
  'Consultórios Odontológicos': { name: 'Odontologia', color: 'bg-cyan-500 text-white', icon: '🦷' },
  'Contabilidade': { name: 'Contábil', color: 'bg-yellow-600 text-white', icon: '💰' },
  'Imobiliárias': { name: 'Imóveis', color: 'bg-indigo-500 text-white', icon: '🏠' },
  'Oficinas Mecânicas': { name: 'Automotivo', color: 'bg-gray-700 text-white', icon: '🔧' },
  'advogados': { name: 'Advocacia', color: 'bg-blue-500 text-white', icon: '⚖️' },
  'medicos': { name: 'Medicina', color: 'bg-red-500 text-white', icon: '🏥' },
  'terapeutas': { name: 'Terapia', color: 'bg-purple-500 text-white', icon: '🧘' },
  'nutricionistas': { name: 'Nutrição', color: 'bg-green-500 text-white', icon: '🥗' }
}

const getNicheDisplay = (nicho: string) => {
  const config = nicheConfig[nicho]
  if (config) return config
  return { name: nicho, color: 'bg-slate-500 text-white', icon: '💼' }
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
            {(() => {
              const display = getNicheDisplay(post.nicho)
              return (
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg ${display.color} flex items-center gap-1`}>
                  <span>{display.icon}</span>
                  <span>{display.name}</span>
                </span>
              )
            })()}
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
