'use client'

import { BlogPost } from '@/types/blog'
import { TemplateType } from './blog-template-selector'
import { Calendar, User, Tag, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface BlogTemplatePreviewProps {
  post: Partial<BlogPost>
  template: TemplateType
  images: {
    coverImage?: string
    bodyImage1?: string
    bodyImage2?: string
  }
}

export function BlogTemplatePreview({ post, template, images }: BlogTemplatePreviewProps) {
  const formattedDate = post.created_at 
    ? new Date(post.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : 'Data não definida'

  const renderTemplate = () => {
    switch (template) {
      case 'traditional':
        return <TraditionalTemplate post={post} images={images} formattedDate={formattedDate} />
      
      case 'visual-duo':
        return <VisualDuoTemplate post={post} images={images} formattedDate={formattedDate} />
      
      case 'editorial':
        return <EditorialTemplate post={post} images={images} formattedDate={formattedDate} />
      
      case 'final-emphasis':
        return <FinalEmphasisTemplate post={post} images={images} formattedDate={formattedDate} />
      
      default:
        return <TraditionalTemplate post={post} images={images} formattedDate={formattedDate} />
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {renderTemplate()}
    </div>
  )
}

// Template 1: Tradicional Vertical
function TraditionalTemplate({ 
  post, 
  images, 
  formattedDate 
}: { 
  post: Partial<BlogPost>
  images: { coverImage?: string; bodyImage1?: string; bodyImage2?: string }
  formattedDate: string 
}) {
  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
      {/* Imagem de Capa - SEMPRE NO TOPO */}
      {images.coverImage && (
        <div className="relative w-full h-80 bg-slate-200 dark:bg-slate-800">
          <Image
            src={images.coverImage}
            alt={post.title || 'Imagem de capa'}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-8 md:p-12">
        {/* Header com Tags */}
        <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
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
            {post.title || 'Título do Artigo'}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time>{formattedDate}</time>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>CatBytes</span>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {post.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="leading-relaxed text-slate-700 dark:text-slate-300"
            />
          ) : (
            <p className="text-slate-500 dark:text-slate-500">Conteúdo do artigo será exibido aqui...</p>
          )}
        </div>

        {/* Imagem centralizada no corpo */}
        {images.bodyImage1 && (
          <div className="my-12">
            <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={images.bodyImage1}
                alt="Imagem do conteúdo"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-3 italic">
              Imagem ilustrativa do conteúdo
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

// Template 2: Visual Duplo (2 imagens lado a lado)
function VisualDuoTemplate({ 
  post, 
  images, 
  formattedDate 
}: { 
  post: Partial<BlogPost>
  images: { coverImage?: string; bodyImage1?: string; bodyImage2?: string }
  formattedDate: string 
}) {
  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
      {/* Imagem de Capa - SEMPRE NO TOPO */}
      {images.coverImage && (
        <div className="relative w-full h-96 bg-slate-200 dark:bg-slate-800">
          <Image
            src={images.coverImage}
            alt={post.title || 'Imagem de capa'}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-8 md:p-12">
        {/* Header */}
        <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
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

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {post.title || 'Título do Artigo'}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time>{formattedDate}</time>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>CatBytes</span>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {post.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="leading-relaxed text-slate-700 dark:text-slate-300"
            />
          ) : (
            <p className="text-slate-500 dark:text-slate-500">Conteúdo do artigo será exibido aqui...</p>
          )}
        </div>

        {/* 2 imagens lado a lado */}
        {(images.bodyImage1 || images.bodyImage2) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
            {images.bodyImage1 && (
              <div className="space-y-2">
                <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg bg-slate-200 dark:bg-slate-800">
                  <Image
                    src={images.bodyImage1}
                    alt="Comparação 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-500 text-center italic">
                  Perspectiva A
                </p>
              </div>
            )}

            {images.bodyImage2 && (
              <div className="space-y-2">
                <div className="relative w-full h-72 rounded-xl overflow-hidden shadow-lg bg-slate-200 dark:bg-slate-800">
                  <Image
                    src={images.bodyImage2}
                    alt="Comparação 2"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-500 text-center italic">
                  Perspectiva B
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

// Template 3: Narrativo Editorial (imagem lateral com float)
function EditorialTemplate({ 
  post, 
  images, 
  formattedDate 
}: { 
  post: Partial<BlogPost>
  images: { coverImage?: string; bodyImage1?: string; bodyImage2?: string }
  formattedDate: string 
}) {
  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
      {/* Imagem de Capa com Overlay - SEMPRE NO TOPO */}
      {images.coverImage && (
        <div className="relative w-full h-96 bg-slate-900">
          <Image
            src={images.coverImage}
            alt={post.title || 'Imagem de capa'}
            fill
            className="object-cover opacity-60"
          />
          
          {/* Texto sobreposto */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags?.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title || 'Título do Artigo'}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-slate-200 mb-6 max-w-3xl">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time>{formattedDate}</time>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>CatBytes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 md:p-12">
        {/* Conteúdo com imagem lateral (float right) */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {images.bodyImage1 && (
            <div className="float-right ml-6 mb-6 w-full md:w-80 lg:w-96">
              <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg sticky top-6">
                <Image
                  src={images.bodyImage1}
                  alt="Imagem lateral"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 italic text-center">
                Detalhe visual do conteúdo
              </p>
            </div>
          )}

          {post.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="leading-relaxed text-slate-700 dark:text-slate-300"
            />
          ) : (
            <p className="text-slate-500 dark:text-slate-500">
              Conteúdo do artigo será exibido aqui com a imagem posicionada à direita, 
              criando um layout sofisticado de revista editorial...
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

// Template 4: Imagem Final com Ênfase
function FinalEmphasisTemplate({ 
  post, 
  images, 
  formattedDate 
}: { 
  post: Partial<BlogPost>
  images: { coverImage?: string; bodyImage1?: string; bodyImage2?: string }
  formattedDate: string 
}) {
  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
      {/* Imagem de Capa - SEMPRE NO TOPO */}
      {images.coverImage && (
        <div className="relative w-full h-80 bg-slate-200 dark:bg-slate-800">
          <Image
            src={images.coverImage}
            alt={post.title || 'Imagem de capa'}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-8 md:p-12">
        {/* Header */}
        <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
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

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {post.title || 'Título do Artigo'}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time>{formattedDate}</time>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>CatBytes</span>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          {post.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="leading-relaxed text-slate-700 dark:text-slate-300"
            />
          ) : (
            <p className="text-slate-500 dark:text-slate-500">Conteúdo do artigo será exibido aqui...</p>
          )}
        </div>

        {/* Imagem final destacada com bordas e sombra */}
        {images.bodyImage1 && (
          <div className="my-12 p-6 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50">
            <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={images.bodyImage1}
                alt="Conclusão visual"
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                💡 Ponto Principal
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic max-w-2xl mx-auto">
                Esta imagem resume visualmente a mensagem central do artigo, 
                deixando uma impressão duradoura no leitor.
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
