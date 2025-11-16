import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * GET /api/studio/projects/[id]
 * Buscar projeto por ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('studio_projects')
      .select('*, studio_clips(*)')
      .eq('id', params.id)
      .single()
    
    if (error) {
      console.error('❌ Erro ao buscar projeto:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Erro ao processar request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/studio/projects/[id]
 * Atualizar projeto
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('studio_projects')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erro ao atualizar projeto:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ Projeto atualizado:', params.id)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Erro ao processar request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/studio/projects/[id]
 * Deletar projeto
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Deletar clips relacionados (cascade deve fazer isso automaticamente)
    const { error } = await supabase
      .from('studio_projects')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      console.error('❌ Erro ao deletar projeto:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('✅ Projeto deletado:', params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Erro ao processar request:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
