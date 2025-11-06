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

    // Buscar post antes de deletar
    const { data: post } = await supabaseAdmin
      .from('instagram_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Post não encontrado'
      }, { status: 404 })
    }

    // DELETAR permanentemente do banco de dados
    const { error: deleteError } = await supabaseAdmin
      .from('instagram_posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('Error deleting post:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao deletar post'
      }, { status: 500 })
    }

    // Tentar deletar imagem do storage (se não for URL externa)
    if (post.image_url && post.image_url.includes('supabase')) {
      try {
        const imagePath = post.image_url.split('/').pop()
        if (imagePath) {
          await supabaseAdmin.storage
            .from('instagram-images')
            .remove([`generated/${imagePath}`])
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error)
        // Continuar mesmo se falhar ao deletar imagem
      }
    }

    // Enviar notificação por email (opcional)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'post_rejected',
          data: {
            postId,
            caption: post.caption || 'N/A',
            reason
          }
        })
      })
    } catch (error) {
      console.error('Error sending notification email:', error)
      // Continuar mesmo se falhar ao enviar email
    }

    return NextResponse.json({
      success: true,
      message: 'Post rejeitado e deletado permanentemente',
      deletedPost: {
        id: post.id,
        titulo: post.titulo,
        caption: post.caption
      }
    })
  } catch (error) {
    console.error('Error in reject endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
