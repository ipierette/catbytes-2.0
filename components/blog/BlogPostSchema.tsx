'use client'

interface BlogPostSchemaProps {
  title: string
  description: string
  slug: string
  publishedAt: string
  updatedAt?: string
  authorName?: string
  imageUrl?: string
  locale: string
}

export function BlogPostSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  authorName = 'Izadora Cury Pierette',
  imageUrl,
  locale,
}: BlogPostSchemaProps) {
  const baseUrl = 'https://catbytes.site'
  const url = `${baseUrl}/${locale}/blog/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    url: url,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CatBytes',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/og-1200x630-safe.webp`,
      },
    },
    ...(imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
      },
    }),
    inLanguage: locale === 'pt-BR' ? 'pt-BR' : 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
