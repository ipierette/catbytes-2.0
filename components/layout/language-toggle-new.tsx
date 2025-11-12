'use client'

import { useLocale } from 'next-intl'
import { useState, useEffect } from 'react'

interface LanguageToggleProps {
  className?: string
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const locale = useLocale()
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Navegação inteligente - verifica se é artigo e se tem tradução
  const switchLanguage = async (newLocale: 'pt-BR' | 'en-US') => {
    if (!mounted || newLocale === locale) return
    
    setIsAnimating(true)
    
    try {
      const currentPath = window.location.pathname
      const pathWithoutLocale = currentPath.replace(/^\/(en-US|pt-BR)/, '') || '/'
      
      // Verificar se estamos em um artigo de blog (/blog/slug)
      const blogPostMatch = pathWithoutLocale.match(/^\/blog\/(.+)$/)
      
      if (blogPostMatch) {
        const currentSlug = blogPostMatch[1]
        
        // Buscar tradução do artigo
        try {
          const response = await fetch(`/api/blog/posts/${currentSlug}/translation?targetLocale=${newLocale}`)
          const translationData = await response.json()
          
          if (translationData.exists && !translationData.isSame) {
            // Artigo tem tradução, navegar para ela
            window.location.href = `/${newLocale}/blog/${translationData.slug}`
            return
          }
        } catch (error) {
          console.warn('Erro ao buscar tradução:', error)
        }
        
        // Se chegou aqui, não tem tradução - vai para home do idioma
        window.location.href = `/${newLocale}`
        return
      }
      
      // Para outras páginas, apenas trocar o idioma mantendo o path
      const newPath = `/${newLocale}${pathWithoutLocale}`
      window.location.href = newPath
      
    } catch (error) {
      console.error('Erro na troca de idioma:', error)
      // Fallback: navegação simples
      const currentPath = window.location.pathname
      const pathWithoutLocale = currentPath.replace(/^\/(en-US|pt-BR)/, '') || '/'
      const newPath = `/${newLocale}${pathWithoutLocale}`
      window.location.href = newPath
    }
  }

  const isPt = locale === 'pt-BR'
  const isEn = locale === 'en-US'

  if (!mounted) {
    return (
      <div className="w-32 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Container com muito mais destaque */}
      <div className="relative group">
        {/* Background com gradiente forte e bordas neon */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-indigo-500 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-90" />
        
        {/* Container interno */}
        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-1 border-2 border-purple-200 dark:border-purple-700/50 shadow-2xl">
          
          {/* Slider ativo com brilho */}
          <div
            className={`
              absolute top-1 bottom-1 w-[60px] rounded-xl transition-all duration-300 ease-out shadow-lg
              bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500
              shadow-purple-500/50 dark:shadow-purple-400/30
              ${isPt ? 'left-1' : 'left-[calc(100%-61px)]'}
              ${isAnimating ? 'scale-105 shadow-xl' : ''}
            `}
          />

          {/* Botões */}
          <div className="relative flex">
            {/* Botão Português */}
            <button
              onClick={() => {
                switchLanguage('pt-BR')
              }}
              disabled={isAnimating}
              className={`
                relative z-10 flex items-center justify-center w-[60px] h-10 rounded-xl
                font-bold text-sm transition-all duration-200 group/btn
                ${isPt 
                  ? 'text-white drop-shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-105'
                }
                ${isAnimating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              <span className={`mr-1 text-lg transition-transform group-hover/btn:scale-110 ${isPt ? 'animate-pulse' : ''}`}>🇧🇷</span>
              <span className="font-black tracking-wider">PT</span>
            </button>

            {/* Botão English */}
            <button
              onClick={() => {
                switchLanguage('en-US')
              }}
              disabled={isAnimating}
              className={`
                relative z-10 flex items-center justify-center w-[60px] h-10 rounded-xl
                font-bold text-sm transition-all duration-200 group/btn
                ${isEn 
                  ? 'text-white drop-shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-105'
                }
                ${isAnimating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              <span className={`mr-1 text-lg transition-transform group-hover/btn:scale-110 ${isEn ? 'animate-pulse' : ''}`}>🇺🇸</span>
              <span className="font-black tracking-wider">EN</span>
            </button>
          </div>

        </div>

        {/* Efeito de brilho externo */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      </div>
    </div>
  )
}