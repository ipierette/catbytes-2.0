'use client'

import { Twitter, Linkedin, Send, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonsProps {
  url: string
  title: string
  excerpt?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Sistema de compartilhamento robusto para posts do blog
 * - Pré-preenchido inteligentemente com título, descrição e URL
 * - Instagram abre perfil @catbytes_izadora_pierette
 * - Discord usa webhook para compartilhamento
 * - WhatsApp com mensagem formatada
 * - Twitter/X com texto otimizado
 * - LinkedIn com URL direta
 * - Botão de copiar link
 */
export function ShareButtons({ url, title, excerpt, className = '', size = 'md' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  // Tamanhos dos botões
  const sizes = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSize = sizes[size]
  const iconSize = iconSizes[size]

  // Textos inteligentes para compartilhamento
  const shareTexts = {
    // WhatsApp: mensagem amigável e completa
    whatsapp: `🚀 *${title}*\n\n${excerpt ? excerpt.substring(0, 150) + '...' : 'Confira este artigo incrível!'}\n\n📖 Leia mais em: ${url}\n\n💌 Assine nossa newsletter e receba mais conteúdos como este!`,
    
    // Twitter/X: otimizado para 280 caracteres
    twitter: `${title}\n\n${excerpt ? excerpt.substring(0, 100) + '...' : ''}\n\n📖 Leia mais 👇`,
    
    // LinkedIn: mais profissional
    linkedin: `${title}\n\n${excerpt || 'Confira este artigo sobre desenvolvimento web e tecnologia.'}\n\nLeia o artigo completo em: ${url}`,
    
    // Discord: formato markdown
    discord: `**${title}**\n\n${excerpt ? excerpt.substring(0, 200) : 'Novo artigo no blog!'}\n\n🔗 ${url}`,
  }

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url)

    const urls: Record<string, string> = {
      // Instagram: abre o perfil da CatBytes
      instagram: 'https://www.instagram.com/catbytes_izadora_pierette/',
      
      // Twitter/X com texto pré-preenchido
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTexts.twitter)}&url=${encodedUrl}`,
      
      // LinkedIn com título e URL
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      
      // WhatsApp com mensagem formatada
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTexts.whatsapp)}`,
      
      // Discord: copiar mensagem formatada para colar no Discord
      discord: '',
    }

    if (platform === 'discord') {
      // Copiar texto formatado para Discord
      navigator.clipboard.writeText(shareTexts.discord)
      alert('✅ Mensagem copiada! Cole no Discord para compartilhar.')
      return
    }

    const shareUrl = urls[platform]
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=500,noopener,noreferrer')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Instagram */}
      <button
        onClick={() => handleShare('instagram')}
        className={`${buttonSize} bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full transition-all transform hover:scale-110 shadow-lg`}
        aria-label="Siga no Instagram"
        title="Siga @catbytes_izadora_pierette no Instagram"
      >
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </button>

      {/* Twitter/X */}
      <button
        onClick={() => handleShare('twitter')}
        className={`${buttonSize} bg-black hover:bg-gray-800 text-white rounded-full transition-all transform hover:scale-110 shadow-lg`}
        aria-label="Compartilhar no Twitter/X"
        title="Compartilhar no Twitter/X"
      >
        <Twitter className={iconSize} />
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => handleShare('linkedin')}
        className={`${buttonSize} bg-blue-700 hover:bg-blue-800 text-white rounded-full transition-all transform hover:scale-110 shadow-lg`}
        aria-label="Compartilhar no LinkedIn"
        title="Compartilhar no LinkedIn"
      >
        <Linkedin className={iconSize} />
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => handleShare('whatsapp')}
        className={`${buttonSize} bg-green-600 hover:bg-green-700 text-white rounded-full transition-all transform hover:scale-110 shadow-lg`}
        aria-label="Compartilhar no WhatsApp"
        title="Compartilhar no WhatsApp"
      >
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

      {/* Discord */}
      <button
        onClick={() => handleShare('discord')}
        className={`${buttonSize} bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all transform hover:scale-110 shadow-lg`}
        aria-label="Copiar para Discord"
        title="Copiar mensagem formatada para Discord"
      >
        <Send className={iconSize} />
      </button>

      {/* Copiar Link */}
      <button
        onClick={handleCopyLink}
        className={`${buttonSize} bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-all transform hover:scale-110 shadow-lg`}
        aria-label={copied ? 'Link copiado!' : 'Copiar link'}
        title={copied ? 'Link copiado!' : 'Copiar link'}
      >
        {copied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
      </button>
    </div>
  )
}
