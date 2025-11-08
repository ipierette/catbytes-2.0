'use client'

import { BlogPost } from '@/types/blog'
import { TemplateType } from './blog-template-selector'
import { Calendar, User, Tag } from 'lucide-react'

interface BlogTemplatePreviewProps {
  post: BlogPost
  template: TemplateType
  images: {
    image1?: string
    image2?: string
  }
}

export function BlogTemplatePreview({ post, template, images }: BlogTemplatePreviewProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  // Template: Texto Puro
  if (template === 'text-only') {
    return (
      <article className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Header */}
          <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags?.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            </div>
          </header>

          {/* Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    )
  }

  // Template: Imagem Centralizada
  if (template === 'centered-image') {
    return (
      <article className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Featured Image */}
        {images.image1 && (
          <div className="relative h-96 overflow-hidden">
            <img 
              src={images.image1} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Title overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags?.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        )}

        <div className="p-8 md:p-12">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
          </div>

          {post.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 italic">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    )
  }

  // Template: Duas Colunas
  if (template === 'two-columns') {
    return (
      <article className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Header */}
          <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags?.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            </div>
          </header>

          {/* Two Images Side by Side */}
          {(images.image1 || images.image2) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {images.image1 && (
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                  <img 
                    src={images.image1} 
                    alt="Imagem 1"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {images.image2 && (
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                  <img 
                    src={images.image2} 
                    alt="Imagem 2"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    )
  }

  // Template: Imagem à Esquerda + Texto
  if (template === 'image-left') {
    return (
      <article className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Header */}
          <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags?.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            </div>
          </header>

          {/* Magazine Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Image Column */}
            {images.image1 && (
              <div className="md:col-span-1">
                <div className="sticky top-8">
                  <div className="relative h-96 rounded-xl overflow-hidden mb-4">
                    <img 
                      src={images.image1} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Content Column */}
            <div className={images.image1 ? 'md:col-span-2' : 'md:col-span-3'}>
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </div>
      </article>
    )
  }

  return null
}
