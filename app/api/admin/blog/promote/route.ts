import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'
import { promoteArticle } from '@/lib/blog-social-promoter'

export const runtime = 'edge'

/**
 * POST /api/admin/blog/promote
 * 
 * Promove um artigo do blog nas redes sociais (Instagram e LinkedIn)
 * Gera posts automáticos com:
 * - Introdução aleatória da CatBytes IA
 * - Imagem da capa do artigo
 * - Texto de divulgação
 * - Hashtags relevantes (mínimo 10)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação admin
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }

    const body = await request.json()
    const { post_id, platforms } = body

    if (!post_id) {
      return NextResponse.json({
        success: false,
        error: 'post_id is required'
      }, { status: 400 })
    }

    // Buscar o artigo
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('id', post_id)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({
        success: false,
        error: 'Post not found'
      }, { status: 404 })
    }

    // Verificar se tem imagem de capa
    if (!post.cover_image_url) {
      return NextResponse.json({
        success: false,
        error: 'Post must have a cover image to be promoted on social media'
      }, { status: 400 })
    }

    // Verificar se está publicado
    if (!post.published) {
      return NextResponse.json({
        success: false,
        error: 'Only published posts can be promoted'
      }, { status: 400 })
    }

    console.log('[Blog Promote] Promoting article:', {
      id: post.id,
      title: post.title,
      platforms: platforms || ['instagram', 'linkedin']
    })

    // Promover nas redes sociais
    const results = await promoteArticle(
      {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || post.meta_description || '',
        slug: post.slug,
        cover_image_url: post.cover_image_url,
        category: post.category,
        tags: post.tags
      },
      platforms || ['instagram', 'linkedin']
    )

    // Verificar sucessos e falhas
    const successes: string[] = []
    const failures: string[] = []

    if (results.instagram) {
      if (results.instagram.success) {
        successes.push('Instagram')
      } else {
        failures.push(`Instagram: ${results.instagram.error}`)
      }
    }

    if (results.linkedin) {
      if (results.linkedin.success) {
        successes.push('LinkedIn')
      } else {
        failures.push(`LinkedIn: ${results.linkedin.error}`)
      }
    }

    const allSuccess = failures.length === 0

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess 
        ? `🎉 Artigo promovido com sucesso em: ${successes.join(', ')}`
        : `⚠️ Promovido parcialmente. Sucessos: ${successes.join(', ')}. Falhas: ${failures.join(', ')}`,
      results,
      platforms_promoted: successes,
      platforms_failed: failures
    }, { status: allSuccess ? 200 : 207 }) // 207 = Multi-Status

  } catch (error) {
    console.error('[Blog Promote] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to promote article',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
