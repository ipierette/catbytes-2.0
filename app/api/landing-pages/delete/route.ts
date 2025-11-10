import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { landingPageId } = await req.json()

    if (!landingPageId) {
      return NextResponse.json(
        { error: 'ID da landing page é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // 1. Buscar landing page para validar
    const { data: landingPage, error: fetchError } = await supabase
      .from('landing_pages')
      .select('id, title, slug')
      .eq('id', landingPageId)
      .single()

    if (fetchError || !landingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    // 2. Excluir registros relacionados primeiro (views e leads)
    await supabase
      .from('landing_page_views')
      .delete()
      .eq('landing_page_id', landingPageId)

    await supabase
      .from('landing_page_leads')
      .delete()
      .eq('landing_page_id', landingPageId)

    // 3. Excluir a landing page
    const { error: deleteError } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', landingPageId)

    if (deleteError) {
      console.error('❌ Erro ao excluir landing page:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir landing page', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Landing page excluída: ${landingPage.title} (${landingPage.slug})`)

    return NextResponse.json({
      success: true,
      message: 'Landing page excluída com sucesso',
      data: landingPage
    })

  } catch (error: any) {
    console.error('❌ Erro ao excluir landing page:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir landing page', details: error.message },
      { status: 500 }
    )
  }
}
