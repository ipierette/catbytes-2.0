import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

/**
 * Dynamic Sitemap for CatBytes
 * Generates sitemap with optimized priorities based on content freshness
 * 
 * Priority Strategy:
 * - Homepage: 1.0 (highest)
 * - Main pages (pt-BR): 1.0
 * - Main pages (en-US): 0.9
 * - Blog page: 0.95
 * - Recent blog posts (top 5): 0.9
 * - Posts < 1 week: 0.85
 * - Posts < 1 month: 0.75
 * - Older posts: 0.7
 * - Landing pages: 0.8
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://catbytes.site'
  const lastModified = new Date()

  // Static pages with optimized priorities
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pt-BR`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
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
      priority: 0.95,
    },
    {
      url: `${baseUrl}/en-US/blog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.85,
    },
  ]

  // Fetch blog posts from Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Blog posts with dynamic priorities based on recency
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, locale, updated_at, created_at, published')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (posts && posts.length > 0) {
      const now = new Date().getTime()
      const oneWeek = 7 * 24 * 60 * 60 * 1000
      const oneMonth = 30 * 24 * 60 * 60 * 1000
      
      const blogPosts: MetadataRoute.Sitemap = posts.map((post, index) => {
        const postDate = new Date(post.updated_at || post.created_at).getTime()
        const age = now - postDate
        
        // Dynamic priority based on age and position
        let priority = 0.7
        if (index < 5) priority = 0.9 // Most recent posts
        else if (age < oneWeek) priority = 0.85 // Posts from last week
        else if (age < oneMonth) priority = 0.75 // Posts from last month
        
        // More frequent updates for recent posts
        const changeFreq = age < oneWeek ? 'daily' : age < oneMonth ? 'weekly' : 'monthly'
        
        return {
          url: `${baseUrl}/${post.locale || 'pt-BR'}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at || post.created_at),
          changeFrequency: changeFreq as 'daily' | 'weekly' | 'monthly',
          priority,
        }
      })

      routes.push(...blogPosts)
    }

    // Landing pages
    const { data: landingPages } = await supabase
      .from('landing_pages')
      .select('slug, updated_at, created_at, status')
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
    console.error('[Sitemap] Error fetching dynamic routes:', error)
  }

  return routes
}
