import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTokenReminderEmailTemplate } from '@/lib/token-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Criar lembrete de token
export async function POST(request: NextRequest) {
  try {
    const { platform, expiryDate, reminderDays } = await request.json()

    if (!platform || !expiryDate) {
      return NextResponse.json({
        success: false,
        error: 'Platform e expiryDate são obrigatórios'
      }, { status: 400 })
    }

    // Remover lembretes existentes para esta plataforma
    await supabase
      .from('token_reminders')
      .delete()
      .eq('platform', platform)

    // Criar novos lembretes
    const reminders = reminderDays.map((days: number) => {
      const reminderDate = new Date(expiryDate)
      reminderDate.setDate(reminderDate.getDate() - days)

      return {
        platform,
        token_expires_at: expiryDate,
        reminder_date: reminderDate.toISOString(),
        days_before: days,
        sent: false,
        created_at: new Date().toISOString()
      }
    })

    const { data, error } = await supabase
      .from('token_reminders')
      .insert(reminders)
      .select()

    if (error) {
      console.error('Erro ao criar lembretes:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao salvar lembretes no banco'
      }, { status: 500 })
    }

    console.log(`✅ Criados ${reminders.length} lembretes para ${platform}`)

    return NextResponse.json({
      success: true,
      message: `Lembretes criados para ${platform}`,
      reminders: data
    })

  } catch (error) {
    console.error('Erro na API token-reminders:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// GET - Listar lembretes pendentes
export async function GET() {
  try {
    const now = new Date().toISOString()

    // Buscar lembretes que devem ser enviados hoje
    const { data: pendingReminders, error } = await supabase
      .from('token_reminders')
      .select('*')
      .eq('sent', false)
      .lte('reminder_date', now)
      .order('reminder_date', { ascending: true })

    if (error) {
      console.error('Erro ao buscar lembretes:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar lembretes'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reminders: pendingReminders || [],
      count: pendingReminders?.length || 0
    })

  } catch (error) {
    console.error('Erro na API GET token-reminders:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// PATCH - Marcar lembrete como enviado
export async function PATCH(request: NextRequest) {
  try {
    const { reminderIds } = await request.json()

    if (!reminderIds || !Array.isArray(reminderIds)) {
      return NextResponse.json({
        success: false,
        error: 'reminderIds deve ser um array'
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('token_reminders')
      .update({ 
        sent: true, 
        sent_at: new Date().toISOString() 
      })
      .in('id', reminderIds)
      .select()

    if (error) {
      console.error('Erro ao marcar lembretes como enviados:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao atualizar lembretes'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${reminderIds.length} lembretes marcados como enviados`,
      updated: data
    })

  } catch (error) {
    console.error('Erro na API PATCH token-reminders:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// DELETE - Remover todos os lembretes de uma plataforma
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    if (!platform) {
      return NextResponse.json({
        success: false,
        error: 'Platform é obrigatório'
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('token_reminders')
      .delete()
      .eq('platform', platform)

    if (error) {
      console.error('Erro ao deletar lembretes:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao deletar lembretes'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Lembretes de ${platform} removidos`
    })

  } catch (error) {
    console.error('Erro na API DELETE token-reminders:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}