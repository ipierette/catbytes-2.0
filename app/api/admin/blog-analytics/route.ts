import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('\n🔍 [Blog Analytics API] Request recebido')
  
  // Verificar autenticação admin
  const authCheck = await verifyAdminCookie(request)
  if (!authCheck.valid) {
    console.log('❌ [Blog Analytics API] Autenticação falhou')
    return authCheck.error || NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('✅ [Blog Analytics API] Autenticação OK')

  if (!supabaseAdmin) {
    console.log('❌ [Blog Analytics API] Supabase admin não configurado!')
    return NextResponse.json(
      { success: false, error: 'Supabase admin not configured' },
      { status: 500 }
    )
  }

  console.log('✅ [Blog Analytics API] Supabase admin OK')

  try {
    // Total de visualizações (blog_posts.views)
    console.log('📊 [Blog Analytics API] Buscando posts...')
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, views, created_at, locale, published')

    if (postsError) {
      console.error('❌ [Blog Analytics API] Erro ao buscar posts:', postsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    console.log(`✅ [Blog Analytics API] ${posts?.length || 0} posts encontrados`)

    // Leituras reais (analytics_blog_views)
    console.log('📖 [Blog Analytics API] Buscando leituras...')
    const { data: reads, error: readsError } = await supabaseAdmin
      .from('analytics_blog_views')
      .select('post_id, read_time_seconds, scroll_depth_percent, session_id, locale, timestamp')

    if (readsError) {
      console.error('❌ [Blog Analytics API] Erro ao buscar leituras:', readsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }

    console.log(`✅ [Blog Analytics API] ${reads?.length || 0} leituras encontradas`)

    // Métricas agregadas
    const totalViews = posts?.reduce((acc, p) => acc + (p.views || 0), 0) || 0
    const totalReads = reads?.length || 0
    
    console.log('📈 [Blog Analytics API] Métricas:', { totalViews, totalReads })
    const avgReadTime = reads && reads.length > 0 
      ? reads.reduce((acc, r) => acc + (r.read_time_seconds || 0), 0) / reads.length 
      : 0
    const avgScrollDepth = reads && reads.length > 0 
      ? reads.reduce((acc, r) => acc + (r.scroll_depth_percent || 0), 0) / reads.length 
      : 0

    // Top posts
    const topPosts = posts
      ?.map(post => {
        const postReads = reads?.filter(r => r.post_id === post.id) || []
        const qualityReads = postReads.filter(r => r.read_time_seconds > 30).length
        const bounceRate = postReads.length > 0 
          ? (postReads.filter(r => r.read_time_seconds < 30).length / postReads.length) * 100 
          : 0
        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          views: post.views,
          reads: postReads.length,
          qualityReads,
          avgReadTime: postReads.length > 0 
            ? postReads.reduce((acc, r) => acc + (r.read_time_seconds || 0), 0) / postReads.length 
            : 0,
          bounceRate: Math.round(bounceRate),
        }
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Views por dia
    const viewsByDay: Record<string, { views: number; reads: number }> = {}
    
    for (const r of reads || []) {
      const date = r.timestamp?.slice(0, 10)
      if (!date) continue
      if (!viewsByDay[date]) viewsByDay[date] = { views: 0, reads: 0 }
      viewsByDay[date].reads += 1
    }
    
    for (const p of posts || []) {
      const date = p.created_at?.slice(0, 10)
      if (!date) continue
      if (!viewsByDay[date]) viewsByDay[date] = { views: 0, reads: 0 }
      viewsByDay[date].views += p.views || 0
    }

    // Views por idioma
    const viewsByLanguage: Record<string, number> = {}
    for (const r of reads || []) {
      const lang = r.locale || 'unknown'
      if (!viewsByLanguage[lang]) viewsByLanguage[lang] = 0
      viewsByLanguage[lang] += 1
    }

    // Métricas de engajamento
    const engagementMetrics = {
      totalSessions: new Set(reads?.map(r => r.session_id)).size,
      qualityReads: reads?.filter(r => r.read_time_seconds > 30).length || 0,
      completionRate: reads && reads.length > 0 
        ? (reads.filter(r => r.scroll_depth_percent > 80).length / reads.length) * 100 
        : 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        totalViews,
        totalReads,
        avgReadTime: Math.round(avgReadTime),
        avgScrollDepth: Math.round(avgScrollDepth),
        topPosts,
        viewsByDay: Object.entries(viewsByDay).map(([date, v]) => ({ date, ...v })),
        viewsByLanguage,
        engagementMetrics,
      },
    })
  } catch (error) {
    console.error('[Blog Analytics] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
