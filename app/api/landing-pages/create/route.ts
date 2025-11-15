import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validação
    if (!body.title || !body.slug || !body.niche) {
      return NextResponse.json(
        { error: 'Title, slug e niche são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verifica se slug já existe
    const { data: existing } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma LP com este slug' },
        { status: 400 }
      )
    }

    // Cria landing page
    const { data: landingPage, error } = await supabase
      .from('landing_pages')
      .insert({
        title: body.title,
        slug: body.slug,
        niche: body.niche,
        problem: body.problem || '',
        solution: body.solution || '',
        cta_text: body.cta_text || 'Fale Conosco',
        theme_color: body.theme_color || 'purple',
        headline: body.headline || body.title,
        subheadline: body.subheadline || '',
        benefits: body.benefits || [],
        hero_image_url: body.hero_image_url || null,
        html_content: body.html_content || '',
        status: 'published',
        deploy_status: 'pending',
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar LP:', error)
      return NextResponse.json(
        { error: 'Erro ao criar landing page', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ LP criada com sucesso:', landingPage.slug)

    return NextResponse.json({
      success: true,
      landingPage
    })

  } catch (error: any) {
    console.error('❌ Erro ao processar request:', error)
    return NextResponse.json(
      { error: 'Erro ao criar landing page', details: error.message },
      { status: 500 }
    )
  }
}
