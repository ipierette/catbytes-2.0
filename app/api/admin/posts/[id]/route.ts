import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { db, supabaseAdmin } from '@/lib/supabase'

// =====================================================
// DELETE /api/admin/posts/[id]
// Delete a blog post (admin only)
// =====================================================

export const runtime = 'edge'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this')

async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  
  if (!token) {
    throw new Error('Not authenticated')
  }

  await jwtVerify(token, JWT_SECRET)
  return true
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdmin(request)

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    console.log('[Admin] Deleting post:', id)

    // Get post to check if it has translations
    const post = await db.getPostById(id)

    // Delete the post
    await db.deletePost(id)

    // Also delete translations if this is the original post
    if (supabaseAdmin && post.locale === 'pt-BR') {
      const { data: translations } = await supabaseAdmin
        .from('blog_posts')
        .select('id')
        .eq('translated_from', id)

      if (translations && translations.length > 0) {
        for (const translation of translations) {
          await db.deletePost(translation.id)
        }
        console.log('[Admin] Deleted', translations.length, 'translations')
      }
    }

    // TODO: Delete image from Supabase Storage (optional)

    console.log('[Admin] Post deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('[Admin] Delete error:', error)

    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to delete post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
