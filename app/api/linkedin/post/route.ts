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
    
    console.log('[LinkedIn Post] Settings:', {
      hasToken: !!settings?.access_token,
      tokenPrefix: settings?.access_token?.substring(0, 10) + '...',
      personUrn: settings?.person_urn,
      organizationUrn: settings?.organization_urn,
      expiresAt: settings?.token_expires_at
    })
    
    if (!settings || !settings.access_token || settings.access_token === 'PENDING_OAUTH') {
      return NextResponse.json(
        { error: 'Token do LinkedIn não configurado. Execute o fluxo OAuth primeiro.' },
        { status: 401 }
      )
    }

    // Verificar se o token expirou
    if (settings.token_expires_at && new Date(settings.token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token do LinkedIn expirado. Por favor, renove o token.' },
        { status: 401 }
      )
    }

    // Determinar o author (quem está postando)
    let authorUrn: string
    
    if (asOrganization && settings.organization_urn) {
      // Garantir formato correto: urn:li:organization:ID
      authorUrn = settings.organization_urn.startsWith('urn:li:') 
        ? settings.organization_urn 
        : `urn:li:organization:${settings.organization_urn}`
    } else if (settings.person_urn) {
      // Garantir formato correto: urn:li:person:ID
      authorUrn = settings.person_urn.startsWith('urn:li:') 
        ? settings.person_urn 
        : `urn:li:person:${settings.person_urn}`
    } else {
      return NextResponse.json(
        { error: 'Person URN não configurado. Execute scripts/get-linkedin-urns.js' },
        { status: 400 }
      )
    }

    console.log('[LinkedIn Post] Criando post como:', authorUrn)
    console.log('[LinkedIn Post] Criando post como:', authorUrn)
    console.log('[LinkedIn Post] Tipo:', asOrganization ? 'Organization' : 'Person')

    // Montar payload do post seguindo exatamente a documentação do LinkedIn
    const postData: any = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    console.log('[LinkedIn Post] Payload inicial:', JSON.stringify(postData, null, 2))

    // Se houver imagem, fazer upload primeiro
    if (imageUrl) {
      try {
        console.log('[LinkedIn Post] Iniciando upload de imagem:', imageUrl)
        const uploadedImageUrn = await uploadImageToLinkedIn(imageUrl, settings.access_token, authorUrn)
        
        if (uploadedImageUrn) {
          console.log('[LinkedIn Post] Imagem enviada com sucesso:', uploadedImageUrn)
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE'
          postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
            {
              status: 'READY',
              media: uploadedImageUrn
            }
          ]
        } else {
          console.warn('[LinkedIn Post] ⚠️ Falha no upload da imagem, postando apenas texto')
        }
      } catch (error) {
        console.error('[LinkedIn Post] ❌ Erro ao fazer upload da imagem:', error)
        // Continua e posta só o texto
      }
    }

    console.log('[LinkedIn Post] Payload final:', JSON.stringify(postData, null, 2))

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
      console.error('[LinkedIn Post] ❌ Erro na API do LinkedIn:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        postData: JSON.stringify(postData, null, 2)
      })
      
      // Mensagens de erro mais específicas
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Token do LinkedIn inválido ou expirado. Por favor, renove o token nas configurações.',
            details: responseData 
          },
          { status: 401 }
        )
      }

      if (response.status === 422) {
        return NextResponse.json(
          { 
            error: 'Erro de validação no LinkedIn. Verifique se o URN está correto e se você tem permissão para postar.',
            details: responseData,
            authorUrn: authorUrn,
            asOrganization: asOrganization
          },
          { status: 422 }
        )
      }
      
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
      body: new Uint8Array(imageBuffer)
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
