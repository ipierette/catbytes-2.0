import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * POST /api/reports/send
 * Envia relatório por email (diário ou semanal)
 */
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()

    if (!type || !['daily', 'weekly'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo inválido. Use "daily" ou "weekly"' },
        { status: 400 }
      )
    }

    console.log(`[Reports] Sending ${type} report...`)

    // Chama o endpoint de email para enviar o relatório
    const baseUrl = request.nextUrl.origin
    const emailResponse = await fetch(`${baseUrl}/api/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: type === 'daily' ? 'daily_report' : 'weekly_report',
        data: {}
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      console.error('[Reports] Failed to send email:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email' },
        { status: 500 }
      )
    }

    const result = await emailResponse.json()

    return NextResponse.json({
      success: true,
      message: type === 'daily' 
        ? 'Relatório diário enviado com sucesso!' 
        : 'Relatório semanal enviado com sucesso!',
      data: result
    })

  } catch (error) {
    console.error('[Reports] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar solicitação',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
