/**
 * Instagram Batch Reject API
 * Rejeita múltiplos posts em lote
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB, supabaseAdmin } from '@/lib/instagram-db'
import { verifyAdminCookie } from '@/lib/api-security'
import { deleteInstagramImageFromStorage } from '@/lib/instagram-image-storage'

/**
 * POST /api/instagram/reject-batch
 * Rejeita múltiplos posts
 */
export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }

    const body = await request.json()
    const { postIds, reason } = body

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post IDs array is required' },
        { status: 400 }
      )
    }

    console.log(`Batch rejecting ${postIds.length} posts`)

    const results = []
    const errors = []

    for (const id of postIds) {
      try {
        // Busca o post para verificar se tem imagem no bucket
        const { data: currentPost } = await supabaseAdmin
          .from('instagram_posts')
          .select('*')
          .eq('id', id)
          .single()

        if (!currentPost) {
          errors.push({ id, error: 'Post not found' })
          continue
        }

        // Remove imagem do bucket se existir
        if (currentPost.image_url) {
          const deleted = await deleteInstagramImageFromStorage(currentPost.image_url)
          if (deleted) {
            console.log(`Image removed from storage for post ${id}`)
          }
        }

        // Rejeita o post
        const post = await instagramDB.rejectPost(id, reason || 'Rejeitado em lote pelo admin')
        results.push({ id, success: true, post })

      } catch (error) {
        console.error(`Error rejecting post ${id}:`, error)
        errors.push({ 
          id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    console.log(`Batch rejection complete: ${results.length} success, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      rejected: results.length,
      total: postIds.length,
      errors: errors.length,
      results,
      errorDetails: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in batch rejection:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}