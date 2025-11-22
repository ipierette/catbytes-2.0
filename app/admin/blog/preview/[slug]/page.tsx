'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Eye, Tag, ArrowLeft, AlertCircle, Edit, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import type { BlogPost } from '@/types/blog'
import { formatMarkdown as formatMarkdownContent } from '@/lib/markdown-formatter'
import { toast } from 'sonner'

export default function AdminBlogPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedExcerpt, setEditedExcerpt] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedHighlight, setEditedHighlight] = useState('')
  const [saving, setSaving] = useState(false)

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
        // Initialize edit fields
        setEditedTitle(data.title || '')
        setEditedExcerpt(data.excerpt || '')
        setEditedContent(data.content || '')
        setEditedHighlight(data.highlight || '')
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

  const handleSave = async () => {
    if (!post) return
    
    setSaving(true)
    toast.loading('Salvando alterações...', { id: 'save-preview' })
    
    try {
      const response = await fetch(`/api/admin/blog/posts?id=${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editedTitle,
          excerpt: editedExcerpt,
          content: editedContent,
          highlight: editedHighlight,
          coverImageUrl: post.cover_image_url,
          tags: post.tags,
          category: post.category,
          saveAsDraft: post.status === 'draft',
          scheduleForLater: post.status === 'scheduled',
          scheduledDate: post.scheduled_at ? new Date(post.scheduled_at).toISOString().split('T')[0] : null,
          scheduledTime: post.scheduled_at ? new Date(post.scheduled_at).toTimeString().slice(0, 5) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar')
      }

      const data = await response.json()
      setPost(data.post)
      setIsEditing(false)
      toast.success('✅ Alterações salvas com sucesso!', { id: 'save-preview' })
    } catch (err) {
      console.error('Error saving:', err)
      toast.error('❌ Erro ao salvar alterações', { id: 'save-preview' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!post) return
    setEditedTitle(post.title)
    setEditedExcerpt(post.excerpt || '')
    setEditedContent(post.content)
    setEditedHighlight(post.highlight || '')
    setIsEditing(false)
  }

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
  const formattedContent = formatMarkdownContent(isEditing ? editedContent : post.content)

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
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white border border-slate-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => router.push('/admin/blog')}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Admin
                </button>
              </>
            )}
          </div>
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

          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full text-4xl md:text-5xl font-bold bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
              placeholder="Título do artigo"
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              {post.title}
            </h1>
          )}

          {isEditing ? (
            <textarea
              value={editedExcerpt}
              onChange={(e) => setEditedExcerpt(e.target.value)}
              rows={2}
              className="w-full text-xl bg-slate-900 text-slate-400 border border-slate-700 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Resumo do artigo"
            />
          ) : (
            post.excerpt && (
              <p className="text-xl text-slate-400 mb-6">
                {post.excerpt}
              </p>
            )
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
        {(isEditing || post.highlight) && (
          <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
            {isEditing ? (
              <textarea
                value={editedHighlight}
                onChange={(e) => setEditedHighlight(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 text-slate-200 font-medium border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Texto em destaque (opcional)"
              />
            ) : (
              <p className="text-slate-200 font-medium">{post.highlight}</p>
            )}
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <div className="mb-8">
            <div className="text-sm font-medium text-slate-300 mb-2">
              Conteúdo (Markdown)
            </div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={20}
              className="w-full bg-slate-900 text-slate-300 border border-slate-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-blue-500 resize-y"
              placeholder="Escreva o conteúdo em Markdown..."
            />
            <p className="text-xs text-slate-500 mt-2">
              Preview do conteúdo formatado abaixo ↓
            </p>
          </div>
        ) : null}
        
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
