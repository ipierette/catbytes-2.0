import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, CheckCircle, XCircle, Calendar } from 'lucide-react'
import type { InstagramPost } from '@/lib/instagram'
import { getNicheDisplay, formatDateCompact } from '@/lib/instagram'

interface PostCardProps {
  post: InstagramPost
  bulkMode?: boolean
  selected?: boolean
  onSelect?: (postId: string) => void
  onClick?: () => void
  onEdit?: () => void
  onApprove?: () => void
  onReject?: () => void
}

export function PostCard({
  post,
  bulkMode = false,
  selected = false,
  onSelect,
  onClick,
  onEdit,
  onApprove,
  onReject
}: PostCardProps) {
  const handleClick = () => {
    if (bulkMode && onSelect) {
      onSelect(post.id)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        bulkMode 
          ? `cursor-pointer ${selected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/30'}` 
          : 'cursor-pointer hover:shadow-lg'
      }`}
      onClick={handleClick}
    >
      <div className="relative aspect-square bg-gray-100">
        <img
          src={post.image_url}
          alt={post.titulo}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/images/placeholder-instagram.png'
            e.currentTarget.alt = 'Imagem não disponível'
          }}
        />
        <div className="absolute top-2 right-2">
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
        {bulkMode && (
          <div className="absolute top-2 left-2">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect?.(post.id)}
              className="bg-white/90 border-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{post.titulo}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{post.texto_imagem}</p>
        
        {/* Data de Agendamento */}
        {post.scheduled_for && post.status === 'approved' && (
          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
            <Calendar className="h-3 w-3" />
            <span>{formatDateCompact(post.scheduled_for)}</span>
          </div>
        )}
        
        {/* Data de Publicação */}
        {post.published_at && post.status === 'published' && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Publicado em {formatDateCompact(post.published_at)}</span>
          </div>
        )}

        {/* Mensagem de Erro */}
        {post.error_message && post.status === 'failed' && (
          <div className="mt-2 text-xs text-red-600 line-clamp-2">
            ⚠️ {post.error_message}
          </div>
        )}
        
        {!bulkMode && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
              title="Editar conteúdo"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="default"
              className="flex-1 gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onApprove?.()
              }}
            >
              <CheckCircle className="h-3 w-3" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onReject?.()
              }}
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {bulkMode && (
          <div className="mt-3 text-center">
            <span className="text-xs text-muted-foreground">
              {selected ? '✓ Selecionado' : 'Clique para selecionar'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
