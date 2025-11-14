/**
 * SEO Optimization Helpers
 * Advanced SEO utilities for CatBytes website
 */

import type { Metadata } from 'next'

/**
 * Generate comprehensive keywords from blog post data
 */
export function generateBlogKeywords(params: {
  title: string
  category?: string
  tags?: string[]
  existingKeywords?: string[]
  locale: string
}): string[] {
  const { title, category, tags, existingKeywords, locale } = params
  
  const baseKeywords = [
    'CatBytes',
    'Izadora Pierette',
    'Izadora Cury Pierette',
  ]
  
  const localeKeywords = locale === 'pt-BR' 
    ? ['blog tecnologia', 'desenvolvimento web', 'programação', 'tutoriais']
    : ['tech blog', 'web development', 'programming', 'tutorials']
  
  // Extract potential keywords from title
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4)
    .slice(0, 5)
  
  return [
    ...baseKeywords,
    ...localeKeywords,
    ...(existingKeywords || []),
    ...(tags || []),
    category,
    ...titleWords,
  ].filter(Boolean) as string[]
}

/**
 * Generate optimized Open Graph metadata
 */
export function generateOGMetadata(params: {
  title: string
  description: string
  url: string
  imageUrl: string
  locale: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
  section?: string
}): Metadata['openGraph'] {
  const {
    title,
    description,
    url,
    imageUrl,
    locale,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    tags,
    section,
  } = params
  
  const ogLocale = locale === 'pt-BR' ? 'pt_BR' : 'en_US'
  
  const baseOG: Metadata['openGraph'] = {
    title,
    description,
    url,
    siteName: 'CatBytes',
    locale: ogLocale,
    type,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
        type: 'image/webp',
      },
    ],
  }
  
  if (type === 'article' && publishedTime) {
    return {
      ...baseOG,
      type: 'article',
      publishedTime,
      modifiedTime: modifiedTime || publishedTime,
      authors: author ? [author] : ['Izadora Cury Pierette'],
      tags: tags || [],
      section,
    }
  }
  
  return baseOG
}

/**
 * Generate Article JSON-LD Schema
 */
export function generateArticleSchema(params: {
  title: string
  description: string
  imageUrl: string
  url: string
  datePublished: string
  dateModified?: string
  author?: string
  keywords?: string[]
  category?: string
  locale: string
  wordCount?: number
}) {
  const {
    title,
    description,
    imageUrl,
    url,
    datePublished,
    dateModified,
    author = 'Izadora Cury Pierette',
    keywords = [],
    category,
    locale,
    wordCount,
  } = params
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: imageUrl,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
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
      '@id': url,
    },
    keywords: keywords.join(', '),
    articleSection: category,
    inLanguage: locale,
    ...(wordCount && { wordCount }),
  }
}

/**
 * Generate Breadcrumb JSON-LD Schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate FAQ JSON-LD Schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate Blog Listing Page JSON-LD Schema
 */
export function generateBlogListingSchema(params: {
  url: string
  locale: string
  posts?: Array<{
    title: string
    url: string
    description: string
    imageUrl: string
    datePublished: string
    author?: string
  }>
}) {
  const { url, locale, posts = [] } = params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': url,
    url,
    name: locale === 'pt-BR' ? 'Blog CatBytes - Tecnologia e Desenvolvimento' : 'CatBytes Blog - Technology & Development',
    description: locale === 'pt-BR' 
      ? 'Artigos sobre desenvolvimento web, inteligência artificial, automação e tecnologia.'
      : 'Articles about web development, artificial intelligence, automation and technology.',
    publisher: {
      '@type': 'Organization',
      name: 'CatBytes',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/og-1200x630-safe.webp`,
      },
    },
    inLanguage: locale,
    ...(posts.length > 0 && {
      blogPost: posts.slice(0, 10).map(post => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: post.url,
        description: post.description,
        image: post.imageUrl,
        datePublished: post.datePublished,
        author: {
          '@type': 'Person',
          name: post.author || 'Izadora Cury Pierette',
        },
      })),
    }),
  }
}

/**
 * Validate and clean keywords
 */
export function cleanKeywords(keywords: string[]): string[] {
  return Array.from(new Set(
    keywords
      .filter(Boolean)
      .filter(k => k.length >= 3)
      .map(k => k.trim().toLowerCase())
  ))
}
