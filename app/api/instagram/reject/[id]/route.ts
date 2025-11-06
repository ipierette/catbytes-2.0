/**
 * Instagram Reject API
 * Rejeita posts pendentes
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB, supabaseAdmin } from '@/lib/instagram-db'
import { verifyAdmin } from '@/lib/api-security'
import { deleteInstagramImageFromStorage } from '@/lib/instagram-image-storage'

/**
 * POST /api/instagram/reject/[id]
 * Rejeita um post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(request)
    const { id } = await params

    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'Rejeitado pelo admin'

    console.log(`Rejecting post: ${id}`)

    // Busca o post para verificar se tem imagem no bucket
    const { data: currentPost } = await supabaseAdmin
      .from('instagram_posts')
      .select('*')
      .eq('id', id)
      .single()

    // Remove imagem do bucket se existir
    if (currentPost?.image_url) {
      const deleted = await deleteInstagramImageFromStorage(currentPost.image_url)
      if (deleted) {
        console.log('Image removed from storage')
      }
    }

    const post = await instagramDB.rejectPost(id, reason)

    return NextResponse.json({
      success: true,
      post,
      message: 'Post rejeitado com sucesso'
    })

  } catch (error) {
    console.error('Error rejecting post:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
