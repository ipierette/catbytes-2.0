'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Eye, Tag, ArrowLeft, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import type { BlogPost } from '@/types/blog'
import { formatMarkdown as formatMarkdownContent } from '@/lib/markdown-formatter'

export default function AdminBlogPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/admin/blog/preview/${slug}`, {
          credentials: 'include', // Include cookies for admin auth
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Você precisa estar logado como admin para visualizar este preview')
            return
          }
          if (response.status === 404) {
            setError('Post não encontrado')
            return
          }
          throw new Error('Erro ao carregar preview')
        }

        const data = await response.json()
        setPost(data)
      } catch (err) {
        console.error('Error fetching preview:', err)
        setError('Erro ao carregar preview do post')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-100 mb-2">Erro</h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/blog')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Admin
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  const locale = post.locale === 'en-US' ? enUS : ptBR
  const formattedDate = format(new Date(post.created_at), 'dd MMMM yyyy', { locale })
  const formattedContent = formatMarkdownContent(post.content)

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Admin Preview Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">
              Modo Preview - 
              {post.status === 'draft' && ' Rascunho'}
              {post.status === 'scheduled' && ` Agendado para ${post.scheduled_at ? format(new Date(post.scheduled_at), 'dd/MM/yyyy HH:mm') : 'data indefinida'}`}
            </span>
          </div>
          <button
            onClick={() => router.push('/admin/blog')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Admin
          </button>
        </div>
      </div>

      {/* Blog Post Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Admin
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-slate-400 mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.created_at}>{formattedDate}</time>
            </div>
            {post.views > 0 && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.views} visualizações</span>
              </div>
            )}
            {post.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{post.category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Highlight */}
        {post.highlight && (
          <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
            <p className="text-slate-200 font-medium">{post.highlight}</p>
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-invert prose-slate max-w-none
            prose-headings:text-slate-100 prose-headings:font-bold
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
            prose-strong:text-slate-200
            prose-code:text-blue-400 prose-code:bg-slate-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
            prose-img:rounded-lg prose-img:shadow-lg
            prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-400
            prose-ul:text-slate-300 prose-ol:text-slate-300
            prose-li:text-slate-300"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
