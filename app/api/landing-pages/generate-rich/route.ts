import { NextRequest, NextResponse } from 'next/server'
import { generateRichLPContent, getSuggestedLPs, type LPRichContent } from '@/lib/lp-content-generator'
import type { NicheValue } from '@/lib/landing-pages-constants'

export const runtime = 'edge'
export const maxDuration = 60

interface GenerateRichLPRequest {
  nicho: NicheValue
  tipo: 'guia' | 'calculadora' | 'checklist' | 'comparativo' | 'case-study'
}

/**
 * POST /api/landing-pages/generate-rich
 * Gera LP com conteúdo rico otimizado para SEO e backlinks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerateRichLPRequest
    const { nicho, tipo } = body

    if (!nicho || !tipo) {
      return NextResponse.json(
        { error: 'Nicho e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`[LP Rich Generator] Gerando LP tipo "${tipo}" para nicho "${nicho}"`)

    // Gera conteúdo rico com IA
    const richContent: LPRichContent = await generateRichLPContent(nicho, tipo)

    console.log(`[LP Rich Generator] ✅ LP gerada com sucesso:`, {
      title: richContent.title,
      slug: richContent.slug,
      palavras: richContent.secoes.reduce((acc, s) => acc + s.conteudo.split(' ').length, 0),
      linksInternos: richContent.linksInternos.length,
      faq: richContent.faq.length
    })

    return NextResponse.json({
      success: true,
      content: richContent,
      metadata: {
        tipo,
        nicho,
        palavrasTotal: richContent.introducao.split(' ').length + 
          richContent.secoes.reduce((acc, s) => acc + s.conteudo.split(' ').length, 0),
        secoesCount: richContent.secoes.length,
        linksInternosCount: richContent.linksInternos.length,
        faqCount: richContent.faq.length,
        ctasCount: richContent.ctas.length
      }
    })

  } catch (error: any) {
    console.error('[LP Rich Generator] ❌ Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar LP rica',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/landing-pages/generate-rich?nicho=consultorio
 * Retorna sugestões de LPs ricas para um nicho
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nicho = searchParams.get('nicho') as NicheValue

    if (!nicho) {
      return NextResponse.json(
        { error: 'Parâmetro nicho é obrigatório' },
        { status: 400 }
      )
    }

    const suggestions = getSuggestedLPs(nicho)

    return NextResponse.json({
      success: true,
      nicho,
      suggestions,
      total: suggestions.length
    })

  } catch (error: any) {
    console.error('[LP Rich Generator] ❌ Erro ao buscar sugestões:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao buscar sugestões',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
