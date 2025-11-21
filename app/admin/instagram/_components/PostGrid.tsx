import { Instagram } from 'lucide-react'
import type { InstagramPost } from '@/lib/instagram'
import { PostCard } from './PostCard'

interface PostGridProps {
  posts: InstagramPost[]
  loading?: boolean
  emptyMessage?: string
  bulkMode?: boolean
  selectedIds?: Set<string>
  onSelectPost?: (postId: string) => void
  onPostClick?: (post: InstagramPost) => void
  onEditPost?: (post: InstagramPost) => void
  onApprovePost?: (post: InstagramPost) => void
  onRejectPost?: (post: InstagramPost) => void
}

export function PostGrid({
  posts,
  loading = false,
  emptyMessage = 'Nenhum post encontrado.',
  bulkMode = false,
  selectedIds = new Set(),
  onSelectPost,
  onPostClick,
  onEditPost,
  onApprovePost,
  onRejectPost
}: PostGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Instagram className="h-12 w-12 mb-4 opacity-20" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          bulkMode={bulkMode}
          selected={selectedIds.has(post.id)}
          onSelect={onSelectPost}
          onClick={() => onPostClick?.(post)}
          onEdit={() => onEditPost?.(post)}
          onApprove={() => onApprovePost?.(post)}
          onReject={() => onRejectPost?.(post)}
        />
      ))}
    </div>
  )
}
