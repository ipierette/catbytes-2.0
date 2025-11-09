'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { PostCard } from '@/components/blog/post-card'
import type { BlogPost, PaginatedBlogPosts } from '@/types/blog'
import { blogSync } from '@/lib/blog-sync'

export default function BlogPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'pt-BR'
  
  const [posts, setPosts] = useState<PaginatedBlogPosts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Fetch posts function
  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/blog/posts?page=${currentPage}&pageSize=${pageSize}&locale=${locale}`)

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      setPosts(data)
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch posts
  useEffect(() => {
    fetchPosts()
  }, [currentPage, locale])

  // Subscribe to blog sync updates
  useEffect(() => {
    const unsubscribe = blogSync.subscribe((updatedPost) => {
      setPosts((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          posts: prev.posts.map((p) => 
            p.id === updatedPost.id ? updatedPost : p
          ),
        }
      })
    })

    return unsubscribe
  }, [])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4 pb-2">
            <BookOpen className="w-12 h-12 text-catbytes-purple dark:text-catbytes-pink" />
            <h1 className="text-4xl md:text-6xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent leading-tight pb-1">
              Blog CatBytes
            </h1>
          </div>

          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Insights sobre tecnologia, IA, automação e desenvolvimento web.
            <br />
            Conteúdo criado para impulsionar seu negócio digital! 🚀
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-catbytes-purple dark:text-catbytes-pink animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Carregando artigos...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <p className="text-red-700 dark:text-red-300 font-medium mb-2">
              Erro ao carregar artigos
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setCurrentPage(1)}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && posts && posts.posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            {posts.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-4 mt-12"
              >
                {/* Previous button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>{Array.from({ length: posts.totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === posts.totalPages ||
                      Math.abs(page - currentPage) <= 1

                    if (!showPage) {
                      // Show ellipsis
                      if (page === 2 && currentPage > 3) {
                        return (
                          <span
                            key={page}
                            className="px-2 text-gray-400 dark:text-gray-600"
                          >
                            ...
                          </span>
                        )
                      }
                      if (page === posts.totalPages - 1 && currentPage < posts.totalPages - 2) {
                        return (
                          <span
                            key={page}
                            className="px-2 text-gray-400 dark:text-gray-600"
                          >
                            ...
                          </span>
                        )
                      }
                      return null
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-catbytes-purple to-catbytes-blue text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-catbytes-purple dark:hover:border-catbytes-pink'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                {/* Next button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(posts.totalPages, p + 1))}
                  disabled={currentPage === posts.totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-catbytes-purple dark:hover:border-catbytes-pink disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Próxima
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Post count info */}
            <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
              Mostrando{' '}
              <strong className="text-catbytes-purple dark:text-catbytes-pink">
                {posts.posts.length}
              </strong>{' '}
              de{' '}
              <strong className="text-catbytes-purple dark:text-catbytes-pink">
                {posts.total}
              </strong>{' '}
              artigos
            </p>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && posts && posts.posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              Nenhum artigo publicado ainda
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Em breve teremos conteúdo incrível por aqui! 🐱
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
