import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar se a requisição vem do cron job do Vercel
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Enviar relatório diário
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'daily_report',
        data: {}
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Relatório diário enviado com sucesso',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error sending daily report:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar relatório'
    }, { status: 500 })
  }
}
