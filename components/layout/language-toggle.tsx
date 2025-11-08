'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useTransition } from 'react'

const languages = [
  { code: 'pt-BR', label: 'PT', flag: '🇧🇷' },
  { code: 'en-US', label: 'EN', flag: '🇺🇸' },
]

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return
    
    startTransition(() => {
      router.replace(pathname, { locale: newLocale })
    })
  }

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          disabled={isPending || locale === lang.code}
          className={`relative px-4 py-2 rounded-full font-medium transition-colors ${
            locale === lang.code
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
          whileHover={{ scale: locale === lang.code ? 1 : 1.05 }}
          whileTap={{ scale: locale === lang.code ? 1 : 0.95 }}
        >
          {locale === lang.code && (
            <motion.div
              layoutId="active-language"
              className="absolute inset-0 bg-catbytes-purple rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1">
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </span>
        </motion.button>
      ))}
    </div>
  )
}
