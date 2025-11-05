import { NextRequest, NextResponse } from 'next/server'
import { db, generateSlug, supabaseAdmin, uploadImageFromUrl } from '@/lib/supabase'
import { generateImageWithTextOverlay } from '@/lib/image-generator'
import { addTextOverlay } from '@/lib/image-text-overlay'
import type { BlogPostInsert } from '@/types/blog'

/**
 * POST /api/blog/save-custom
 * Salva artigo personalizado com texto customizado na imagem
 */
export async function POST(request: NextRequest) {
  try {
    const postData = await request.json()
    
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      cover_image_url,
      imageText,
      imageSettings
    } = postData

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    console.log('[Save Custom] Processing custom blog post...')

    // Gera slug único
    const slug = generateSlug(title)

    // Se tem texto personalizado para imagem, gera nova imagem
    let finalImageUrl = cover_image_url
    
    if (imageText && imageSettings && cover_image_url) {
      try {
        console.log('[Save Custom] Generating custom image with text overlay...')
        
        // Configura fonte baseado nas opções
        let fontFamily = imageSettings.fontFamily
        if (imageSettings.isBold && imageSettings.isItalic) {
          fontFamily = `bold italic ${imageSettings.fontSize}px ${imageSettings.fontFamily}`
        } else if (imageSettings.isBold) {
          fontFamily = `bold ${imageSettings.fontSize}px ${imageSettings.fontFamily}`
        } else if (imageSettings.isItalic) {
          fontFamily = `italic ${imageSettings.fontSize}px ${imageSettings.fontFamily}`
        } else {
          fontFamily = `${imageSettings.fontSize}px ${imageSettings.fontFamily}`
        }

        const customImageDataUrl = await addTextOverlay({
          text: imageText,
          imageUrl: cover_image_url,
          fontSize: imageSettings.fontSize,
          fontFamily: fontFamily,
          textColor: imageSettings.color,
          strokeColor: imageSettings.strokeColor,
          strokeWidth: imageSettings.strokeWidth,
          backgroundColor: imageSettings.backgroundColor,
          position: imageSettings.position,
          maxWidth: 700
        })

        // Converte data URL para buffer e faz upload
        if (supabaseAdmin) {
          const base64Data = customImageDataUrl.replace(/^data:image\/\w+;base64,/, '')
          const imageBuffer = Buffer.from(base64Data, 'base64')
          
          const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('blog-images')
            .upload(`custom/${slug}-${Date.now()}.png`, imageBuffer, {
              contentType: 'image/png',
              upsert: true
            })

          if (uploadError) {
            console.error('[Save Custom] Upload error:', uploadError)
            // Continua com imagem original se upload falhar
          } else {
            // Gera URL pública da imagem customizada
            const { data: { publicUrl } } = supabaseAdmin.storage
              .from('blog-images')
              .getPublicUrl(uploadData.path)
            
            finalImageUrl = publicUrl
            console.log('[Save Custom] Custom image uploaded:', publicUrl)
          }
        }
      } catch (imageError) {
        console.error('[Save Custom] Error generating custom image:', imageError)
        // Continua com imagem original se geração falhar
      }
    }

    // Cria post no banco de dados
    const blogPostData: BlogPostInsert = {
      title,
      slug,
      excerpt,
      content,
      cover_image_url: finalImageUrl,
      keywords: tags || [],
      seo_title: title,
      seo_description: excerpt,
      published: true,
      category: category || 'Geral',
      tags: tags || [],
      author: 'CatBytes Editor',
      ai_model: 'gpt-4o-mini + custom-editor',
      generation_prompt: `Custom edited: ${title}`,
      locale: 'pt-BR'
    }

    const createdPost = await db.createPost(blogPostData)
    console.log('[Save Custom] Post saved:', createdPost.id)

    // Log da geração customizada
    if (supabaseAdmin) {
      await supabaseAdmin.from('blog_generation_log').insert({
        post_id: createdPost.id,
        status: 'success',
        generation_time_ms: 0, // Customização manual
        error_message: `Custom edited with image text: "${imageText || 'none'}"`
      })
    }

    return NextResponse.json({
      success: true,
      post: createdPost,
      customizations: {
        imageText: imageText || null,
        imageSettings: imageSettings || null,
        finalImageUrl
      }
    })

  } catch (error) {
    console.error('[Save Custom] Error:', error)
    
    // Log do erro
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('blog_generation_log').insert({
          post_id: null,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          generation_time_ms: 0
        })
      } catch (dbError) {
        console.error('[Save Custom] Failed to log error:', dbError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save custom post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}