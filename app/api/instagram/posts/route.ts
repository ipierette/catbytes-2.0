import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { verifyAdmin } from '@/lib/api-security'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request)

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
