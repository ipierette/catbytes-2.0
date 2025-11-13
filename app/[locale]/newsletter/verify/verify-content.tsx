'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, Home, BookOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'

type VerificationStatus = 'loading' | 'success' | 'error' | 'invalid'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url: string
  category: string
  created_at: string
}

export function VerifyEmailContent() {
  const t = useTranslations('newsletterVerify')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('invalid')
      setMessage(t('invalidMessage'))
      return
    }

    verifyEmail(token)
    fetchFeaturedPosts()
  }, [searchParams, t])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/newsletter/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verificado com sucesso!')
        setEmail(data.email || '')
      } else {
        setStatus('error')
        setMessage(data.error || t('errorTitle'))
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage(t('errorTitle'))
    }
  }

  const fetchFeaturedPosts = async () => {
    try {
      const response = await fetch(`/api/blog/posts?status=published&limit=3&locale=${locale}`)
      if (response.ok) {
        const data = await response.json()
        setFeaturedPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Simplified Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 p-6 sm:p-8 text-center">
            <Sparkles className="w-12 h-12 text-white mx-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {t('title')}
            </h1>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-12">
            {status === 'loading' && (
              <div className="text-center py-8">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-6" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('verifying')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('verifyingMessage')}
                </p>
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                {/* Success Message */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4" />
                  </motion.div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {t('successTitle')}
                  </h2>

                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6">
                    {message}
                  </p>

                  {email && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 max-w-md mx-auto">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-green-800 dark:text-green-300">
                        <strong className="break-all">{email}</strong>
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        {t('confirmedEmail')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Featured Blog Posts */}
                {featuredPosts.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <div className="text-center mb-6">
                      <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {locale === 'pt-BR' ? 'Veja agora alguns dos nossos artigos' : 'Check out some of our articles'}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {locale === 'pt-BR' ? 'Comece a explorar conteúdos exclusivos' : 'Start exploring exclusive content'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      {featuredPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <Link 
                            href={`/${locale}/blog/${post.slug}`}
                            className="group block bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all hover:shadow-lg"
                          >
                            {/* Image */}
                            <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-600 dark:to-gray-700">
                              {post.cover_image_url ? (
                                <Image
                                  src={post.cover_image_url}
                                  alt={post.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Category Badge */}
                              <div className="absolute top-2 left-2">
                                <span className="px-3 py-1 bg-purple-600/90 text-white text-xs font-bold rounded-full">
                                  {post.category}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm sm:text-base">
                                {post.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">
                                <span>{locale === 'pt-BR' ? 'Ler artigo' : 'Read article'}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                    📬 {t('whatNext')}
                  </h3>
                  <ul className="space-y-2 sm:space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0">✓</span>
                      <span>{t('benefit1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0">✓</span>
                      <span>{t('benefit2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0">✓</span>
                      <span>{t('benefit3')}</span>
                    </li>
                  </ul>
                </div>

                {/* Spam Warning */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>💡 {t('spamTip')}</strong> {t('spamMessage')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Link
                    href={`/${locale}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <Home className="w-5 h-5" />
                    {t('backToSite')}
                  </Link>
                  <Link
                    href={`/${locale}/blog`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl transition-all border-2 border-purple-300 dark:border-purple-700 text-sm sm:text-base"
                  >
                    {t('viewBlog')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6"
              >
                <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('errorTitle')}
                </h2>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-8">
                  {message}
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 mb-8">
                  <h3 className="text-base sm:text-lg font-bold text-red-900 dark:text-red-300 mb-3">
                    {t('possibleCauses')}
                  </h3>
                  <ul className="text-left space-y-2 text-sm sm:text-base text-red-800 dark:text-red-300">
                    <li>• {t('cause1')}</li>
                    <li>• {t('cause2')}</li>
                    <li>• {t('cause3')}</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link
                    href={`/${locale}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    <Home className="w-5 h-5" />
                    {t('backToSite')}
                  </Link>
                  <button
                    onClick={() => router.refresh()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl transition-all border-2 border-purple-300 dark:border-purple-700 text-sm sm:text-base"
                  >
                    {t('tryAgain')}
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'invalid' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6"
              >
                <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-orange-500 mx-auto mb-6" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('invalidTitle')}
                </h2>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-8">
                  {message}
                </p>

                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 sm:p-6 mb-8">
                  <p className="text-sm sm:text-base text-orange-800 dark:text-orange-300">
                    {t('invalidHelp')}
                  </p>
                </div>

                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <Home className="w-5 h-5" />
                  {t('backToSite')}
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-gray-600 dark:text-gray-400 text-xs sm:text-sm px-4">
          <p>{t('footer')}</p>
        </div>
      </motion.div>
    </main>
  )
}
