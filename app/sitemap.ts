import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://catbytes.site'
  const lastModified = new Date()

  // Static pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/pt-BR`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/en-US`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pt-BR/sobre`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en-US/about`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pt-BR/projetos`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en-US/projects`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pt-BR/ia-felina`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en-US/feline-ai`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pt-BR/blog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en-US/blog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Fetch blog posts from Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, language, updated_at, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (posts && posts.length > 0) {
      const blogPosts: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${baseUrl}/${post.language}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

      routes.push(...blogPosts)
    }

    // Landing pages
    const { data: landingPages } = await supabase
      .from('landing_pages')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (landingPages && landingPages.length > 0) {
      const lpPages: MetadataRoute.Sitemap = landingPages.map((lp) => ({
        url: `${baseUrl}/pt-BR/lp/${lp.slug}`,
        lastModified: new Date(lp.updated_at || lp.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))

      routes.push(...lpPages)
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }

  return routes
}
