import { NextRequest, NextResponse } from 'next/server'
import { instagramDB, supabaseAdmin } from '@/lib/instagram-db'

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

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

    // Calcular próxima data de publicação
    const scheduledDate = calculateNextPublicationDate(new Date())

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
    const formattedDate = scheduledDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

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

// Calcular próxima data de publicação (seg, qua, sex, dom às 13:00 BRT)
function calculateNextPublicationDate(fromDate: Date): Date {
  const publicationDays = new Set([1, 3, 5, 0]) // Segunda, Quarta, Sexta, Domingo
  const publicationHour = 13 // 13:00 BRT
  
  const result = new Date(fromDate)
  result.setHours(publicationHour, 0, 0, 0)
  
  // Se já passou das 13:00 hoje, começar do próximo dia
  if (fromDate.getHours() >= publicationHour) {
    result.setDate(result.getDate() + 1)
  }
  
  // Encontrar o próximo dia de publicação
  let daysChecked = 0
  while (daysChecked < 7) {
    if (publicationDays.has(result.getDay())) {
      return result
    }
    result.setDate(result.getDate() + 1)
    daysChecked++
  }
  
  return result
}
