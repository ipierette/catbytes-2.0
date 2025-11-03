'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { BlogPost } from '@/types/blog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PostModal } from '@/components/blog/post-modal'

export function RecentPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const params = useParams()
  const locale = params.locale as string

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch('/api/blog/posts?page=1&pageSize=2')

        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }

        const data = await response.json()
        setPosts(data.posts || [])
      } catch (error) {
        console.error('Error fetching recent posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentPosts()
  }, [])

  // Don't show section if no posts
  if (!loading && posts.length === 0) {
    return null
  }

  return (
    <section
      id="blog"
      className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-catbytes-purple dark:text-catbytes-pink" />
            <h2 className="text-4xl md:text-5xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent">
              Blog CatBytes
            </h2>
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Fique por dentro das últimas novidades em tecnologia, IA e automação
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-catbytes-purple dark:text-catbytes-pink animate-spin" />
          </div>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 max-w-5xl mx-auto">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedPost(post)}
                  className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-catbytes-purple dark:hover:border-catbytes-pink"
                >
                  {/* Image */}
                  <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-600">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-catbytes-purple/90 dark:bg-catbytes-pink/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <time
                      dateTime={post.created_at}
                      className="text-sm text-gray-500 dark:text-gray-400 mb-2 block"
                    >
                      {format(new Date(post.created_at), "dd 'de' MMMM, yyyy", {
                        locale: ptBR,
                      })}
                    </time>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-catbytes-purple dark:group-hover:text-catbytes-pink transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Read more */}
                    <div className="flex items-center gap-2 text-catbytes-purple dark:text-catbytes-pink font-medium group-hover:gap-3 transition-all">
                      <span>Ler mais</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* View all posts button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Link
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <BookOpen className="w-5 h-5" />
                Ver todos os artigos
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </>
        )}
      </div>

      {/* Post Modal */}
      <PostModal post={selectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} />
    </section>
  )
}
