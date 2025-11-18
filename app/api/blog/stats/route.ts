import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin not configured' },
        { status: 500 }
      )
    }

    // Total de posts
    const { count: total, error: totalError } = await supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })

    if (totalError) throw totalError

    // Posts publicados
    const { count: published, error: publishedError } = await supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    if (publishedError) throw publishedError

    // Rascunhos
    const { count: drafts, error: draftsError } = await supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', false)

    if (draftsError) throw draftsError

    // Último post gerado
    const { data: lastPost, error: lastPostError } = await supabaseAdmin
      .from('blog_posts')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lastPostError && lastPostError.code !== 'PGRST116') {
      console.error('Erro ao buscar último post:', lastPostError)
    }

    return NextResponse.json({
      total: total || 0,
      published: published || 0,
      drafts: drafts || 0,
      lastGenerated: lastPost?.created_at || null
    })

  } catch (error) {
    console.error('Erro ao buscar stats do blog:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
