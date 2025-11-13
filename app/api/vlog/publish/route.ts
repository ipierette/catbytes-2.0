import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getLinkedInSettings } from '@/lib/linkedin-settings'

/**
 * API para publicar vídeo em múltiplas plataformas
 * POST /api/vlog/publish
 * 
 * Body: {
 *   vlogId: string
 *   platforms: ('instagram_feed' | 'instagram_reels' | 'linkedin')[]
 *   description: string
 * }
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { vlogId, platforms, description } = await request.json()

    if (!vlogId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'vlogId e platforms são obrigatórios' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      )
    }

    // Buscar vlog no banco
    const { data: vlog, error: vlogError } = await supabase
      .from('vlogs')
      .select('*')
      .eq('id', vlogId)
      .single()

    if (vlogError || !vlog) {
      return NextResponse.json(
        { error: 'Vlog não encontrado' },
        { status: 404 }
      )
    }

    console.log('[Vlog Publish] Publicando vlog:', vlogId, 'em:', platforms)

    const results: any = {
      success: true,
      published: [],
      failed: []
    }

    // Publicar em cada plataforma
    for (const platform of platforms) {
      try {
        switch (platform) {
          case 'instagram_feed':
            await publishInstagramFeed(vlog.video_url, description)
            results.published.push('Instagram Feed')
            break

          case 'instagram_reels':
            await publishInstagramReels(vlog.video_url, description)
            results.published.push('Instagram Reels')
            break

          case 'linkedin':
            await publishLinkedIn(vlog.video_url, description)
            results.published.push('LinkedIn')
            break

          default:
            console.warn('[Vlog Publish] Plataforma desconhecida:', platform)
        }
      } catch (error) {
        console.error(`[Vlog Publish] Erro ao publicar em ${platform}:`, error)
        results.failed.push(platform)
      }
    }

    // Atualizar status do vlog
    const publishedTo = [...(vlog.published_to || []), ...platforms]
    const status = platforms.includes('instagram_feed') && 
                   platforms.includes('instagram_reels') && 
                   platforms.includes('linkedin') 
                   ? 'published_all' 
                   : 'published_partial'

    await supabase
      .from('vlogs')
      .update({
        status,
        published_to: publishedTo
      })
      .eq('id', vlogId)

    if (results.failed.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Publicado em: ${results.published.join(', ')}. Falhou: ${results.failed.join(', ')}`,
        results
      })
    }

    return NextResponse.json({
      success: true,
      message: `✅ Vídeo publicado com sucesso em: ${results.published.join(', ')}`,
      results
    })

  } catch (error) {
    console.error('[Vlog Publish] Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao publicar vídeo',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

/**
 * Publica vídeo no Instagram Feed
 */
async function publishInstagramFeed(videoUrl: string, caption: string) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID

  if (!accessToken || !accountId) {
    throw new Error('Credenciais do Instagram não configuradas')
  }

  // 1. Criar container do vídeo
  const createResponse = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'VIDEO',
        video_url: videoUrl,
        caption: caption,
        access_token: accessToken
      })
    }
  )

  if (!createResponse.ok) {
    const error = await createResponse.json()
    throw new Error(`Instagram Feed - Erro ao criar container: ${JSON.stringify(error)}`)
  }

  const createData = await createResponse.json()
  const containerId = createData.id

  // 2. Aguardar processamento (polling)
  await waitForContainerReady(containerId, accessToken)

  // 3. Publicar
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken
      })
    }
  )

  if (!publishResponse.ok) {
    const error = await publishResponse.json()
    throw new Error(`Instagram Feed - Erro ao publicar: ${JSON.stringify(error)}`)
  }

  console.log('[Instagram Feed] ✅ Vídeo publicado')
}

/**
 * Publica vídeo no Instagram Reels
 */
async function publishInstagramReels(videoUrl: string, caption: string) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID

  if (!accessToken || !accountId) {
    throw new Error('Credenciais do Instagram não configuradas')
  }

  // 1. Criar container do Reels
  const createResponse = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption,
        share_to_feed: true, // Compartilhar também no feed
        access_token: accessToken
      })
    }
  )

  if (!createResponse.ok) {
    const error = await createResponse.json()
    throw new Error(`Instagram Reels - Erro ao criar container: ${JSON.stringify(error)}`)
  }

  const createData = await createResponse.json()
  const containerId = createData.id

  // 2. Aguardar processamento
  await waitForContainerReady(containerId, accessToken)

  // 3. Publicar
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken
      })
    }
  )

  if (!publishResponse.ok) {
    const error = await publishResponse.json()
    throw new Error(`Instagram Reels - Erro ao publicar: ${JSON.stringify(error)}`)
  }

  console.log('[Instagram Reels] ✅ Vídeo publicado')
}

/**
 * Publica vídeo no LinkedIn
 */
async function publishLinkedIn(videoUrl: string, text: string) {
  const settings = await getLinkedInSettings()
  
  if (!settings || !settings.access_token) {
    throw new Error('Token do LinkedIn não configurado')
  }

  if (!settings.person_urn) {
    throw new Error('Person URN do LinkedIn não configurado')
  }

  // LinkedIn não suporta vídeos por URL externa de forma simples
  // A API requer upload direto do vídeo em partes
  // Por ora, vamos criar um post de texto com link para o vídeo

  const postData = {
    author: settings.person_urn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: `${text}\n\n🎥 Assista ao vídeo: ${videoUrl}`
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202405'
    },
    body: JSON.stringify(postData)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`LinkedIn - Erro ao publicar: ${JSON.stringify(error)}`)
  }

  console.log('[LinkedIn] ✅ Post com vídeo publicado')
}

/**
 * Aguarda o container do Instagram estar pronto (polling)
 */
async function waitForContainerReady(
  containerId: string, 
  accessToken: string,
  maxAttempts = 30,
  intervalMs = 2000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const statusResponse = await fetch(
      `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`
    )

    if (statusResponse.ok) {
      const statusData = await statusResponse.json()
      
      if (statusData.status_code === 'FINISHED') {
        console.log('[Instagram] Container pronto!')
        return
      }
      
      if (statusData.status_code === 'ERROR') {
        throw new Error('Instagram - Erro ao processar vídeo')
      }
    }

    // Aguardar antes da próxima tentativa
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('Instagram - Timeout ao aguardar processamento do vídeo')
}
