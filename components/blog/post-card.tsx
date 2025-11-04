'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, Eye, Tag } from 'lucide-react'
import type { BlogPost } from '@/types/blog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PostCardProps {
  post: BlogPost
  onClick: () => void
  index?: number
}

export function PostCard({ post, onClick, index = 0 }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-catbytes-purple dark:hover:border-catbytes-pink"
    >
      {/* Cover Image */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-600">
        <Image
          src={post.cover_image_url}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
          loading={index > 2 ? 'lazy' : 'eager'}
          quality={85}
        />

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-catbytes-purple/90 dark:bg-catbytes-pink/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
            {post.category}
          </span>
        </div>

        {/* Views badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
          <Eye className="w-3 h-3" />
          <span>{post.views}</span>
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
        <button className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-medium rounded-lg transition-all duration-300 transform group-hover:scale-105">
          Ler artigo completo
        </button>
      </div>

      {/* Decorative cat paw print */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
        <span className="text-6xl">🐾</span>
      </div>
    </motion.article>
  )
}
