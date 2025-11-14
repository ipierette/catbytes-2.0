import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Eye, Tag, Share2, ImageOff, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import type { BlogPost } from '@/types/blog'
import { ViewCounter } from '@/components/blog/view-counter'
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker'
import { RelatedPosts } from '@/components/blog/related-posts'
import { ShareButtons } from '@/components/blog/share-buttons'
import { ManifestoButton } from '@/components/blog/manifesto-modal'
import { formatMarkdown as formatMarkdownContent, extractFaqItems } from '@/lib/markdown-formatter'

export const dynamicParams = true
export const revalidate = 3600

async function getPost(slug: string, locale: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/blog/posts/${slug}`, {
      next: { revalidate: 3600 },
      headers: {
        'x-increment-views': 'false',
      },
      signal: AbortSignal.timeout(10000),
    })
    
    if (!response.ok) {
      console.error(`[getPost] Failed to fetch post ${slug}:`, response.status)
      return null
    }
    
    const post = await response.json()
    return post
  } catch (error) {
    console.error('[BlogPostPage] Error fetching post:', error)
    return null
  }
}

async function getRelatedPosts(theme: string, locale: string, limit = 3): Promise<BlogPost[]> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const response = await fetch(
      `${baseUrl}/api/blog/posts?theme=${encodeURIComponent(theme)}&locale=${locale}&limit=${limit + 1}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10000),
      }
    )
    
    if (!response.ok) {
      console.error(`[getRelatedPosts] Failed to fetch related posts:`, response.status)
      return []
    }
    
    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('[getRelatedPosts] Error fetching related posts:', error)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getPost(slug, locale)

  if (!post) {
    return {
      title: 'Artigo não encontrado',
      description: 'O artigo que você procura não foi encontrado.',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  const canonicalUrl = `${siteUrl}/${locale}/blog/${post.slug}`
  
  // Enhanced keywords: combine post keywords with category and tags
  const enhancedKeywords = [
    ...(post.keywords || []),
    ...(post.tags || []),
    post.category,
    'CatBytes',
    'Izadora Pierette',
    locale === 'pt-BR' ? 'blog tecnologia' : 'tech blog'
  ].filter(Boolean)

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    keywords: enhancedKeywords,
    authors: [{ name: post.author || 'Izadora Cury Pierette', url: siteUrl }],
    creator: 'Izadora Cury Pierette',
    publisher: 'CatBytes',
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
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
          type: 'image/webp'
        }
      ],
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author || 'Izadora Cury Pierette'],
      tags: post.tags || [],
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: [post.cover_image_url],
      creator: '@catbytes',
      site: '@catbytes',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'pt-BR': `${siteUrl}/pt-BR/blog/${post.slug}`,
        'en-US': `${siteUrl}/en-US/blog/${post.slug}`,
        'x-default': `${siteUrl}/pt-BR/blog/${post.slug}`,
      },
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const post = await getPost(slug, locale)

  if (!post) {
    notFound()
  }

  const dateLocale = locale === 'pt-BR' ? ptBR : enUS
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  const canonicalUrl = `${siteUrl}/${locale}/blog/${post.slug}`
  const shareUrl = canonicalUrl
  
  // Extract FAQ items from content for FAQ Schema
  const faqItems = extractFaqItems(post.content)
  
  // JSON-LD Structured Data for Article
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.seo_description,
    image: post.cover_image_url,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author || 'Izadora Cury Pierette',
      url: siteUrl,
      jobTitle: 'Full Stack Developer & AI Specialist',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CatBytes',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/og-1200x630-safe.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': shareUrl,
    },
    keywords: (post.keywords || []).join(', '),
    articleSection: post.category,
    inLanguage: locale,
    wordCount: post.content ? post.content.split(/\s+/).length : 0,
  }
  
  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'pt-BR' ? 'Blog' : 'Blog',
        item: `${siteUrl}/${locale}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: shareUrl,
      },
    ],
  }
  
  // FAQ JSON-LD (if FAQs exist in content)
  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq: { question: string; answer: string }) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null

  // Inicia a busca por posts relacionados assim que o post existir
  const relatedPostsPromise: Promise<BlogPost[]> = post.category
    ? getRelatedPosts(post.category, locale, 3)
    : Promise.resolve([])

  // Extrair imagens do conteúdo
  const extractImagesFromContent = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g
    const matches = content.matchAll(imageRegex)
    return Array.from(matches, m => m[1])
  }

  const contentImages = extractImagesFromContent(post.content)

  // Aguarda os relacionados após processar o restante
  const relatedPosts = await relatedPostsPromise
  
  const formattedDate = format(new Date(post.created_at), 'dd MMMM yyyy', { locale: dateLocale })

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* FAQ JSON-LD (if exists) */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      
      <ViewCounter slug={slug} locale={locale} />
      <AnalyticsTracker 
        postId={post.id}
        postSlug={slug}
        title={post.title}
      />
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link 
                href={`/${locale}`}
                className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                {locale === 'pt-BR' ? 'Início' : 'Home'}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link 
                href={`/${locale}/blog`}
                className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                Blog
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 dark:text-white font-medium truncate max-w-md">
              {post.title}
            </li>
          </ol>
        </div>
      </nav>
      
      {/* Cover Image Hero */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-600">
        {post.cover_image_url && post.cover_image_url.trim() !== '' ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="w-32 h-32 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Article Content */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Navigation and Category Buttons - Positioned before title */}
          <div className="flex items-center justify-between p-6 pb-0">
            <Link 
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all transform hover:scale-105 shadow-md border border-gray-200 dark:border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{locale === 'pt-BR' ? 'Voltar' : 'Back'}</span>
            </Link>
            
            <span className="px-4 py-2 bg-catbytes-purple dark:bg-catbytes-pink text-white font-bold text-sm rounded-full shadow-lg">
              {post.category}
            </span>
          </div>

          {/* Header */}
          <header className="p-8 md:p-12 pt-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

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

          {/* LAYOUT SIMPLIFICADO PARA ARTIGOS DE IA (TEXTO) */}
          <div className="p-8 md:p-12">
            {/* Se tiver highlight, mostrar no topo */}
            {post.highlight && post.highlight.trim() !== '' && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border-l-4 border-catbytes-purple">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    💡 {post.highlight}
                  </p>
                </div>
              </div>
            )}

            {/* Conteúdo completo em uma única coluna centralizada */}
            <div className="max-w-4xl mx-auto">
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: formatMarkdownContent(post.content) }}
              />
            </div>
          </div>

          {/* Share Section */}
          <div className="p-8 md:p-12 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                {/* Left: Share */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <Share2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                      {locale === 'pt-BR' ? 'Compartilhar este artigo' : 'Share this article'}
                    </h3>
                  </div>
                  
                  <ShareButtons 
                    url={shareUrl}
                    title={post.title}
                    excerpt={post.excerpt}
                    size="lg"
                  />
                </div>

                {/* Right: Manifesto */}
                <div className="flex-shrink-0 lg:w-auto">
                  <div className="flex flex-col items-center lg:items-end gap-4 pt-0 lg:pt-2">
                    <ManifestoButton />
                  </div>
                </div>
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

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="p-8 md:p-12">
              <RelatedPosts 
                posts={relatedPosts} 
                locale={locale} 
                currentPostSlug={post.slug} 
              />
            </div>
          )}
        </div>
      </article>

      <div className="h-20" />
    </main>
  )
}
