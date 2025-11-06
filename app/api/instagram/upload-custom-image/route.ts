/**
 * Instagram Upload Custom Image API
 * Faz upload de imagem customizada (renderizada do canvas) para o bucket
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/instagram/upload-custom-image
 * Recebe dataURL do canvas, converte para buffer e faz upload
 */
export async function POST(request: NextRequest) {
  try {
    const { dataUrl, postId } = await request.json()

    if (!dataUrl || !postId) {
      return NextResponse.json(
        { error: 'dataUrl and postId are required' },
        { status: 400 }
      )
    }

    console.log('[Upload Custom Image] Processing for post:', postId)

    // Converter dataURL para buffer
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    console.log('[Upload Custom Image] Buffer size:', buffer.length, 'bytes')

    // Verificar limite de 10MB
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { error: 'Image too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Nome único para o arquivo
    const timestamp = Date.now()
    const filename = `post-${postId}-${timestamp}.png`

    console.log('[Upload Custom Image] Uploading to bucket:', filename)

    // Upload para o bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('instagram-images')
      .upload(filename, buffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      console.error('[Upload Custom Image] Upload error:', uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log('[Upload Custom Image] Upload successful:', uploadData.path)

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from('instagram-images')
      .getPublicUrl(uploadData.path)

    const publicUrl = urlData.publicUrl

    console.log('[Upload Custom Image] Public URL:', publicUrl)

    // Atualizar o post com a nova URL
    const { error: updateError } = await supabase
      .from('instagram_posts')
      .update({ image_url: publicUrl })
      .eq('id', postId)

    if (updateError) {
      console.error('[Upload Custom Image] Update error:', updateError)
      // Tentar deletar a imagem do bucket se a atualização falhar
      await supabase.storage
        .from('instagram-images')
        .remove([uploadData.path])
      throw new Error(`Failed to update post: ${updateError.message}`)
    }

    console.log('[Upload Custom Image] Post updated successfully')

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: uploadData.path
    })

  } catch (error) {
    console.error('[Upload Custom Image] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}