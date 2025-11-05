import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// =====================================================
// GET /api/analytics/blog
// Get blog analytics data
// =====================================================

export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    // Get total posts
    const { count: totalPosts } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    // Get published posts in period
    const { count: periodPosts } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)
      .gte('published_at', startDate.toISOString())
      .lte('published_at', endDate.toISOString())

    // Get posts with view counts (if available)
    const { data: topPosts } = await supabase
      .from('blog_posts')
      .select('title, slug, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(5)

    // Simulate view counts (in a real scenario, you'd track these separately)
    const postsWithViews = topPosts?.map((post, index) => ({
      title: post.title,
      slug: post.slug,
      views: Math.floor(Math.random() * 1000) + 500 - (index * 100) // Simulate decreasing views
    })) || []

    // Calculate changes (mock data for now)
    const previousPeriodPosts = Math.floor((periodPosts || 0) * 0.8) // Simulate 20% growth
    const postsChange = previousPeriodPosts > 0 
      ? ((periodPosts || 0) - previousPeriodPosts) / previousPeriodPosts * 100 
      : 0

    // Mock analytics data (in production, integrate with Google Analytics or similar)
    const analytics = {
      posts: {
        total: totalPosts || 0,
        period: periodPosts || 0,
        change: Math.round(postsChange * 10) / 10
      },
      views: {
        total: Math.floor(Math.random() * 5000) + 10000, // Mock total views
        change: Math.floor(Math.random() * 30) - 10 // Mock change percentage
      },
      topPosts: postsWithViews,
      avgReadTime: '3m 24s', // This would come from analytics tools
      traffic: generateMockTrafficData(period)
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      period
    })

  } catch (error) {
    console.error('[Analytics] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        success: false 
      },
      { status: 500 }
    )
  }
}

function generateMockTrafficData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const data = []
  const baseBlogViews = 80
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const blogViews = Math.floor(baseBlogViews + (Math.random() - 0.5) * 50)
    
    data.push({
      date: date.toISOString().split('T')[0],
      blogViews,
      visitors: Math.floor(blogViews * (1.5 + Math.random() * 0.5))
    })
  }
  
  return data
}