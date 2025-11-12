'use client'

import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { motion } from 'framer-motion'
import { Globe, AlertCircle } from 'lucide-react'
import { useTransition, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const languages = [
  { code: 'pt-BR', label: 'PT', flag: '🇧🇷' },
  { code: 'en-US', label: 'EN', flag: '🇺🇸' },
]

interface BlogLanguageToggleProps {
  currentSlug?: string // Optional - only for individual post pages
}

interface TranslationResponse {
  exists: boolean
  slug?: string
  locale: string
  isSame?: boolean
  message?: string
}

export function BlogLanguageToggle({ currentSlug }: BlogLanguageToggleProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [translationStatus, setTranslationStatus] = useState<Record<string, TranslationResponse>>({})
  const [showNoTranslationMessage, setShowNoTranslationMessage] = useState<string | null>(null)

  // Determine if we're on the blog listing page or individual post page
  const isBlogListingPage = pathname.endsWith('/blog')
  const isIndividualPostPage = !!currentSlug && !isBlogListingPage

  console.log('[BlogLanguageToggle] Context:', { 
    pathname, 
    currentSlug, 
    isBlogListingPage, 
    isIndividualPostPage, 
    locale 
  })

  // Check for translations when component mounts (only for individual posts)
  useEffect(() => {
    if (!isIndividualPostPage || !currentSlug) {
      console.log('[BlogLanguageToggle] Not checking translations - not an individual post page')
      return
    }

    const checkTranslations = async () => {
      console.log('[BlogLanguageToggle] Checking translations for slug:', currentSlug, 'current locale:', locale)
      
      for (const lang of languages) {
        if (lang.code !== locale) {
          try {
            const apiUrl = `/api/blog/posts/${currentSlug}/translation?currentLocale=${locale}&targetLocale=${lang.code}`
            console.log('[BlogLanguageToggle] Calling API:', apiUrl)
            
            const response = await fetch(apiUrl)
            const data: TranslationResponse = await response.json()
            
            console.log('[BlogLanguageToggle] Translation check result for', lang.code, ':', data)
            
            setTranslationStatus(prev => ({
              ...prev,
              [lang.code]: data
            }))
          } catch (error) {
            console.error(`[BlogLanguageToggle] Error checking translation for ${lang.code}:`, error)
            setTranslationStatus(prev => ({
              ...prev,
              [lang.code]: { exists: false, locale: lang.code, message: 'Error checking translation' }
            }))
          }
        }
      }
    }

    checkTranslations()
  }, [currentSlug, locale, isIndividualPostPage])

  const switchLanguage = (targetLocale: string) => {
    if (targetLocale === locale) return
    
    console.log('[BlogLanguageToggle] Switching language to:', targetLocale)

    if (isBlogListingPage) {
      // For blog listing page, just switch locale
      console.log('[BlogLanguageToggle] Navigating to blog listing in:', targetLocale)
      startTransition(() => {
        router.push(`/${targetLocale}/blog`)
      })
      return
    }

    if (isIndividualPostPage) {
      const translationInfo = translationStatus[targetLocale]
      
      if (translationInfo?.exists && translationInfo.slug && !translationInfo.isSame) {
        // Translation exists, redirect to translated post
        console.log('[BlogLanguageToggle] Navigating to translation:', `/${targetLocale}/blog/${translationInfo.slug}`)
        startTransition(() => {
          router.push(`/${targetLocale}/blog/${translationInfo.slug}`)
        })
      } else if (!translationInfo?.exists) {
        // No translation available, show message
        const languageName = targetLocale === 'en-US' ? 'English' : 'Português'
        console.log('[BlogLanguageToggle] No translation available for:', targetLocale)
        setShowNoTranslationMessage(languageName)
        
        // Hide message after 3 seconds
        setTimeout(() => setShowNoTranslationMessage(null), 3000)
      } else {
        // Fallback: try to navigate anyway, but log it
        console.log('[BlogLanguageToggle] Fallback navigation to:', `/${targetLocale}/blog/${currentSlug}`)
        startTransition(() => {
          router.push(`/${targetLocale}/blog/${currentSlug}`)
        })
      }
    }
  }

  const getButtonStatus = (langCode: string) => {
    if (langCode === locale) return 'current'
    
    // For blog listing page, always show as available
    if (isBlogListingPage) return 'available'
    
    // For individual posts, check translation status
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
        return isIndividualPostPage 
          ? `Checking ${languageName} translation...`
          : `Switch to ${languageName}`
      case 'available':
        return `Switch to ${languageName} ${isBlogListingPage ? 'blog' : 'version'}`
      case 'unavailable':
        return `${languageName} translation not available for this post`
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
          const isDisabled = (status === 'unavailable' && isIndividualPostPage) || isPending || (status === 'loading' && isIndividualPostPage)
          
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
                {status === 'loading' && isIndividualPostPage && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full ml-1"
                  />
                )}
                {status === 'unavailable' && isIndividualPostPage && (
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