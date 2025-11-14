'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Trash2, Clock, CheckCircle, Image as ImageIcon } from 'lucide-react'

interface LinkedInPost {
  id: string
  text: string
  image_url: string | null
  status: 'draft' | 'pending' | 'approved' | 'published' | 'failed'
  scheduled_for: string | null
  published_at: string | null
  post_type: string
  article_slug: string | null
  as_organization: boolean
  created_at: string
}

interface LinkedInSavedPostsProps {
  posts: LinkedInPost[]
  onLoadPost: (post: LinkedInPost) => void
  onDeletePost: (postId: string) => void
  onRefresh: () => void
  loading: boolean
  deletingPostId: string | null
}

export function LinkedInSavedPosts({
  posts,
  onLoadPost,
  onDeletePost,
  onRefresh,
  loading,
  deletingPostId
}: LinkedInSavedPostsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (posts.length === 0) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle>📝 Posts Salvos ({posts.length})</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
            <CardDescription>
              Clique em "Usar" para reutilizar um post sem gastar créditos
            </CardDescription>
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
      </CardHeader>
      
      {isOpen && (
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        post.status === 'published' ? 'default' :
                        post.status === 'approved' ? 'secondary' :
                        post.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {post.status === 'published' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {post.status === 'approved' && <Clock className="h-3 w-3 mr-1" />}
                        {post.status === 'published' ? 'Publicado' :
                         post.status === 'approved' ? 'Agendado' :
                         post.status === 'failed' ? 'Falhou' : 'Pendente'}
                      </Badge>
                      {post.image_url && (
                        <Badge variant="outline">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Com imagem
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {post.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(post.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onLoadPost(post)
                        setIsOpen(false) // Fechar após usar
                      }}
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
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
