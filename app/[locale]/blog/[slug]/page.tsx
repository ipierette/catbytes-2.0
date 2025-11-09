import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Eye, Tag, Share2, ImageOff, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import type { BlogPost } from '@/types/blog'

// Simular fetch do post - você vai integrar com sua API real
async function getPost(slug: string, locale: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/blog/posts/${slug}`, {
      next: { revalidate: 60 } // Cache por 60 segundos
    })
    
    if (!response.ok) return null
    
    const post = await response.json()
    return post
  } catch (error) {
    console.error('[BlogPostPage] Error fetching post:', error)
    return null
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getPost(slug, locale)

  if (!post) {
    return {
      title: 'Artigo não encontrado',
      description: 'O artigo que você procura não foi encontrado.',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const canonicalUrl = `${siteUrl}/${locale}/blog/${post.slug}`

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      url: canonicalUrl,
      siteName: 'CatBytes',
      images: [
        {
          url: post.cover_image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: [post.cover_image_url],
      creator: '@catbytes_izadora_pierette',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const { slug, locale } = await params
  const post = await getPost(slug, locale)

  if (!post) {
    notFound()
  }

  const dateLocale = locale === 'pt-BR' ? ptBR : enUS
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${locale}/blog/${post.slug}`
  const shareText = locale === 'pt-BR' ? `Confira: ${post.title}` : `Check this out: ${post.title}`

  // Extrair imagens do conteúdo Markdown
  const extractImagesFromContent = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g
    const matches = content.matchAll(imageRegex)
    return Array.from(matches, m => m[1])
  }

  const contentImages = extractImagesFromContent(post.content)

  // Dividir o conteúdo em seções para layout de revista
  const splitContentForMagazineLayout = (content: string) => {
    const textContent = content.replace(/!\[.*?\]\(.*?\)/g, '')
    const paragraphs = textContent.split('\n\n').filter(p => p.trim())
    
    if (contentImages.length >= 2) {
      return {
        intro: paragraphs.slice(0, 2).join('\n\n') || '',
        middle: paragraphs.slice(2, 4).join('\n\n') || '',
        end: paragraphs.slice(4).join('\n\n') || '',
      }
    }
    
    if (contentImages.length === 1) {
      return {
        intro: paragraphs.slice(0, 3).join('\n\n') || '',
        middle: '',
        end: paragraphs.slice(3).join('\n\n') || '',
      }
    }
    
    return {
      intro: content,
      middle: '',
      end: '',
    }
  }

  const sections = splitContentForMagazineLayout(post.content)

  const handleShare = (platform: string) => {
    const urls = {
      instagram: `https://www.instagram.com/catbytes_izadora_pierette/`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    }

    return urls[platform as keyof typeof urls]
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-catbytes-purple dark:hover:text-catbytes-pink transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{locale === 'pt-BR' ? 'Voltar' : 'Back'}</span>
          </Link>
        </div>
      </div>

      {/* Cover Image Hero */}
      <div className="relative w-full h-[40vh] md:h-[60vh] bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-600">
        {post.cover_image_url && post.cover_image_url.trim() !== '' ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="w-32 h-32 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute bottom-8 left-8">
          <span className="px-6 py-3 bg-catbytes-purple/90 dark:bg-catbytes-pink/90 text-white font-bold text-lg rounded-full backdrop-blur-sm shadow-lg">
            {post.category}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <header className="p-8 md:p-12 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <time dateTime={post.created_at}>
                  {format(new Date(post.created_at), "dd 'de' MMMM, yyyy", { locale: dateLocale })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{post.views} {locale === 'pt-BR' ? 'visualizações' : 'views'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{locale === 'pt-BR' ? 'Por' : 'By'}</span>
                <strong className="text-gray-900 dark:text-white">{post.author}</strong>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-catbytes-purple dark:text-catbytes-pink text-sm font-medium rounded-full border border-catbytes-purple/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* Layout adaptável baseado no número de imagens */}
            {contentImages.length >= 2 ? (
              // Layout REVISTA COMPLETA (2+ imagens)
              <div className="space-y-12">
                {/* Introdução com caixa colorida */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div
                      className="prose prose-xl dark:prose-invert max-w-none magazine-text"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(sections.intro) }}
                    />
                  </div>
                  <div className="bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 p-8 rounded-2xl border-l-4 border-catbytes-pink shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">💡 Destaque</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Primeira imagem com texto ao lado */}
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={contentImages[0]}
                      alt="Imagem do artigo 1"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div
                    className="prose prose-xl dark:prose-invert max-w-none magazine-text"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(sections.middle) }}
                  />
                </div>

                {/* Segunda imagem com caixa informativa */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 order-2 md:order-1">
                    <div className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src={contentImages[1]}
                        alt="Imagem do artigo 2"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 66vw"
                      />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-8 rounded-2xl border-l-4 border-catbytes-purple shadow-lg order-1 md:order-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📌 Saiba Mais</h3>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none magazine-text"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(sections.end.substring(0, 300) + '...') }}
                    />
                  </div>
                </div>

                {/* Restante do conteúdo */}
                <div
                  className="prose prose-xl dark:prose-invert max-w-none magazine-text"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(sections.end) }}
                />
              </div>
            ) : contentImages.length === 1 ? (
              // Layout REVISTA SIMPLES (1 imagem)
              <div className="space-y-12">
                {/* Introdução */}
                <div
                  className="prose prose-xl dark:prose-invert max-w-none magazine-text text-justify"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(sections.intro) }}
                />

                {/* Imagem destacada com moldura */}
                <div className="relative my-12">
                  <div className="absolute -inset-6 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-3xl transform rotate-1"></div>
                  <div className="relative h-80 md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={contentImages[0]}
                      alt="Imagem do artigo"
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                </div>

                {/* Continuação com caixa call-to-action */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div
                      className="prose prose-xl dark:prose-invert max-w-none magazine-text text-justify"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(sections.end) }}
                    />
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-8 rounded-2xl h-fit sticky top-24 shadow-lg">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b-4 border-catbytes-pink pb-3">
                      Leia & Inspire-se
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 italic text-lg">
                      "{post.excerpt}"
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                      <p className="flex items-center gap-2">
                        📅 {format(new Date(post.created_at), "dd/MM/yyyy")}
                      </p>
                      <p className="flex items-center gap-2">
                        👁️ {post.views} leitores
                      </p>
                      <p className="flex items-center gap-2">
                        ✍️ {post.author}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Layout JORNAL CLÁSSICO (sem imagens)
              <div
                className="prose prose-xl dark:prose-invert max-w-none magazine-text
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-headings:font-bold
                prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-p:leading-relaxed prose-p:text-justify
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
                prose-li:my-2
                prose-img:rounded-xl prose-img:shadow-lg
                columns-1 lg:columns-2 gap-12"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
              />
            )}
          </div>

          {/* Share Section */}
          <div className="p-8 md:p-12 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Share2 className="w-6 h-6" />
                <span className="font-bold text-lg">
                  {locale === 'pt-BR' ? 'Compartilhar' : 'Share'}
                </span>
              </div>

              <div className="flex gap-4">
                <a
                  href={handleShare('instagram')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full transition-all transform hover:scale-110"
                  aria-label="Compartilhar no Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href={handleShare('twitter')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full transition-all transform hover:scale-110"
                  aria-label="Compartilhar no Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href={handleShare('linkedin')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition-all transform hover:scale-110"
                  aria-label="Compartilhar no LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href={handleShare('whatsapp')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-all transform hover:scale-110"
                  aria-label="Compartilhar no WhatsApp"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-8 md:p-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'pt-BR' ? 'Gostou do conteúdo?' : 'Enjoyed the content?'}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-8">
                {locale === 'pt-BR' 
                  ? 'Transforme sua ideia em realidade com soluções inteligentes' 
                  : 'Transform your idea into reality with intelligent solutions'}
              </p>
              <Link
                href={`/${locale}#contact`}
                className="inline-block px-8 py-4 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                {locale === 'pt-BR' ? 'Entre em Contato' : 'Get in Touch'}
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Bottom Spacing */}
      <div className="h-20" />
    </main>
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
