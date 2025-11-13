import { NextRequest, NextResponse } from 'next/server'
import { getLinkedInSettings } from '@/lib/linkedin-settings'

/**
 * API para criar posts no LinkedIn (texto + imagem opcional)
 * POST /api/linkedin/post
 * 
 * Body: {
 *   text: string
 *   imageUrl?: string (URL pública da imagem)
 *   asOrganization?: boolean (postar como página ou perfil)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { text, imageUrl, asOrganization } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Texto do post é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar credenciais do banco
    const settings = await getLinkedInSettings()
    
    if (!settings || !settings.access_token || settings.access_token === 'PENDING_OAUTH') {
      return NextResponse.json(
        { error: 'Token do LinkedIn não configurado. Execute o fluxo OAuth primeiro.' },
        { status: 401 }
      )
    }

    // Determinar o author (quem está postando)
    let authorUrn: string
    
    if (asOrganization && settings.organization_urn) {
      authorUrn = settings.organization_urn
    } else if (settings.person_urn) {
      authorUrn = settings.person_urn
    } else {
      return NextResponse.json(
        { error: 'Person URN não configurado. Execute scripts/get-linkedin-urns.js' },
        { status: 400 }
      )
    }

    console.log('[LinkedIn Post] Criando post como:', authorUrn)

    // Montar payload do post
    const postData: any = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    // Se houver imagem, fazer upload primeiro
    if (imageUrl) {
      try {
        const uploadedImageUrn = await uploadImageToLinkedIn(imageUrl, settings.access_token, authorUrn)
        
        if (uploadedImageUrn) {
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
            {
              status: 'READY',
              media: uploadedImageUrn
            }
          ]
        } else {
          console.warn('[LinkedIn Post] Falha no upload da imagem, postando apenas texto')
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'NONE'
        }
      } catch (error) {
        console.error('[LinkedIn Post] Erro ao fazer upload da imagem:', error)
        // Continua e posta só o texto
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'NONE'
      }
    }

    // Criar o post
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

    const responseData = await response.json()

    if (!response.ok) {
      console.error('[LinkedIn Post] Erro na API:', responseData)
      return NextResponse.json(
        { 
          error: 'Erro ao criar post no LinkedIn',
          details: responseData 
        },
        { status: response.status }
      )
    }

    console.log('[LinkedIn Post] ✅ Post criado com sucesso:', responseData.id)

    return NextResponse.json({
      success: true,
      postId: responseData.id,
      message: 'Post publicado com sucesso no LinkedIn!'
    })

  } catch (error) {
    console.error('[LinkedIn Post] Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao criar post',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

/**
 * Faz upload de uma imagem para o LinkedIn
 */
async function uploadImageToLinkedIn(
  imageUrl: string, 
  accessToken: string, 
  authorUrn: string
): Promise<string | null> {
  try {
    // 1. Registrar upload
    const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202405'
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      })
    })

    if (!registerResponse.ok) {
      console.error('[LinkedIn Upload] Erro ao registrar upload:', await registerResponse.text())
      return null
    }

    const registerData = await registerResponse.json()
    const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
    const asset = registerData.value.asset

    // 2. Baixar a imagem
    let imageBuffer: Buffer
    
    if (imageUrl.startsWith('http')) {
      // URL externa
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) throw new Error('Falha ao baixar imagem')
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    } else {
      // URL local (public/)
      const fs = await import('fs/promises')
      const path = await import('path')
      const imagePath = path.join(process.cwd(), 'public', imageUrl)
      imageBuffer = await fs.readFile(imagePath)
    }

    // 3. Fazer upload da imagem
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: imageBuffer
    })

    if (!uploadResponse.ok) {
      console.error('[LinkedIn Upload] Erro ao fazer upload:', await uploadResponse.text())
      return null
    }

    console.log('[LinkedIn Upload] ✅ Imagem enviada:', asset)
    return asset

  } catch (error) {
    console.error('[LinkedIn Upload] Erro:', error)
    return null
  }
}
