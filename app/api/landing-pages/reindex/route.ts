import { NextRequest, NextResponse } from 'next/server'
import { reindexLP, batchIndexLPs } from '@/lib/lp-auto-indexing'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutos para batch processing

/**
 * POST /api/landing-pages/reindex
 * Re-indexa uma LP existente (após edições)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, batch } = body

    // Batch indexing
    if (batch && Array.isArray(batch)) {
      console.log(`[LP Re-Index] Batch indexing de ${batch.length} LPs`)
      
      const results = await batchIndexLPs(batch)
      
      const successCount = results.filter(r => r.googleIndexing.success).length
      
      return NextResponse.json({
        success: true,
        batch: true,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: results.length - successCount,
          averageSeoScore: results.reduce((acc, r) => acc + r.seoScore.score, 0) / results.length
        }
      })
    }

    // Single LP re-indexing
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug ou batch são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`[LP Re-Index] Re-indexando LP: ${slug}`)
    
    const result = await reindexLP(slug)

    return NextResponse.json({
      success: true,
      slug,
      result
    })

  } catch (error: any) {
    console.error('[LP Re-Index] ❌ Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao re-indexar LP',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/landing-pages/reindex?slug=exemplo
 * Verifica status de indexação de uma LP
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Parâmetro slug é obrigatório' },
        { status: 400 }
      )
    }

    // Busca último status de indexação no banco
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()
    
    const { data: lp } = await supabase
      .from('landing_pages')
      .select('slug, indexed_at, seo_score, last_indexing_status')
      .eq('slug', slug)
      .single()

    if (!lp) {
      return NextResponse.json(
        { error: 'LP não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      slug: lp.slug,
      indexedAt: lp.indexed_at,
      seoScore: lp.seo_score,
      lastStatus: lp.last_indexing_status 
        ? JSON.parse(lp.last_indexing_status)
        : null
    })

  } catch (error: any) {
    console.error('[LP Re-Index] ❌ Erro ao verificar status:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao verificar status',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
