import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

// =====================================================
// GET /api/blog/posts
// List blog posts with pagination
// =====================================================

export const runtime = 'edge'
export const revalidate = 300 // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

    // Validate pagination
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Get paginated posts
    const result = await db.getPosts(page, pageSize)

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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
