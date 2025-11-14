/**
 * Breadcrumb Structured Data Component
 * Adds BreadcrumbList JSON-LD to pages for better SEO
 */

import { generateBreadcrumbSchema } from '@/lib/seo-helpers'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const schema = generateBreadcrumbSchema(items)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
