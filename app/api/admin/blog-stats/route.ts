// =====================================================
// API Route: Blog Statistics
// GET /api/admin/blog-stats
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

interface BlogStats {
  totalPosts: number
  totalViews: number
  postsThisMonth: number
  postsByStatus: {
    draft: number
    published: number
    scheduled: number
    archived: number
  }
  postsByLanguage: {
    'pt-BR': number
    'en-US': number
  }
  topPosts: Array<{
    id: string
    title: string
    slug: string
    views: number
    locale: string
    created_at: string
  }>
  recentPosts: Array<{
    id: string
    title: string
    status: string
    created_at: string
  }>
  viewsByMonth: Array<{
    month: string
    views: number
    posts: number
  }>
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // ========================================
    // 1. Verify Admin Authentication
    // ========================================
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error || NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ========================================
    // 2. Check Supabase Admin
    // ========================================
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin not configured' },
        { status: 500 }
      )
    }

    // ========================================
    // 3. Fetch All Posts
    // ========================================
    const { data: allPosts, error: postsError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .is('deleted_at', null)

    if (postsError) {
      console.error('[Blog Stats] Error fetching posts:', postsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    // ========================================
    // 4. Calculate Statistics
    // ========================================
    const posts = allPosts || []
    
    // Total counts
    const totalPosts = posts.length
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)

    // Posts this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const postsThisMonth = posts.filter(
      (post) => new Date(post.created_at) >= firstDayOfMonth
    ).length

    // Posts by status
    const postsByStatus = {
      draft: posts.filter((p) => p.status === 'draft').length,
      published: posts.filter((p) => p.status === 'published').length,
      scheduled: posts.filter((p) => p.status === 'scheduled').length,
      archived: posts.filter((p) => p.status === 'archived').length,
    }

    // Posts by language
    const postsByLanguage = {
      'pt-BR': posts.filter((p) => p.locale === 'pt-BR').length,
      'en-US': posts.filter((p) => p.locale === 'en-US').length,
    }

    // Top 10 most viewed posts
    const topPosts = [...posts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10)
      .map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post.views || 0,
        locale: post.locale || 'pt-BR',
        created_at: post.created_at,
      }))

    // Recent posts (last 5)
    const recentPosts = [...posts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((post) => ({
        id: post.id,
        title: post.title,
        status: post.status || 'published',
        created_at: post.created_at,
      }))

    // ========================================
    // 5. Calculate Views by Month (Last 6 Months)
    // ========================================
    const viewsByMonth: Array<{ month: string; views: number; posts: number }> = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthPosts = posts.filter((post) => {
        const postDate = new Date(post.created_at)
        return postDate >= monthStart && postDate <= monthEnd
      })

      const monthViews = monthPosts.reduce((sum, post) => sum + (post.views || 0), 0)

      viewsByMonth.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        views: monthViews,
        posts: monthPosts.length,
      })
    }

    // ========================================
    // 6. Build Response
    // ========================================
    const stats: BlogStats = {
      totalPosts,
      totalViews,
      postsThisMonth,
      postsByStatus,
      postsByLanguage,
      topPosts,
      recentPosts,
      viewsByMonth,
    }

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      stats,
      executionTime,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Blog Stats] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ========================================
// OPTIONS for CORS
// ========================================
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
