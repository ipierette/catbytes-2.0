/**
 * API Endpoint: Gera novos tópicos automaticamente
 * GET /api/topics/generate?category=<categoria>&count=<número>
 */

import { NextRequest, NextResponse } from 'next/server'
import { autoExpandTopics, generateNewTopics, needsMoreTopics } from '@/lib/topic-generator'
import type { BlogTheme } from '@/types/blog'

const VALID_CATEGORIES: BlogTheme[] = [
  'Automação e Negócios',
  'Programação e IA',
  'Cuidados Felinos',
  'Tech Aleatório'
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as BlogTheme | null
    const countParam = searchParams.get('count')
    const count = countParam ? parseInt(countParam) : 30
    const autoMode = searchParams.get('auto') === 'true'

    // Validar categoria se fornecida
    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Categoria inválida', validCategories: VALID_CATEGORIES },
        { status: 400 }
      )
    }

    // Modo automático: verifica todas categorias e gera se necessário
    if (autoMode) {
      console.log('[API Topics] Modo automático: verificando todas categorias...')
      await autoExpandTopics(category || undefined, 20)
      
      return NextResponse.json({
        success: true,
        mode: 'auto',
        message: 'Verificação automática concluída. Veja logs do console.'
      })
    }

    // Modo manual: gera para categoria específica
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria obrigatória no modo manual' },
        { status: 400 }
      )
    }

    // Verificar se precisa
    const needs = await needsMoreTopics(category, 20)
    console.log(`[API Topics] Categoria "${category}" precisa de tópicos: ${needs}`)

    // Gerar tópicos
    const result = await generateNewTopics(category, count)

    return NextResponse.json({
      success: true,
      category: result.category,
      generated: result.generated,
      total: result.total,
      needsMore: needs,
      message: `${result.total} tópicos gerados. Adicione-os manualmente em types/blog.ts`
    })

  } catch (error) {
    console.error('[API Topics] Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar tópicos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
