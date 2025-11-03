'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'

interface NewsletterSignupProps {
  variant?: 'blog' | 'footer' | 'offcanvas'
}

export function NewsletterSignup({ variant = 'blog' }: NewsletterSignupProps) {
  const t = useTranslations('newsletter')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: variant, locale }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar inscrição')
      }

      setSuccess(true)
      setEmail('')
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'blog') {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="my-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-3xl overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-2xl"
      >
        <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
          {/* Image Side */}
          <div className="relative h-64 md:h-full min-h-[300px]">
            <Image
              src="/images/newsletter.webp"
              alt="Newsletter CatBytes"
              fill
              className="object-contain drop-shadow-2xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Form Side */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-8 h-8 text-catbytes-purple dark:text-catbytes-pink" />
              <h3 className="text-3xl md:text-4xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent">
                Newsletter CatBytes
              </h3>
            </div>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Receba artigos exclusivos sobre tecnologia, IA e automação
              <strong className="text-catbytes-purple dark:text-catbytes-pink"> diretamente no seu email</strong>!
            </p>

            {/* Important Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-1">
                    📧 Para não cair no spam:
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    Adicione <strong>contato@catbytes.site</strong> aos seus contatos!
                  </p>
                </div>
              </div>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 text-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-green-900 dark:text-green-300 mb-2">
                  Inscrição Confirmada! 🎉
                </h4>
                <p className="text-green-800 dark:text-green-400 text-sm">
                  Verifique seu email para confirmar a inscrição.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome (opcional)"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Inscrevendo...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Inscrever-se Gratuitamente
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  Enviamos artigos 3x por semana. Cancele quando quiser.
                </p>
              </form>
            )}
          </div>
        </div>
      </motion.section>
    )
  }

  // Off-canvas variant - vertical layout
  if (variant === 'offcanvas') {
    return (
      <div className="space-y-4">
        {/* Important Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-1">
                {t('spamWarning')}
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                {t('addContact')} <strong>contato@catbytes.site</strong> {t('toContacts')}
              </p>
            </div>
          </div>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h4 className="text-xl font-bold text-green-900 dark:text-green-300 mb-2">
              {t('successTitle')}
            </h4>
            <p className="text-green-800 dark:text-green-400 text-sm">
              {t('successMessage')}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('nameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-catbytes-purple focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('subscribing')}
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  {t('subscribeButton')}
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
              {t('frequency')}
            </p>
          </form>
        )}
      </div>
    )
  }

  // Footer variant - compact
  return (
    <div className="bg-purple-900/20 border-2 border-purple-700 rounded-xl p-6">
      <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        <Mail className="w-5 h-5" />
        Newsletter
      </h4>
      <p className="text-sm text-gray-300 mb-4">
        Receba artigos sobre tech e IA no seu email
      </p>

      {success ? (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-green-300">Inscrição confirmada! 🎉</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:border-purple-400 focus:outline-none bg-gray-800 text-white text-sm"
          />

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Inscrevendo...
              </>
            ) : (
              'Inscrever-se'
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            📧 Adicione <strong>contato@catbytes.site</strong> aos contatos
          </p>
        </form>
      )}
    </div>
  )
}
