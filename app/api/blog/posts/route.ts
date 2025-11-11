import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { unstable_cache } from 'next/cache'

// =====================================================
// GET /api/blog/posts
// List blog posts with pagination
// =====================================================

export const runtime = 'edge'
// Reduced cache to allow view counts to update quickly
export const revalidate = 10

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const locale = searchParams.get('locale') || 'pt-BR'
    const theme = searchParams.get('theme') || ''
    const period = searchParams.get('period') || ''

    // Validate pagination
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Calculate date filter if period is specified
    let dateFrom: Date | null = null
    if (period) {
      const now = new Date()
      switch (period) {
        case 'last7days':
          dateFrom = new Date(now.setDate(now.getDate() - 7))
          break
        case 'last30days':
          dateFrom = new Date(now.setDate(now.getDate() - 30))
          break
        case 'last3months':
          dateFrom = new Date(now.setMonth(now.getMonth() - 3))
          break
        case 'last6months':
          dateFrom = new Date(now.setMonth(now.getMonth() - 6))
          break
        case 'lastyear':
          dateFrom = new Date(now.setFullYear(now.getFullYear() - 1))
          break
      }
    }

    // Get paginated posts for the specified locale with filters
    const result = await db.getPosts(page, pageSize, locale, theme, dateFrom)

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        'Cache-Tags': 'blog-posts',
      },
    })
  } catch (error) {
    console.error('[API] Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
