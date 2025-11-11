import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'

// =====================================================
// GET /api/admin/blog/pending-translations
// Lista posts em PT-BR que ainda não foram traduzidos
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    console.log('[Pending Translations] Fetching posts that need translation...')

    // Buscar posts em PT-BR que estão publicados
    const { data: ptPosts, error: ptError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, published_at, locale, excerpt, cover_image_url')
      .eq('locale', 'pt-BR')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (ptError) {
      console.error('[Pending Translations] Error fetching PT posts:', ptError)
      return NextResponse.json(
        { error: 'Failed to fetch Portuguese posts' },
        { status: 500 }
      )
    }

    if (!ptPosts || ptPosts.length === 0) {
      return NextResponse.json({
        success: true,
        pendingTranslations: [],
        message: 'No Portuguese posts found',
      })
    }

    // Buscar traduções existentes
    const { data: enPosts, error: enError } = await supabaseAdmin
      .from('blog_posts')
      .select('translated_from, title, slug')
      .eq('locale', 'en-US')
      .not('translated_from', 'is', null)

    if (enError) {
      console.error('[Pending Translations] Error fetching EN translations:', enError)
    }

    // Criar mapa de traduções existentes
    const existingTranslations = new Set(
      enPosts?.map(post => post.translated_from) || []
    )

    // Filtrar posts que ainda não foram traduzidos
    const pendingTranslations = ptPosts.filter(
      post => !existingTranslations.has(post.id)
    )

    // Adicionar informações sobre traduções existentes
    const translationsMap = new Map(
      enPosts?.map(post => [post.translated_from, {
        title: post.title,
        slug: post.slug
      }]) || []
    )

    const postsWithTranslationStatus = ptPosts.map(post => ({
      ...post,
      hasTranslation: existingTranslations.has(post.id),
      translation: translationsMap.get(post.id) || null
    }))

    console.log(`[Pending Translations] Found ${pendingTranslations.length} posts needing translation out of ${ptPosts.length} total`)

    return NextResponse.json({
      success: true,
      pendingTranslations,
      allPosts: postsWithTranslationStatus,
      stats: {
        totalPosts: ptPosts.length,
        translated: existingTranslations.size,
        pending: pendingTranslations.length,
        translationPercentage: Math.round((existingTranslations.size / ptPosts.length) * 100)
      }
    })

  } catch (error: any) {
    console.error('[Pending Translations] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending translations' },
      { status: 500 }
    )
  }
}