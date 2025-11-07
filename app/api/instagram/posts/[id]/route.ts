/**
 * Instagram Update Post API
 * Atualiza conteúdo de posts pendentes
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { verifyAdminCookie } from '@/lib/api-security'

/**
 * PATCH /api/instagram/posts/[id]
 * Atualiza um post existente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }
    
    const { id } = await params

    const body = await request.json()
    const { titulo, texto_imagem, caption, image_url } = body

    if (!titulo && !texto_imagem && !caption && !image_url) {
      return NextResponse.json(
        { success: false, error: 'At least one field is required' },
        { status: 400 }
      )
    }

    console.log(`Updating post: ${id}`)

    // Atualiza apenas os campos fornecidos
    const updates: any = {}
    if (titulo) updates.titulo = titulo
    if (texto_imagem) updates.texto_imagem = texto_imagem
    if (caption) updates.caption = caption
    if (image_url) updates.image_url = image_url

    const post = await instagramDB.updatePost(id, updates)

    return NextResponse.json({
      success: true,
      post,
      message: 'Post atualizado com sucesso'
    })

  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}