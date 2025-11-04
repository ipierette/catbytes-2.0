'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { BlogPost } from '@/types/blog'
import { PullToRefresh } from '@/components/app/gestures'
import { AppSkeleton, AppCard, AppChip } from '@/components/app/native-ui'

interface BlogFeedProps {
  locale: string
}

export default function BlogFeed({ locale }: BlogFeedProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/blog/posts?locale=${locale}&pageSize=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [locale])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <AppSkeleton width="100%" height="200px" />
        <AppSkeleton width="100%" height="200px" />
        <AppSkeleton width="100%" height="200px" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Erro ao carregar posts
          </p>
          <button
            onClick={fetchPosts}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Nenhum post encontrado
          </p>
        </div>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={fetchPosts}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'}
          </p>
        </div>

        {/* Posts Grid */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/${locale}/blog/${post.slug}`}>
                <AppCard className="overflow-hidden">
                  {/* Cover Image */}
                  {post.cover_image_url && (
                    <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    {/* Category */}
                    {post.category && (
                      <AppChip color="purple">
                        {post.category}
                      </AppChip>
                    )}

                    {/* Title */}
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      {post.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(post.created_at).toLocaleDateString(locale, {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{Math.ceil(post.content.split(' ').length / 200)} min</span>
                      </div>

                      <ChevronRight className="w-4 h-4 ml-auto text-purple-500" />
                    </div>
                  </div>
                </AppCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More CTA */}
        {posts.length >= 20 && (
          <div className="text-center pt-8 pb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Arraste para baixo para atualizar
            </p>
          </div>
        )}
      </div>
    </PullToRefresh>
  )
}
