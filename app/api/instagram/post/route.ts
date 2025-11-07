/**
 * Instagram Post API Route
 * 
 * NOVO FLUXO:
 * 1. Cron gera conteúdo + imagem
 * 2. Salva como 'pending' no banco
 * 3. Admin aprova/rejeita via dashboard
 * 4. Posts aprovados são publicados automaticamente no horário agendado
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { generatePostContent, validatePostContent } from '@/lib/content-generator'
import { generateImage, optimizePromptWithText } from '@/lib/image-generator'
import { verifyAdminCookie } from '@/lib/api-security'

export const maxDuration = 60 // Vercel timeout: 60s

/**
 * POST: Gera novo post pendente de aprovação
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica se é cron job ou admin
    const authHeader = request.headers.get('authorization')
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isCronJob) {
      // Se não for cron, verifica se é admin
      const authCheck = await verifyAdminCookie(request)
      if (!authCheck.valid) {
        return authCheck.error!
      }
    }

    console.log('=== Generating Instagram Post for Approval ===')
    console.log('Triggered by:', isCronJob ? 'Cron Job' : 'Manual Admin')

    // Validações de ambiente
    const requiredEnvVars = ['OPENAI_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    const missingVars = requiredEnvVars.filter(v => !process.env[v])
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
    }

    // 1. Determina próximo nicho
    const nicho = await instagramDB.getNextNiche()
    console.log('Selected niche:', nicho)

    // 2. Gera conteúdo
    console.log('Generating content...')
    const content = await generatePostContent(nicho)
    
    // Valida conteúdo
    const validation = validatePostContent(content)
    if (!validation.valid) {
      throw new Error(`Invalid content: ${validation.errors.join(', ')}`)
    }

    console.log('Content generated:', {
      titulo: content.titulo,
      textoImagem: content.textoImagem,
      captionLength: content.caption.length
    })

    // 3. Gera imagem com DALL-E
    console.log('Generating image with DALL-E...')
    const imagePrompt = optimizePromptWithText(content.imagePrompt, content.textoImagem)
    const imageUrl = await generateImage(imagePrompt)
    
    console.log('Image generated:', imageUrl)

    // 4. Salva no banco como PENDING (aguardando aprovação)
    const dbRecord = await instagramDB.savePost({
      nicho,
      titulo: content.titulo,
      texto_imagem: content.textoImagem,
      caption: content.caption,
      image_url: imageUrl,
      status: 'pending' // Aguarda aprovação do admin
    })

    console.log('=== Post Generated Successfully - Awaiting Approval ===')

    return NextResponse.json({
      success: true,
      data: {
        id: dbRecord.id,
        nicho,
        titulo: content.titulo,
        imageUrl,
        status: 'pending',
        message: 'Post gerado e aguardando aprovação no dashboard'
      }
    })

  } catch (error) {
    console.error('=== Post Generation Failed ===')
    console.error('Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// GET para verificar status e próxima postagem
export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }

    const nextNiche = await instagramDB.getNextNiche()
    const lastPost = await instagramDB.getLastPost()
    const stats = await instagramDB.getStats()

    return NextResponse.json({
      success: true,
      data: {
        nextNiche,
        lastPost,
        stats,
        schedule: {
          days: ['Segunda', 'Quarta', 'Sexta', 'Domingo'],
          time: '10:00 BRT'
        }
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
