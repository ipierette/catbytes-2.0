import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { publishInstagramPost } from '@/lib/instagram-automation'

/**
 * POST - Publica um post imediatamente no Instagram
 * Body: { postId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'postId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar post
    const posts = await instagramDB.getPendingPosts()
    const approvedPosts = await instagramDB.getApprovedPostsReadyToPublish()
    const post = [...posts, ...approvedPosts].find(p => p.id === postId)

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Publicar no Instagram
    console.log('[Instagram Publish Now] Publishing post:', postId)
    
    const result = await publishInstagramPost(post)

    if (!result.success) {
      throw new Error(result.error || 'Erro ao publicar no Instagram')
    }

    console.log('[Instagram Publish Now] ✅ Post published:', result.instagramId)

    return NextResponse.json({
      success: true,
      message: 'Post publicado com sucesso no Instagram!',
      instagramId: result.instagramId
    })
  } catch (error) {
    console.error('[Instagram Publish Now] Error:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao publicar no Instagram',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
