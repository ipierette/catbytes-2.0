import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET /api/blog/themes - Retorna lista de temas únicos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale') || 'pt-BR'

    const supabase = createClient()

    // Buscar posts publicados
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('category')
      .eq('published', true)
      .eq('locale', locale)
      .not('category', 'is', null)

    if (error) {
      console.error('Error fetching themes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Extrair categorias únicas
    const uniqueThemes = [...new Set(posts?.map(p => p.category).filter(Boolean))]
    uniqueThemes.sort()

    return NextResponse.json({
      themes: uniqueThemes,
      count: uniqueThemes.length
    })
  } catch (error) {
    console.error('Error in themes API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
