'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Filter, X } from 'lucide-react'
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
  const [availableThemes, setAvailableThemes] = useState<string[]>([])
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const pageSize = 9 // Mudou de 10 para 9

  // Fetch available themes
  const fetchThemes = async () => {
    try {
      const response = await fetch(`/api/blog/themes?locale=${locale}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableThemes(data.themes || [])
      }
    } catch (err) {
      console.error('Error fetching themes:', err)
    }
  }

  // Fetch posts function
  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = `/api/blog/posts?page=${currentPage}&pageSize=${pageSize}&locale=${locale}`
      
      if (selectedTheme) {
        url += `&theme=${encodeURIComponent(selectedTheme)}`
      }
      
      if (selectedPeriod) {
        url += `&period=${selectedPeriod}`
      }

      const response = await fetch(url)

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

  // Fetch themes on mount
  useEffect(() => {
    fetchThemes()
  }, [locale])

  // Fetch posts
  useEffect(() => {
    fetchPosts()
  }, [currentPage, locale, selectedTheme, selectedPeriod])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTheme, selectedPeriod])

  // Clear all filters
  const clearFilters = () => {
    setSelectedTheme('')
    setSelectedPeriod('')
  }

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
            Insights sobre tecnologia, IA, automação e desenvolvimento web e curiosidade sobre gatos.
            <br />
            Conteúdo criado para impulsionar seu negócio digital! 🚀 e para melhor entender seus gatinhos!!
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-catbytes-purple dark:hover:border-catbytes-pink transition-all"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            {(selectedTheme || selectedPeriod) && (
              <span className="ml-2 px-2 py-1 bg-catbytes-purple text-white text-xs rounded-full">
                {[selectedTheme, selectedPeriod].filter(Boolean).length}
              </span>
            )}
          </button>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {/* Theme Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tema
                  </label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-catbytes-purple dark:focus:border-catbytes-pink outline-none transition-colors"
                  >
                    <option value="">Todos os temas</option>
                    {availableThemes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Period Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-catbytes-purple dark:focus:border-catbytes-pink outline-none transition-colors"
                  >
                    <option value="">Todos os períodos</option>
                    <option value="last7days">Últimos 7 dias</option>
                    <option value="last30days">Últimos 30 dias</option>
                    <option value="last3months">Últimos 3 meses</option>
                    <option value="last6months">Últimos 6 meses</option>
                    <option value="lastyear">Último ano</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(selectedTheme || selectedPeriod) && (
                <div className="mt-4 text-center">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-catbytes-purple dark:hover:text-catbytes-pink transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpar filtros
                  </button>
                </div>
              )}
            </motion.div>
          )}
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
                  locale={locale}
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
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-catbytes-purple dark:hover:border-catbytes-pink disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Anterior
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: posts.totalPages }, (_, i) => i + 1).map((page) => {
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
