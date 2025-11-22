import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Verificar se já existe registro para hoje
    const { data: existing } = await supabase
      .from('blog_generation_skips')
      .select('*')
      .eq('skip_date', today)
      .single()

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'Geração automática já estava pulada para hoje',
        alreadySkipped: true
      })
    }

    // Inserir registro de skip
    const { error } = await supabase
      .from('blog_generation_skips')
      .insert({
        skip_date: today,
        reason: 'Manual skip from admin panel'
      })

    if (error) {
      console.error('Error skipping today:', error)
      return NextResponse.json({ error: 'Failed to skip today' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Geração automática pulada para hoje. Artigos manuais ainda disparam newsletter e posts sociais.',
      skipped_date: today
    })
  } catch (error) {
    console.error('Error in skip-today:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE para cancelar o skip de hoje
export async function DELETE(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('blog_generation_skips')
      .delete()
      .eq('skip_date', today)

    if (error) {
      console.error('Error canceling skip:', error)
      return NextResponse.json({ error: 'Failed to cancel skip' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Skip cancelado. Geração automática reativada para hoje.'
    })
  } catch (error) {
    console.error('Error in cancel skip:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
