import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Buscar todas as landing pages
    const { data: landingPages, error } = await supabase
      .from('landing_pages')
      .select(`
        id,
        title,
        slug,
        niche,
        theme_color,
        headline,
        subheadline,
        hero_image_url,
        deploy_url,
        deploy_status,
        views_count,
        leads_count,
        conversion_rate,
        status,
        created_at,
        published_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar landing pages:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar landing pages', details: error.message },
        { status: 500 }
      )
    }

    // Calcular estatísticas gerais
    const stats = {
      total: landingPages?.length || 0,
      published: landingPages?.filter(lp => lp.status === 'published').length || 0,
      draft: landingPages?.filter(lp => lp.status === 'draft').length || 0,
      archived: landingPages?.filter(lp => lp.status === 'archived').length || 0,
      totalViews: landingPages?.reduce((sum, lp) => sum + (lp.views_count || 0), 0) || 0,
      totalLeads: landingPages?.reduce((sum, lp) => sum + (lp.leads_count || 0), 0) || 0,
      avgConversion: landingPages && landingPages.length > 0
        ? (landingPages.reduce((sum, lp) => sum + (lp.conversion_rate || 0), 0) / landingPages.length).toFixed(2)
        : '0.00'
    }

    return NextResponse.json({
      success: true,
      landingPages: landingPages || [],
      stats
    })

  } catch (error: any) {
    console.error('❌ Erro ao listar landing pages:', error)
    return NextResponse.json(
      { error: 'Erro ao listar landing pages', details: error.message },
      { status: 500 }
    )
  }
}
