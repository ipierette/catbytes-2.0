import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'

const supabase = supabaseAdmin!

export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status') // pending, approved, published, etc.

    // Se filtrar por status específico
    if (status) {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        posts: data || [],
        total: data?.length || 0
      })
    }

    // Sem filtro: retorna tudo paginado
    const result = await instagramDB.listPosts(page, pageSize)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, caption, image_url, carousel_images, postId, scheduledFor } = body

    console.log('[Instagram Posts API] Action:', action, 'PostId:', postId)

    // Action: save (salvar novo post como rascunho/pending)
    if (action === 'save') {
      if (!caption) {
        return NextResponse.json(
          { error: 'Caption é obrigatória' },
          { status: 400 }
        )
      }

      if (!image_url && !carousel_images) {
        return NextResponse.json(
          { error: 'É necessário fornecer image_url ou carousel_images' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('instagram_posts')
        .insert({
          caption,
          image_url: image_url || null,
          carousel_images: carousel_images || null,
          status: 'pending',
          generation_method: 'text-only-manual'
        })
        .select()
        .single()

      if (error) {
        console.error('[Instagram Posts API] Error saving post:', error)
        throw error
      }

      console.log('[Instagram Posts API] Post saved successfully:', data.id)

      return NextResponse.json({
        success: true,
        postId: data.id,
        post: data
      })
    }

    // Action: approve (aprovar post e agendar)
    if (action === 'approve') {
      if (!postId) {
        return NextResponse.json(
          { error: 'postId é obrigatório' },
          { status: 400 }
        )
      }

      const updateData: any = {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'admin'
      }

      if (scheduledFor) {
        updateData.scheduled_for = scheduledFor
      }

      const { data, error } = await supabase
        .from('instagram_posts')
        .update(updateData)
        .eq('id', postId)
        .select()
        .single()

      if (error) {
        console.error('[Instagram Posts API] Error approving post:', error)
        throw error
      }

      console.log('[Instagram Posts API] Post approved successfully:', data.id)

      return NextResponse.json({
        success: true,
        post: data
      })
    }

    return NextResponse.json(
      { error: 'Action inválida. Use "save" ou "approve"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[Instagram Posts API] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
