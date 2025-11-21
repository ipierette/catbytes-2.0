import { NextRequest, NextResponse } from 'next/server'
import { instagramDB, supabaseAdmin } from '@/lib/instagram-db'
import { calculateNextPublicationDate, formatDate } from '@/lib/instagram'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    
    // Ler body da requisição para pegar data customizada (se houver)
    const body = await request.json().catch(() => ({}))
    const customScheduledFor = body.scheduled_for

    // Buscar o post usando supabaseAdmin
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('instagram_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({
        success: false,
        error: 'Post não encontrado'
      }, { status: 404 })
    }

    // Usar data customizada se fornecida, senão calcular próxima data automática
    let scheduledDate: Date
    
    if (customScheduledFor) {
      scheduledDate = new Date(customScheduledFor)
      
      // Validar que a data está no futuro
      if (scheduledDate <= new Date()) {
        return NextResponse.json({
          success: false,
          error: 'A data de agendamento deve ser no futuro'
        }, { status: 400 })
      }
    } else {
      // Calcular próxima data de publicação automática
      scheduledDate = calculateNextPublicationDate(new Date())
    }

    // ✅ USAR método approvePost que já salva approved_by
    // Futuramente: extrair email do token de autenticação
    const updatedPost = await instagramDB.approvePost(
      postId,
      scheduledDate,
      'admin@catbytes.com'
    )

    // Enviar notificação por email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'post_approved',
          data: {
            postId,
            caption: post.caption,
            scheduledFor: scheduledDate.toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Error sending notification email:', error)
      // Não falha a aprovação se o email falhar
    }

    // Formatar mensagem de sucesso
    const formattedDate = formatDate(scheduledDate)

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: `Post aprovado e agendado para ${formattedDate}! 🎉`,
      scheduled_for: scheduledDate.toISOString()
    })
  } catch (error) {
    console.error('Error in approve endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
