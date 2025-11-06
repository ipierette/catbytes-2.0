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
import { generateImage, optimizePromptWithText } from '@/lib/image-generator'
import { saveInstagramImageToStorage } from '@/lib/instagram-image-storage'
import type { Niche } from '@/lib/instagram-automation'

export const maxDuration = 60 // 1 minuto (limite do Vercel free tier)

/**
 * Função auxiliar para gerar posts em background
 */
async function generatePostsInBackground(batchSize: number) {
  const nichos: Niche[] = ['advogados', 'medicos', 'terapeutas', 'nutricionistas']
  const generated: any[] = []
  const errors: any[] = []

  for (let i = 0; i < batchSize; i++) {
    try {
      const nicho = nichos[i % nichos.length]
      console.log(`\n[${i + 1}/${batchSize}] Generating post for: ${nicho}`)

      const content = await generatePostContent(nicho)
      console.log(`  ✓ Content generated: ${content.titulo}`)

      const imagePrompt = optimizePromptWithText(content.imagePrompt, content.textoImagem)
      const tempImageUrl = await generateImage(imagePrompt)
      console.log(`  ✓ Image generated with DALL-E`)

      const dbRecord = await instagramDB.savePost({
        nicho,
        titulo: content.titulo,
        texto_imagem: content.textoImagem,
        caption: content.caption,
        image_url: tempImageUrl,
        status: 'pending'
      })

      if (dbRecord.id) {
        const permanentImageUrl = await saveInstagramImageToStorage(tempImageUrl, dbRecord.id)
        if (permanentImageUrl) {
          await instagramDB.updatePost(dbRecord.id, { image_url: permanentImageUrl })
          console.log(`  ✓ Image saved to permanent storage`)
        }
      }

      generated.push({
        id: dbRecord.id,
        nicho,
        titulo: content.titulo
      })

      console.log(`  ✓ Saved as pending (ID: ${dbRecord.id})`)

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

  await instagramSettings.updateLastGenerationDate()

  console.log(`\n=== Batch Generation Complete ===`)
  console.log(`Generated: ${generated.length}/${batchSize}`)
  console.log(`Errors: ${errors.length}`)

  return { generated, errors }
}

/**
 * POST: Gera múltiplos posts pendentes
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação (cron ou admin)
    const authHeader = request.headers.get('authorization')
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    const adminApiKey = request.headers.get('x-admin-key')
    const isAdmin = adminApiKey === process.env.ADMIN_API_KEY
    
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

    if (pendingPosts.length >= 20) {
      console.log('Too many pending posts - skipping generation')
      return NextResponse.json({
        success: true,
        message: 'Too many pending posts, skipping generation',
        pending: pendingPosts.length
      })
    }

    const batchSize = 10

    // Se for chamada manual (admin), gera em background e retorna imediatamente
    if (isAdmin && !isCronJob) {
      // Inicia geração em background (não aguarda)
      generatePostsInBackground(batchSize).catch(error => {
        console.error('Background generation error:', error)
      })

      // Retorna imediatamente para evitar timeout
      return NextResponse.json({
        success: true,
        message: 'Geração iniciada em background. Os posts aparecerão em alguns minutos.',
        postsGenerated: batchSize,
        status: 'processing'
      })
    }

    // Se for cron job, executa normalmente (servidor aguarda)
    const { generated, errors } = await generatePostsInBackground(batchSize)

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
