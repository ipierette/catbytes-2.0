import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const VALID_CATEGORIES = [
  'Automação e Negócios',
  'Programação e IA',
  'Cuidados Felinos',
  'Tech Aleatório'
]

export async function POST(request: NextRequest) {
  try {
    const { category, topic } = await request.json()

    // Validações
    if (!category || !topic) {
      return NextResponse.json(
        { success: false, error: 'Categoria e tópico são obrigatórios' },
        { status: 400 }
      )
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Categoria inválida. Use: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }

    const trimmedTopic = topic.trim()
    if (trimmedTopic.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Tópico deve ter pelo menos 3 caracteres' },
        { status: 400 }
      )
    }

    if (trimmedTopic.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Tópico deve ter no máximo 200 caracteres' },
        { status: 400 }
      )
    }

    // Registrar em cron_execution_log como topic_expansion manual
    const now = new Date().toISOString()
    const { error } = await supabaseAdmin
      .from('cron_execution_log')
      .insert({
        job_name: 'topic_expansion',
        status: 'success',
        started_at: now,
        completed_at: now,
        duration_ms: 0,
        result: {
          generated: [trimmedTopic],
          total: 1,
          category
        },
        metadata: {
          category,
          count: 1,
          method: 'manual',
          added_by: 'dashboard'
        }
      })

    if (error) {
      console.error('Error registering manual topic:', error)
      return NextResponse.json(
        { success: false, error: 'Erro ao registrar tópico' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tópico registrado com sucesso!',
      topic: trimmedTopic,
      category,
      note: 'Adicione também em types/blog.ts no array de tópicos da categoria correspondente'
    })
  } catch (error) {
    console.error('Error in add-manual API:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
