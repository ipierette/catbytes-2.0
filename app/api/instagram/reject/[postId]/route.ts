import { NextRequest, NextResponse } from 'next/server'
import { instagramDB, supabaseAdmin } from '@/lib/instagram-db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const body = await request.json()
    const reason = body.reason || 'Qualidade não aprovada'

    // Buscar post para enviar notificação
    const { data: post } = await supabaseAdmin
      .from('instagram_posts')
      .select('caption')
      .eq('id', postId)
      .single()

    // ✅ USAR método rejectPost (vamos atualizar ele para usar rejection_reason)
    const updatedPost = await instagramDB.rejectPost(postId, reason)

    // Enviar notificação por email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'post_rejected',
          data: {
            postId,
            caption: post?.caption || 'N/A',
            reason
          }
        })
      })
    } catch (error) {
      console.error('Error sending notification email:', error)
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post rejeitado com sucesso'
    })
  } catch (error) {
    console.error('Error in reject endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
