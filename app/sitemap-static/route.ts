import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://catbytes.site'
  const currentDate = new Date().toISOString()

  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/pt-BR', priority: 1.0, changefreq: 'daily' },
    { url: '/en-US', priority: 0.9, changefreq: 'daily' },
    { url: '/pt-BR/sobre', priority: 0.9, changefreq: 'weekly' },
    { url: '/en-US/about', priority: 0.9, changefreq: 'weekly' },
    { url: '/pt-BR/projetos', priority: 0.9, changefreq: 'weekly' },
    { url: '/en-US/projects', priority: 0.9, changefreq: 'weekly' },
    { url: '/pt-BR/ia-felina', priority: 0.8, changefreq: 'weekly' },
    { url: '/en-US/feline-ai', priority: 0.8, changefreq: 'weekly' },
    { url: '/pt-BR/blog', priority: 0.9, changefreq: 'daily' },
    { url: '/en-US/blog', priority: 0.9, changefreq: 'daily' },
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${baseUrl}/pt-BR${page.url.replace('/en-US', '').replace('/pt-BR', '')}" />
    <xhtml:link rel="alternate" hreflang="en-US" href="${baseUrl}/en-US${page.url.replace('/en-US', '').replace('/pt-BR', '')}" />
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
