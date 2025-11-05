/**
 * Instagram Reject API
 * Rejeita posts pendentes
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { verifyAdmin } from '@/lib/api-security'

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
