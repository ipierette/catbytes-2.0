import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { landingPageId } = await req.json()

    if (!landingPageId) {
      return NextResponse.json(
        { error: 'landingPageId é obrigatório' },
        { status: 400 }
      )
    }

    // 1. Buscar landing page
    const { data: landingPage, error: fetchError } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', landingPageId)
      .single()

    if (fetchError || !landingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    // 2. Verificar se já está arquivada
    if (landingPage.status === 'archived') {
      return NextResponse.json(
        { error: 'Landing page já está arquivada' },
        { status: 400 }
      )
    }

    // 3. Arquivar (manter dados analytics)
    const { error: updateError } = await supabase
      .from('landing_pages')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
      })
      .eq('id', landingPageId)

    if (updateError) {
      throw updateError
    }

    // Nota: NÃO deletamos do Vercel para manter histórico
    // O deploy continua acessível mas marcado como arquivado no sistema

    console.log(`✅ Landing page ${landingPageId} arquivada com sucesso`)

    return NextResponse.json({
      success: true,
      message: 'Landing page arquivada com sucesso',
      data: {
        id: landingPageId,
        status: 'archived',
        archived_at: new Date().toISOString(),
      }
    })

  } catch (error: any) {
    console.error('❌ Erro ao arquivar landing page:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao arquivar landing page', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
