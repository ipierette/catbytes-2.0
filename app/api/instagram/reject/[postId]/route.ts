import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const body = await request.json()
    const reason = body.reason || 'Qualidade não aprovada'

    // Buscar post para enviar notificação
    const { data: post } = await supabase
      .from('instagram_posts')
      .select('caption')
      .eq('id', postId)
      .single()

    // Atualizar status do post para rejected
    const { data: updatedPost, error: updateError } = await supabase
      .from('instagram_posts')
      .update({
        status: 'rejected',
        error_message: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (updateError) {
      console.error('Error rejecting post:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao rejeitar post'
      }, { status: 500 })
    }

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
