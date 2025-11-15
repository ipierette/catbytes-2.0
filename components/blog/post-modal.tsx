'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Calendar, Eye, Tag, Share2, ImageOff } from 'lucide-react'
import { ShareButtons } from './share-buttons'
import type { BlogPost } from '@/types/blog'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { useBlogPostTracking } from '@/components/analytics/analytics-tracker'
import { blogSync } from '@/lib/blog-sync'
import { formatMarkdown } from '@/lib/markdown-formatter'
import { useRouter } from 'next/navigation'

interface PostModalProps {
  post: BlogPost | null
  isOpen: boolean
  onClose: () => void
  onViewIncremented?: (updatedPost: BlogPost) => void // Callback when views are incremented
}

export function PostModal({ post, isOpen, onClose, onViewIncremented }: PostModalProps) {
  const [imageError, setImageError] = useState(false)
  const router = useRouter()
  // Use pt-BR as default since this is admin context
  const locale = 'pt-BR'
  const dateLocale = ptBR

  // Reset image error when post changes
  useEffect(() => {
    if (!post?.cover_image_url || post.cover_image_url.trim() === '') {
      setImageError(true)
    } else {
      setImageError(false)
    }
  }, [post?.cover_image_url])

  // Track blog post views when modal is open
  // Hook must be called at the top level - conditionally enable/disable tracking
  useBlogPostTracking(
    post?.id || '', 
    post?.slug || '', 
    post?.title || '',
    isOpen && !!post // Only track when modal is open and post exists
  )

  // Note: Views are incremented by ViewCounter component on the actual blog post page
  // PostModal just displays the post data without incrementing views
  // This prevents double-counting when users open the modal

  // Reset image error when modal opens with new post
  useEffect(() => {
    if (isOpen) {
      setImageError(false)
    }
  }, [isOpen, post?.id])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!post) return null

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : ''
  const shareText = `Confira: ${post.title}`

  // Extrair imagens do conteúdo Markdown
  const extractImagesFromContent = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g
    const matches = content.matchAll(imageRegex)
    const images = Array.from(matches, m => m[1])
    console.log('[PostModal] Extracted images from content:', images)
    console.log('[PostModal] Content:', content.substring(0, 500))
    return images
  }

  const contentImages = extractImagesFromContent(post.content)
  const hasContentImages = contentImages.length > 0
  
  console.log('[PostModal] Content images:', contentImages)
  console.log('[PostModal] Has content images:', hasContentImages)

  // Dividir o conteúdo em seções para layout de revista
  const splitContentForMagazineLayout = (content: string) => {
    // Remove imagens do conteúdo para processar separadamente
    const textContent = content.replace(/!\[.*?\]\(.*?\)/g, '')
    
    // Divide em parágrafos
    const paragraphs = textContent.split('\n\n').filter(p => p.trim())
    const totalParagraphs = paragraphs.length
    
    // Para layout com 2 imagens - divisão proporcional 30%/40%/30%
    if (contentImages.length >= 2) {
      const introEnd = Math.ceil(totalParagraphs * 0.30)
      const middleEnd = Math.ceil(totalParagraphs * 0.70)
      
      return {
        intro: paragraphs.slice(0, introEnd).join('\n\n') || '',
        middle: paragraphs.slice(introEnd, middleEnd).join('\n\n') || '',
        end: paragraphs.slice(middleEnd).join('\n\n') || '',
      }
    }
    
    // Para layout com 1 imagem - divide ao meio
    if (contentImages.length === 1) {
      const half = Math.ceil(totalParagraphs / 2)
      return {
        intro: paragraphs.slice(0, half).join('\n\n') || '',
        middle: '',
        end: paragraphs.slice(half).join('\n\n') || '',
      }
    }
    
    // Layout padrão sem imagens
    return {
      intro: content,
      middle: '',
      end: '',
    }
  }

  const sections = splitContentForMagazineLayout(post.content)

  // URL completa e dinâmica do post
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname.includes('/blog/') ? window.location.pathname : `/blog/${post.slug}`}`
    : ''

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="min-h-screen px-4 flex items-center justify-center">
              <motion.article
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8"
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm"
                  aria-label="Fechar"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Cover Image */}
                <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-600">
                  {!imageError && post.cover_image_url && post.cover_image_url.trim() !== '' && (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1200px) 90vw, 1200px"
                      priority
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  )}

                  {/* Fallback icon quando imagem falha */}
                  {(imageError || !post.cover_image_url || post.cover_image_url.trim() === '') && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageOff className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}

                  {/* Category overlay */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-4 py-2 bg-catbytes-purple/90 dark:bg-catbytes-pink/90 text-white font-bold rounded-full backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto">

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <time dateTime={post.created_at}>
                        {format(new Date(post.created_at), "dd 'de' MMMM, yyyy", {
                          locale: dateLocale,
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      <span>{post.views} {locale === 'pt-BR' ? 'visualizações' : 'views'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{locale === 'pt-BR' ? 'Por' : 'By'}</span>
                      <strong>{post.author}</strong>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    {post.title}
                  </h1>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-8">
                      <Tag className="w-4 h-4 text-gray-400" />
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Highlight se existir */}
                  {post.highlight && post.highlight.trim() !== '' && (
                    <div className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border-l-4 border-catbytes-purple">
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        💡 {post.highlight}
                      </p>
                    </div>
                  )}

                  {/* Conteúdo com imagens inline */}
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none magazine-text"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
                  />

                  {/* Share buttons */}
                  <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Compartilhar</span>
                    </div>
                    
                    <ShareButtons 
                      url={fullUrl}
                      title={post.title}
                      excerpt={post.excerpt}
                      size="md"
                    />
                  </div>

                  {/* CTA */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border-2 border-catbytes-purple/30">
                    <h3 className="text-center text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Gostou do conteúdo?
                    </h3>
                    <p className="text-center text-gray-700 dark:text-gray-200 mb-4">
                      Transforme sua ideia em realidade com soluções inteligentes
                    </p>
                    <div className="flex justify-center">
                      <a
                        href="#contact"
                        onClick={onClose}
                        className="px-6 py-3 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-bold rounded-lg transition-all transform hover:scale-105"
                      >
                        Entre em Contato
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
