'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Eye, Tag, ImageOff, Trash2, Globe } from 'lucide-react'
import type { BlogPost } from '@/types/blog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { useAdmin } from '@/hooks/use-admin'
import { useToast } from '@/components/ui/toast'

interface PostCardProps {
  post: BlogPost
  locale?: string
  index?: number
  onDelete?: () => void
  onTranslate?: () => void
  onEdit?: () => void
  showAdminButtons?: boolean
}

export function PostCard({ post, locale = 'pt-BR', index = 0, onDelete, onTranslate, onEdit, showAdminButtons = false }: PostCardProps) {
  const [imageError, setImageError] = useState(false)
  const { isAdmin } = useAdmin()
  const { showToast } = useToast()

  const articleUrl = `/${locale}/blog/${post.slug}`

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Tem certeza que deseja deletar este post?')) return

    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete?.()
        showToast('Post deletado com sucesso!', 'success')
      } else {
        showToast('Erro ao deletar post', 'error')
      }
    } catch (error) {
      showToast('Erro ao deletar post', 'error')
      console.error(error)
    }
  }

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Deseja traduzir este post para inglês?')) return

    try {
      const response = await fetch('/api/blog/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })

      if (response.ok) {
        onTranslate?.()
        showToast('Post traduzido com sucesso!', 'success')
      } else {
        showToast('Erro ao traduzir post', 'error')
      }
    } catch (error) {
      showToast('Erro ao traduzir post', 'error')
      console.error(error)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] // Easing suave personalizado
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="relative group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-catbytes-purple dark:hover:border-catbytes-pink"
    >
      <Link href={articleUrl} target="_blank" rel="noopener noreferrer" className="block">
      {/* Cover Image */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-600">
        {!imageError && (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
            loading={index > 2 ? 'lazy' : 'eager'}
            unoptimized
            onError={() => setImageError(true)}
          />
        )}

        {/* Fallback icon quando imagem falha */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-catbytes-purple/90 dark:bg-catbytes-pink/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
            {post.category}
          </span>
        </div>

        {/* Views badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
          <Eye className="w-3.5 h-3.5 text-catbytes-purple dark:text-catbytes-pink" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
            {post.views || 0}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta info */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), "dd 'de' MMMM, yyyy", {
                locale: ptBR,
              })}
            </time>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-catbytes-purple dark:group-hover:text-catbytes-pink transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Tag className="w-4 h-4 text-gray-400" />
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Read more button */}
                  {/* Read more button */}
          <div className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-medium rounded-lg transition-all duration-300 transform group-hover:scale-105 text-center">
            Ler artigo completo
          </div>
        </div>
      </Link>

      {/* Admin buttons - outside the Link */}
      {(isAdmin && showAdminButtons) && (
        <div className="flex gap-2 px-6 pb-6">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Editar post"
            >
              <Eye className="w-4 h-4" />
              Editar
            </button>
          )}
          {post.locale === 'pt-BR' && onTranslate && (
            <button
              onClick={handleTranslate}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Traduzir para inglês"
            >
              <Globe className="w-4 h-4" />
              Traduzir
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Deletar post"
            >
              <Trash2 className="w-4 h-4" />
              Deletar
            </button>
          )}
        </div>
      )}

      {/* Decorative cat paw print */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
        <span className="text-6xl">🐾</span>
      </div>
    </motion.article>
  )
}
