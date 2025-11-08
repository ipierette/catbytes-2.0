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
      template,
      templateImages,
      image_prompt,
      content_image_prompts
    } = postData

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    console.log('[Save Custom] Processing custom blog post...')
    console.log('[Save Custom] Template:', template)
    console.log('[Save Custom] Template Images:', templateImages)

    // Gera slug único
    const slug = generateSlug(title)

    // Usa a imagem de capa do template
    const finalImageUrl = templateImages?.coverImage || cover_image_url || null

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: 'Imagem de capa é obrigatória' },
        { status: 400 }
      )
    }

    // Gera slug único
    const slug = generateSlug(title)

    // Usa a imagem de capa do template
    const finalImageUrl = templateImages?.coverImage || cover_image_url || null

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: 'Imagem de capa é obrigatória' },
        { status: 400 }
      )
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
      ai_model: 'gpt-4o-mini + template-editor',
      generation_prompt: `Template ${template || 'default'}: ${title}`,
      locale: 'pt-BR',
      image_prompt,
      content_image_prompts
    }

    const createdPost = await db.createPost(blogPostData)
    console.log('[Save Custom] Post saved:', createdPost.id)

    // Log da geração customizada
    if (supabaseAdmin) {
      await supabaseAdmin.from('blog_generation_log').insert({
        post_id: createdPost.id,
        status: 'success',
        generation_time_ms: 0, // Customização manual
        error_message: `Template ${template || 'default'} with ${Object.keys(templateImages || {}).length} images`
      })
    }

    return NextResponse.json({
      success: true,
      post: createdPost,
      template,
      templateImages
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