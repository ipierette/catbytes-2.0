import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

// =====================================================
// GET /api/blog/posts/[slug]
// Get single blog post by slug
// =====================================================

export const runtime = 'edge'
// Removed static revalidate - we'll handle caching dynamically
// to ensure view counts update properly

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Get post by slug
    const post = await db.getPostBySlug(slug)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    console.log('[API] Post found:', { id: post.id, slug: post.slug, currentViews: post.views })

    // Increment views (fire and forget)
    const incrementPromise = db.incrementViews(post.id)
      .then((success) => {
        console.log('[API] incrementViews result:', success)
        return success
      })
      .catch((err) => {
        console.error('[API] incrementViews error:', err)
        return false
      })

    // Wait for increment to complete before responding
    await incrementPromise

    // Fetch updated post with new view count
    const updatedPost = await db.getPostBySlug(slug)

    return NextResponse.json(updatedPost || post, {
      headers: {
        // Short cache only, prioritize fresh data for view counts
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
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
