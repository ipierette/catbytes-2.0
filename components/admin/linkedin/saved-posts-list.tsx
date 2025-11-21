'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, ImageIcon } from 'lucide-react'
import { LinkedInPost, PostStatus } from '@/types/linkedin'

interface SavedPostsListProps {
  posts: LinkedInPost[]
  filterStatus: PostStatus
  loading: boolean
  deletingPostId: string | null
  onFilterChange: (status: PostStatus) => void
  onRefresh: () => void
  onLoadPost: (post: LinkedInPost) => void
  onDeletePost: (postId: string) => void
}

export function SavedPostsList({
  posts,
  filterStatus,
  loading,
  deletingPostId,
  onFilterChange,
  onRefresh,
  onLoadPost,
  onDeletePost
}: SavedPostsListProps) {
  const filteredPosts = posts.filter(p => filterStatus === 'all' || p.status === filterStatus)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">✓ Publicado</Badge>
      case 'approved':
        return <Badge variant="secondary">⏰ Agendado</Badge>
      case 'failed':
        return <Badge variant="destructive">✗ Falhou</Badge>
      default:
        return <Badge variant="outline">📝 Rascunho</Badge>
    }
  }

  const getStatusCount = (status: PostStatus) => {
    if (status === 'all') return posts.length
    return posts.filter(p => p.status === status).length
  }

  if (posts.length === 0) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>📝 Posts Salvos ({filteredPosts.length})</CardTitle>
            <CardDescription>Reutilize posts sem gastar créditos de API</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('all')}
              >
                Todos ({getStatusCount('all')})
              </Button>
              <Button
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('draft')}
              >
                Rascunhos ({getStatusCount('draft')})
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('approved')}
              >
                Agendados ({getStatusCount('approved')})
              </Button>
              <Button
                variant={filterStatus === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange('published')}
              >
                Publicados ({getStatusCount('published')})
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getStatusBadge(post.status)}
                    {post.image_url && (
                      <Badge variant="outline">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Com imagem
                      </Badge>
                    )}
                    {post.as_organization && (
                      <Badge variant="outline">🏢 Como Página</Badge>
                    )}
                  </div>
                  <p className="text-sm line-clamp-3 text-muted-foreground mb-2">
                    {post.text}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>
                      {new Date(post.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {post.scheduled_for && (
                      <>
                        <span>•</span>
                        <span>
                          📅 {new Date(post.scheduled_for).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLoadPost(post)}
                  >
                    Usar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeletePost(post.id)}
                    disabled={deletingPostId === post.id}
                  >
                    {deletingPostId === post.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '🗑️'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
