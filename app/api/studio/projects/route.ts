import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * GET /api/studio/projects
 * Listar todos os projetos do Studio
 */
export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('studio_projects')
      .select('*')
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar projetos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Erro ao processar request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/studio/projects
 * Criar novo projeto
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createClient()
    
    // Validação
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title é obrigatório' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('studio_projects')
      .insert({
        title: body.title,
        description: body.description || '',
        thumbnail_url: body.thumbnail_url || null,
        duration: body.duration || 0,
        status: 'draft',
        aspect_ratio: body.aspect_ratio || '16:9',
        resolution: body.resolution || '1080p',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao criar projeto:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ Projeto criado:', data.id)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Erro ao processar request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
