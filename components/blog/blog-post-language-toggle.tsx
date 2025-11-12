'use client'

import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { motion } from 'framer-motion'
import { Globe, AlertCircle } from 'lucide-react'
import { useTransition, useState, useEffect } from 'react'

const languages = [
  { code: 'pt-BR', label: 'PT', flag: '🇧🇷' },
  { code: 'en-US', label: 'EN', flag: '🇺🇸' },
]

interface BlogPostLanguageToggleProps {
  currentSlug: string
}

interface TranslationResponse {
  exists: boolean
  slug?: string
  locale: string
  isSame?: boolean
  message?: string
}

export function BlogPostLanguageToggle({ currentSlug }: BlogPostLanguageToggleProps) {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [translationStatus, setTranslationStatus] = useState<Record<string, TranslationResponse>>({})
  const [showNoTranslationMessage, setShowNoTranslationMessage] = useState<string | null>(null)

  // Check for translations when component mounts
  useEffect(() => {
    const checkTranslations = async () => {
      for (const lang of languages) {
        if (lang.code !== locale) {
          try {
            const response = await fetch(`/api/blog/posts/${currentSlug}/translation?targetLocale=${lang.code}`)
            const data: TranslationResponse = await response.json()
            
            setTranslationStatus(prev => ({
              ...prev,
              [lang.code]: data
            }))
          } catch (error) {
            console.error(`Error checking translation for ${lang.code}:`, error)
            setTranslationStatus(prev => ({
              ...prev,
              [lang.code]: { exists: false, locale: lang.code, message: 'Error checking translation' }
            }))
          }
        }
      }
    }

    checkTranslations()
  }, [currentSlug, locale])

  const switchLanguage = (targetLocale: string) => {
    if (targetLocale === locale) return
    
    const translationInfo = translationStatus[targetLocale]
    
    if (translationInfo?.exists && translationInfo.slug && !translationInfo.isSame) {
      // Translation exists, redirect to translated post
      startTransition(() => {
        router.push(`/${targetLocale}/blog/${translationInfo.slug}`)
      })
    } else if (!translationInfo?.exists) {
      // No translation available, show message
      const languageName = targetLocale === 'en-US' ? 'English' : 'Português'
      setShowNoTranslationMessage(languageName)
      
      // Hide message after 3 seconds
      setTimeout(() => setShowNoTranslationMessage(null), 3000)
    } else {
      // Fallback to regular language switch (shouldn't happen for same locale)
      startTransition(() => {
        router.replace(`/${targetLocale}/blog/${currentSlug}`)
      })
    }
  }

  const getButtonStatus = (langCode: string) => {
    if (langCode === locale) return 'current'
    
    const translation = translationStatus[langCode]
    if (!translation) return 'loading'
    if (translation.exists) return 'available'
    return 'unavailable'
  }

  const getButtonTooltip = (langCode: string) => {
    const status = getButtonStatus(langCode)
    const languageName = langCode === 'en-US' ? 'English' : 'Português'
    
    switch (status) {
      case 'current':
        return `Current language: ${languageName}`
      case 'loading':
        return `Checking ${languageName} translation...`
      case 'available':
        return `Switch to ${languageName} version`
      case 'unavailable':
        return `${languageName} translation not available`
      default:
        return languageName
    }
  }

  return (
    <div className="relative">
      {/* No Translation Message */}
      {showNoTranslationMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              No {showNoTranslationMessage} version available
            </span>
          </div>
        </motion.div>
      )}

      {/* Language Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
        <Globe className="w-4 h-4 text-gray-500 ml-2" />
        {languages.map((lang) => {
          const status = getButtonStatus(lang.code)
          const isDisabled = status === 'unavailable' || isPending || status === 'loading'
          
          return (
            <motion.button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              disabled={isDisabled || locale === lang.code}
              title={getButtonTooltip(lang.code)}
              className={`relative px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                locale === lang.code
                  ? 'text-white'
                  : status === 'available'
                  ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  : status === 'unavailable'
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                  : status === 'loading'
                  ? 'text-gray-500 dark:text-gray-500 cursor-wait opacity-75'
                  : 'text-gray-600 dark:text-gray-400'
              } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
              whileHover={{ 
                scale: (locale === lang.code || isDisabled) ? 1 : 1.05 
              }}
              whileTap={{ 
                scale: (locale === lang.code || isDisabled) ? 1 : 0.95 
              }}
            >
              {locale === lang.code && (
                <motion.div
                  layoutId="active-language-blog"
                  className="absolute inset-0 bg-catbytes-purple rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {status === 'loading' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full ml-1"
                  />
                )}
                {status === 'unavailable' && (
                  <span className="w-3 h-3 flex items-center justify-center ml-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  </span>
                )}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}