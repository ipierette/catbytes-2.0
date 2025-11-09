import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

// =====================================================
// GET /api/blog/posts/[slug]
// Get single blog post by slug
// =====================================================

export const runtime = 'edge'
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Check if this is a view increment request (from client-side)
    const shouldIncrementViews = request.headers.get('x-increment-views') === 'true'

    // Get post by slug
    const post = await db.getPostBySlug(slug)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    console.log('[API] Post found:', { id: post.id, slug: post.slug, currentViews: post.views })

    // Only increment views if explicitly requested
    if (shouldIncrementViews) {
      await db.incrementViews(post.id)
        .then((success) => {
          console.log('[API] incrementViews result:', success)
          return success
        })
        .catch((err) => {
          console.error('[API] incrementViews error:', err)
          return false
        })

      // Fetch updated post with new view count
      const updatedPost = await db.getPostBySlug(slug)
      
      return NextResponse.json(updatedPost || post, {
        headers: {
          'Cache-Control': 'no-store', // Don't cache view increment requests
        },
      })
    }

    // For regular requests, return cached data
    return NextResponse.json(post, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('[API] Error fetching post:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
