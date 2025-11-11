import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'

// =====================================================
// PATCH /api/admin/blog/posts/[slug]
// Update blog post content and cover image
// =====================================================

export const runtime = 'edge'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await context.params
    
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { content, cover_image_url } = body

    console.log('[Blog Update] Updating post:', id)

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (content !== undefined) {
      updateData.content = content
    }

    if (cover_image_url !== undefined) {
      updateData.cover_image_url = cover_image_url
    }

    // Update post
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Blog Update] Error:', error)
      throw new Error(`Failed to update post: ${error.message}`)
    }

    console.log('[Blog Update] Post updated successfully')

    return NextResponse.json({
      success: true,
      post: data,
      message: 'Post updated successfully',
    })

  } catch (error: any) {
    console.error('[Blog Update] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}
