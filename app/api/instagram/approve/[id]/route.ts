/**
 * Instagram Approve/Reject API
 * Aprova ou rejeita posts pendentes
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB, supabaseAdmin } from '@/lib/instagram-db'
import { verifyAdmin } from '@/lib/api-security'
import { saveInstagramImageToStorage } from '@/lib/instagram-image-storage'

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

    // Busca o post atual para verificar a imagem
    const { data: currentPost } = await supabaseAdmin
      .from('instagram_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Se a imagem ainda não está no bucket permanente, salva agora
    let finalImageUrl = currentPost.image_url
    if (currentPost.image_url && !currentPost.image_url.includes('instagram-images')) {
      console.log('Saving image to permanent storage...')
      const permanentUrl = await saveInstagramImageToStorage(currentPost.image_url, id)
      if (permanentUrl) {
        finalImageUrl = permanentUrl
        await instagramDB.updatePost(id, { image_url: permanentUrl })
        console.log('Image saved to permanent storage')
      }
    }

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
