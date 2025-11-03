'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'

type VerificationStatus = 'loading' | 'success' | 'error' | 'invalid'

export function VerifyEmailContent() {
  const t = useTranslations('newsletterVerify')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('invalid')
      setMessage(t('invalidMessage'))
      return
    }

    verifyEmail(token)
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

  return (
    <main className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200 dark:border-purple-800">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 p-8 text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <Image
                src="/images/logo-desenvolvedora.png"
                alt="Logo Desenvolvedora"
                width={250}
                height={0}
                style={{ height: 'auto' }}
                className="object-contain"
              />
              <Image
                src="/images/catbytes-logo.png"
                alt="CatBytes Logo"
                width={250}
                height={0}
                style={{ height: 'auto' }}
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-comfortaa font-bold text-white">
              {t('title')}
            </h1>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {status === 'loading' && (
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
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
                className="text-center"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/20"></div>
                  </motion.div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('successTitle')}
                </h2>

                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  {message}
                </p>

                {email && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-8">
                    <Mail className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong>{email}</strong> {t('confirmedEmail')}
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    📬 {t('whatNext')}
                  </h3>
                  <ul className="text-left space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                      <span>{t('benefit1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                      <span>{t('benefit2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                      <span>{t('benefit3')}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 mb-8">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>💡 {t('spamTip')}</strong> {t('spamMessage')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={`/${locale}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Home className="w-5 h-5" />
                    {t('backToSite')}
                  </Link>
                  <Link
                    href={`/${locale}/blog`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl transition-all border-2 border-purple-300 dark:border-purple-700"
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
                className="text-center"
              >
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('errorTitle')}
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                  {message}
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3">
                    {t('possibleCauses')}
                  </h3>
                  <ul className="text-left space-y-2 text-red-800 dark:text-red-300">
                    <li>• {t('cause1')}</li>
                    <li>• {t('cause2')}</li>
                    <li>• {t('cause3')}</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={`/${locale}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Home className="w-5 h-5" />
                    {t('backToSite')}
                  </Link>
                  <button
                    onClick={() => router.refresh()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl transition-all border-2 border-purple-300 dark:border-purple-700"
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
                className="text-center"
              >
                <XCircle className="w-20 h-20 text-orange-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('invalidTitle')}
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                  {message}
                </p>

                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-8">
                  <p className="text-orange-800 dark:text-orange-300">
                    {t('invalidHelp')}
                  </p>
                </div>

                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  <Home className="w-5 h-5" />
                  {t('backToSite')}
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400 text-sm">
          <p>{t('footer')}</p>
        </div>
      </motion.div>
    </main>
  )
}
