import { NextRequest, NextResponse } from 'next/server'
import { linkedInDB, uploadLinkedInImage } from '@/lib/linkedin-db'

/**
 * GET - Lista posts LinkedIn
 * Query params: ?status=pending|approved|published|scheduled
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let posts

    if (status === 'pending') {
      posts = await linkedInDB.getPendingPosts()
    } else if (status === 'scheduled') {
      posts = await linkedInDB.getScheduledPosts()
    } else if (status === 'published') {
      posts = await linkedInDB.getPublishedPosts()
    } else {
      // Retorna todos
      const [pending, scheduled, published] = await Promise.all([
        linkedInDB.getPendingPosts(),
        linkedInDB.getScheduledPosts(),
        linkedInDB.getPublishedPosts()
      ])
      posts = [...pending, ...scheduled, ...published]
    }

    return NextResponse.json({
      success: true,
      posts
    })
  } catch (error) {
    console.error('[LinkedIn Posts API] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar posts' },
      { status: 500 }
    )
  }
}

/**
 * POST - Cria ou aprova um post LinkedIn
 * Body: {
 *   action: 'save' | 'approve' | 'publish'
 *   text: string
 *   image_url?: string (URL do DALL-E)
 *   post_type: string
 *   article_slug?: string
 *   as_organization: boolean
 *   scheduled_for?: string (ISO date)
 *   post_id?: string (para approve/publish)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'save') {
      // Salvar novo post como rascunho/pendente
      let imageStorageData = null
      
      // Se tiver imagem DALL-E, fazer upload para Supabase Storage
      if (data.image_url) {
        const tempId = `temp-${Date.now()}`
        imageStorageData = await uploadLinkedInImage(data.image_url, tempId)
      }

      const post = await linkedInDB.savePost({
        text: data.text,
        image_url: imageStorageData?.publicUrl || data.image_url || null,
        image_storage_path: imageStorageData?.storagePath || null,
        status: 'pending',
        scheduled_for: null,
        published_at: null,
        approved_at: null,
        approved_by: null,
        linkedin_post_id: null,
        post_type: data.post_type || 'custom',
        article_slug: data.article_slug || null,
        as_organization: data.as_organization || false,
        error_message: null
      })

      return NextResponse.json({
        success: true,
        post,
        message: 'Post salvo! Acesse a fila para agendar ou publicar.'
      })
    }

    if (action === 'approve') {
      // Aprovar e agendar post
      if (!data.post_id || !data.scheduled_for) {
        return NextResponse.json(
          { error: 'post_id e scheduled_for são obrigatórios' },
          { status: 400 }
        )
      }

      const post = await linkedInDB.approvePost(
        data.post_id,
        new Date(data.scheduled_for),
        'admin' // Pode pegar do session
      )

      return NextResponse.json({
        success: true,
        post,
        message: 'Post agendado com sucesso!'
      })
    }

    if (action === 'publish') {
      // Publicar imediatamente
      if (!data.post_id) {
        return NextResponse.json(
          { error: 'post_id é obrigatório' },
          { status: 400 }
        )
      }

      const post = await linkedInDB.getPostById(data.post_id)
      
      if (!post) {
        return NextResponse.json(
          { error: 'Post não encontrado' },
          { status: 404 }
        )
      }

      // Chamar API de publicação do LinkedIn
      const publishResponse = await fetch(`${request.nextUrl.origin}/api/linkedin/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: post.text,
          imageUrl: post.image_url,
          asOrganization: post.as_organization
        })
      })

      if (!publishResponse.ok) {
        const error = await publishResponse.json()
        await linkedInDB.markAsFailed(post.id, error.error || 'Erro ao publicar')
        
        return NextResponse.json(
          { error: error.error || 'Erro ao publicar no LinkedIn' },
          { status: 500 }
        )
      }

      const publishData = await publishResponse.json()
      
      await linkedInDB.markAsPublished(post.id, publishData.postId)

      return NextResponse.json({
        success: true,
        message: 'Post publicado com sucesso no LinkedIn!',
        linkedInPostId: publishData.postId
      })
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[LinkedIn Posts API] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Deleta um post
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')

    if (!postId) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    await linkedInDB.deletePost(postId)

    return NextResponse.json({
      success: true,
      message: 'Post deletado com sucesso'
    })
  } catch (error) {
    console.error('[LinkedIn Posts API] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar post' },
      { status: 500 }
    )
  }
}
