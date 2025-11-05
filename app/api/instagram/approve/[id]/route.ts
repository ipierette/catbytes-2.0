/**
 * Instagram Approve/Reject API
 * Aprova ou rejeita posts pendentes
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { verifyAdmin } from '@/lib/api-security'

/**
 * POST /api/instagram/approve/[id]
 * Aprova um post e agenda para próxima data disponível
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(request)
    const { id } = await params

    console.log(`Approving post: ${id}`)

    // Busca próxima data disponível
    const scheduledFor = await instagramDB.getNextAvailableSlot()
    console.log(`Scheduled for: ${scheduledFor.toISOString()}`)

    // Aprova o post
    const post = await instagramDB.approvePost(id, scheduledFor, 'admin')

    return NextResponse.json({
      success: true,
      post,
      scheduledFor: scheduledFor.toISOString(),
      message: `Post aprovado e agendado para ${scheduledFor.toLocaleString('pt-BR')}`
    })

  } catch (error) {
    console.error('Error approving post:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
