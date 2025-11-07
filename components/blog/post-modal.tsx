'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Calendar, Eye, Tag, Share2, ImageOff, Twitter, Linkedin, Instagram } from 'lucide-react'
import type { BlogPost } from '@/types/blog'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { useBlogPostTracking } from '@/components/analytics/analytics-tracker'
import { PostImageUploader } from '@/components/blog/post-image-uploader'

interface PostModalProps {
  post: BlogPost | null
  isOpen: boolean
  onClose: () => void
  adminMode?: boolean // Show upload controls for admin
}

export function PostModal({ post, isOpen, onClose, adminMode = false }: PostModalProps) {
  const [imageError, setImageError] = useState(false)
  const [viewsIncremented, setViewsIncremented] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '')
  // Use pt-BR as default since this is admin context
  const locale = 'pt-BR'
  const dateLocale = ptBR

  // Update cover URL when post changes
  useEffect(() => {
    if (post?.cover_image_url) {
      setCoverImageUrl(post.cover_image_url)
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

  // Increment views on server when modal opens
  useEffect(() => {
    if (isOpen && post && !viewsIncremented) {
      // Call the API endpoint to increment views
      fetch(`/api/blog/posts/${post.slug}`)
        .then(() => setViewsIncremented(true))
        .catch(console.error)
    }
    
    // Reset when modal closes
    if (!isOpen) {
      setViewsIncremented(false)
    }
  }, [isOpen, post, viewsIncremented])

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

  const handleShare = (platform: string) => {
    const urls = {
      instagram: `https://www.instagram.com/catbytes_izadora_pierette/`, // Instagram não permite compartilhamento direto de links
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    }

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

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
                  {!imageError && (
                    <Image
                      src={coverImageUrl}
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
                  {imageError && (
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
                  {/* Admin Image Uploader */}
                  {adminMode && post && (
                    <div className="mb-8">
                      <PostImageUploader
                        postSlug={post.slug}
                        currentCoverUrl={coverImageUrl}
                        onCoverUpdated={(newUrl) => {
                          setCoverImageUrl(newUrl)
                          setImageError(false)
                        }}
                      />
                    </div>
                  )}

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

                  {/* Content - Markdown rendered as HTML */}
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-headings:font-bold
                    prose-p:text-gray-700 dark:prose-p:text-gray-300
                    prose-p:leading-relaxed
                    prose-a:text-catbytes-purple dark:prose-a:text-catbytes-pink
                    prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-catbytes-purple dark:prose-strong:text-catbytes-pink
                    prose-code:text-catbytes-blue
                    prose-code:bg-gray-100 dark:prose-code:bg-gray-700
                    prose-code:px-2 prose-code:py-1 prose-code:rounded
                    prose-pre:bg-gray-900 prose-pre:text-gray-100
                    prose-blockquote:border-l-catbytes-purple dark:prose-blockquote:border-l-catbytes-pink
                    prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                    prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                    prose-li:my-2"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
                  />

                  {/* Share buttons */}
                  <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Share2 className="w-5 h-5" />
                        <span className="font-medium">Compartilhar</span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleShare('instagram')}
                          className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full transition-colors"
                          aria-label="Compartilhar no Instagram"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-colors"
                          aria-label="Compartilhar no Twitter"
                        >
                          <Twitter className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition-colors"
                          aria-label="Compartilhar no LinkedIn"
                        >
                          <Linkedin className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                          aria-label="Compartilhar no WhatsApp"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </button>
                      </div>
                    </div>
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

// Simple markdown to HTML converter
function formatMarkdown(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>')

  // Wrap lists
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')

  // Wrap in paragraphs
  if (!html.startsWith('<h') && !html.startsWith('<ul')) {
    html = `<p>${html}</p>`
  }

  return html
}
