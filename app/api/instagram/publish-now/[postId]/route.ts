import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params

    // Verificar se o post existe e está em status válido
    const { data: post, error: fetchError } = await supabase
      .from('instagram_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({
        success: false,
        error: 'Post não encontrado'
      }, { status: 404 })
    }

    // Verificar se já foi publicado
    if (post.status === 'published' && post.instagram_post_id) {
      return NextResponse.json({
        success: false,
        error: 'Post já foi publicado anteriormente',
        instagramUrl: `https://www.instagram.com/p/${post.instagram_post_id}/`
      }, { status: 400 })
    }

    // Publicar no Instagram via API
    const instagramResult = await publishToInstagram(post)

    if (!instagramResult.success) {
      // Marcar como failed
      await supabase
        .from('instagram_posts')
        .update({
          status: 'failed',
          error_message: instagramResult.error,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)

      return NextResponse.json({
        success: false,
        error: instagramResult.error || 'Erro ao publicar no Instagram'
      }, { status: 500 })
    }

    // Atualizar post como publicado
    const { data: updatedPost, error: updateError } = await supabase
      .from('instagram_posts')
      .update({
        status: 'published',
        instagram_post_id: instagramResult.instagramPostId,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating post after publish:', updateError)
    }

    const instagramUrl = `https://www.instagram.com/p/${instagramResult.instagramPostId}/`

    return NextResponse.json({
      success: true,
      post: updatedPost,
      instagramPostId: instagramResult.instagramPostId,
      instagramUrl,
      message: '✅ Post publicado com sucesso no Instagram!'
    })
  } catch (error) {
    console.error('Error in publish-now endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Função para publicar no Instagram usando a Graph API
async function publishToInstagram(post: any): Promise<{
  success: boolean
  instagramPostId?: string
  error?: string
}> {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID

    if (!accessToken || !instagramAccountId) {
      return {
        success: false,
        error: 'Instagram API não configurada. Configure INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_ACCOUNT_ID.'
      }
    }

    // Passo 1: Criar container de mídia
    const createContainerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: post.image_url,
          caption: post.caption,
          access_token: accessToken
        })
      }
    )

    const containerData = await createContainerResponse.json()

    if (!createContainerResponse.ok || containerData.error) {
      console.error('Instagram API error (create container):', containerData)
      return {
        success: false,
        error: containerData.error?.message || 'Erro ao criar container de mídia'
      }
    }

    const creationId = containerData.id

    // Passo 2: Publicar o container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken
        })
      }
    )

    const publishData = await publishResponse.json()

    if (!publishResponse.ok || publishData.error) {
      console.error('Instagram API error (publish):', publishData)
      return {
        success: false,
        error: publishData.error?.message || 'Erro ao publicar mídia'
      }
    }

    return {
      success: true,
      instagramPostId: publishData.id
    }
  } catch (error) {
    console.error('Error publishing to Instagram:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao publicar'
    }
  }
}
