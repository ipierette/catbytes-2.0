/**
 * Instagram Generate Batch API
 * 
 * Gera múltiplos posts pendentes de aprovação
 * Executado automaticamente: Sábado, Terça e Quinta
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'
import { instagramSettings } from '@/lib/instagram-settings'
import { generatePostContent } from '@/lib/content-generator'
import { generateImage, generateImageWithTextOverlay, optimizePromptWithText } from '@/lib/image-generator'
import type { Niche } from '@/lib/instagram-automation'

export const maxDuration = 300 // 5 minutos para gerar 10 posts

/**
 * POST: Gera múltiplos posts pendentes
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação (cron ou admin)
    const authHeader = request.headers.get('authorization')
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    // Também verifica se é um admin logado via cookie/session
    const adminApiKey = request.headers.get('x-admin-key')
    const isAdmin = adminApiKey === process.env.ADMIN_API_KEY
    
    // Permite acesso via cron OU via admin
    if (!isCronJob && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('=== Batch Post Generation Started ===')

    // Verifica se a geração automática está habilitada
    const isEnabled = await instagramSettings.isAutoGenerationEnabled()
    if (!isEnabled) {
      console.log('Auto generation is DISABLED - skipping')
      return NextResponse.json({
        success: true,
        message: 'Auto generation is disabled',
        generated: 0
      })
    }

    // Busca quantos posts já estão pendentes
    const pendingPosts = await instagramDB.getPendingPosts()
    console.log(`Current pending posts: ${pendingPosts.length}`)

    // Se já tem muitos pendentes, não gera mais
    if (pendingPosts.length >= 20) {
      console.log('Too many pending posts - skipping generation')
      return NextResponse.json({
        success: true,
        message: 'Too many pending posts, skipping generation',
        pending: pendingPosts.length
      })
    }

    // Gera 10 posts (distribuídos entre os nichos)
    const batchSize = 10
    const nichos: Niche[] = ['advogados', 'medicos', 'terapeutas', 'nutricionistas']
    const generated: any[] = []
    const errors: any[] = []

    for (let i = 0; i < batchSize; i++) {
      try {
        // Rotaciona entre os nichos
        const nicho = nichos[i % nichos.length]
        
        console.log(`\n[${i + 1}/${batchSize}] Generating post for: ${nicho}`)

        // Gera conteúdo
        const content = await generatePostContent(nicho)
        console.log(`  ✓ Content generated: ${content.titulo}`)

        // Gera imagem com texto sobreposto (novo sistema)
        const imageUrl = await generateImageWithTextOverlay(
          content.imagePrompt, 
          content.textoImagem,
          nicho as any // Mapeia nicho para tema do overlay
        )
        console.log(`  ✓ Image with text overlay generated`)

        // Salva como pending
        const dbRecord = await instagramDB.savePost({
          nicho,
          titulo: content.titulo,
          texto_imagem: content.textoImagem,
          caption: content.caption,
          image_url: imageUrl,
          status: 'pending'
        })

        generated.push({
          id: dbRecord.id,
          nicho,
          titulo: content.titulo
        })

        console.log(`  ✓ Saved as pending (ID: ${dbRecord.id})`)

        // Aguarda 2s entre gerações para não sobrecarregar APIs
        if (i < batchSize - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

      } catch (error) {
        console.error(`  ✗ Error generating post ${i + 1}:`, error)
        errors.push({
          index: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Atualiza última data de geração
    await instagramSettings.updateLastGenerationDate()

    console.log(`\n=== Batch Generation Complete ===`)
    console.log(`Generated: ${generated.length}/${batchSize}`)
    console.log(`Errors: ${errors.length}`)

    return NextResponse.json({
      success: true,
      generated: generated.length,
      total: batchSize,
      errors: errors.length,
      posts: generated,
      errorDetails: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('=== Batch Generation Failed ===')
    console.error('Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
