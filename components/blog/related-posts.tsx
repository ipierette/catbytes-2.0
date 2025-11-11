'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, ImageOff } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import type { BlogPost } from '@/types/blog'

interface RelatedPostsProps {
  posts: BlogPost[]
  locale: string
  currentPostSlug: string
}

export function RelatedPosts({ posts, locale, currentPostSlug }: RelatedPostsProps) {
  const dateLocale = locale === 'pt-BR' ? ptBR : enUS
  const title = locale === 'pt-BR' ? 'Você também pode gostar de:' : 'You may also like:'
  
  // Filter out current post and limit to 3
  const relatedPosts = posts
    .filter(post => post.slug !== currentPostSlug)
    .slice(0, 3)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/${locale}/blog/${post.slug}`}
            className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-800"
          >
            {/* Image */}
            <div className="relative h-48 w-full bg-gradient-to-br from-catbytes-purple/20 to-catbytes-pink/20 overflow-hidden">
              {post.cover_image_url ? (
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageOff className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                </div>
              )}
              
              {/* Category badge */}
              {post.category && (
                <div className="absolute top-3 left-3">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-catbytes-purple dark:bg-catbytes-pink rounded-full">
                    {post.category}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-catbytes-purple dark:group-hover:text-catbytes-pink transition-colors">
                {post.title}
              </h3>
              
              {post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <time dateTime={post.created_at}>
                    {format(new Date(post.created_at), 'dd MMM yyyy', { locale: dateLocale })}
                  </time>
                </div>
                
                {post.views !== undefined && post.views > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.views.toLocaleString(locale)}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
