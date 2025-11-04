'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ArrowRight, Loader2, Mail, X, ImageOff } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { BlogPost } from '@/types/blog'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import { PostModal } from '@/components/blog/post-modal'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'
import { useTranslations } from 'next-intl'

export function RecentPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('blog')
  const dateLocale = locale === 'en-US' ? enUS : ptBR

  const handleImageError = (postId: string) => {
    setImageErrors(prev => new Set(prev).add(postId))
  }

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

  return (
    <section
      id="blog"
      className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 relative"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6 pb-2">
            <h2 className="text-4xl md:text-5xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent leading-tight pb-2">
              {t('title')}
            </h2>
            <BookOpen className="w-10 h-10 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0" />
          </div>

          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-catbytes-purple dark:text-catbytes-pink animate-spin" />
          </div>
        )}

        {/* No Posts State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <BookOpen className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">
              {t('noPosts')}
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-8">
              {t('noPostsMessage')}
            </p>
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
                    {!imageErrors.has(post.id) && (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                        loading="lazy"
                        unoptimized
                        onError={() => handleImageError(post.id)}
                      />
                    )}

                    {/* Fallback icon quando imagem falha */}
                    {imageErrors.has(post.id) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageOff className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 z-10">
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
                      {format(new Date(post.created_at),
                        locale === 'en-US' ? "MMMM dd, yyyy" : "dd 'de' MMMM, yyyy",
                        { locale: dateLocale }
                      )}
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
                      <span>{t('readMore')}</span>
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
              className="text-center mb-16"
            >
              <Link
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <BookOpen className="w-5 h-5" />
                {t('viewAllPosts')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

          </>
        )}
      </div>

      {/* Floating Newsletter Button */}
      <button
        onClick={() => setShowNewsletter(true)}
        className="absolute right-0 top-1/3 bg-gradient-to-r from-catbytes-purple to-catbytes-pink hover:from-catbytes-pink hover:to-catbytes-blue text-white px-2 py-8 md:px-3 md:py-12 rounded-l-2xl shadow-2xl z-40 flex flex-col items-center gap-2 transition-all duration-300 hover:scale-105"
        aria-label={t('newsletterButton')}
        style={{ writingMode: 'vertical-rl' }}
      >
        <Mail className="w-6 h-6 md:w-7 md:h-7" style={{ writingMode: 'horizontal-tb' }} />
        <span className="text-xs md:text-sm font-bold">
          {t('newsletter')}
        </span>
      </button>

      {/* Newsletter Off-Canvas */}
      <AnimatePresence>
        {showNewsletter && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewsletter(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Off-Canvas Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-catbytes-purple to-catbytes-pink text-white p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6" />
                  <h3 className="text-2xl font-comfortaa font-bold">
                    {t('newsletterTitle')}
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewsletter(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label={t('close')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Newsletter Image */}
                <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/newsletter.webp"
                    alt="Newsletter CatBytes"
                    fill
                    className="object-contain"
                    sizes="500px"
                  />
                </div>

                {/* Description */}
                <div className="text-center">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('newsletterDescription')} <strong className="text-catbytes-purple dark:text-catbytes-pink">{t('newsletterDescriptionHighlight')}</strong>!
                  </p>
                </div>

                {/* Newsletter Form */}
                <NewsletterSignup variant="offcanvas" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Post Modal */}
      <PostModal post={selectedPost} isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} />
    </section>
  )
}
