import { supabaseAdmin } from './supabase'

/**
 * Salva imagem do Instagram no bucket do Supabase
 * Converte URL temporária da OpenAI para storage permanente
 */
export async function saveInstagramImageToStorage(
  imageUrl: string,
  postId: string
): Promise<string | null> {
  try {
    if (!supabaseAdmin) {
      console.error('[Instagram Storage] Supabase admin not configured')
      return null
    }

    // Verifica se o bucket existe, se não existir cria
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === 'instagram-images')
    
    if (!bucketExists) {
      console.log('[Instagram Storage] Creating instagram-images bucket...')
      const { error: createError } = await supabaseAdmin.storage.createBucket('instagram-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error('[Instagram Storage] Error creating bucket:', createError)
        return null
      }
    }

    // Baixa a imagem da URL temporária
    console.log('[Instagram Storage] Downloading image from:', imageUrl)
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      console.error('[Instagram Storage] Failed to fetch image:', response.status, response.statusText)
      return null
    }

    const imageBuffer = await response.arrayBuffer()
    const fileName = `${postId}-${Date.now()}.png`

    // Faz upload para o bucket
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('instagram-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('[Instagram Storage] Upload error:', uploadError)
      return null
    }

    // Gera URL pública permanente
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('instagram-images')
      .getPublicUrl(uploadData.path)

    console.log('[Instagram Storage] Image saved successfully:', publicUrl)
    return publicUrl

  } catch (error) {
    console.error('[Instagram Storage] Error saving image:', error)
    return null
  }
}

/**
 * Remove imagem do bucket quando post é rejeitado
 */
export async function deleteInstagramImageFromStorage(imageUrl: string): Promise<boolean> {
  try {
    if (!supabaseAdmin || !imageUrl.includes('instagram-images')) {
      return false // Não é uma imagem do nosso bucket
    }

    // Extrai o path da URL
    const urlParts = imageUrl.split('/instagram-images/')
    if (urlParts.length < 2) return false

    const filePath = urlParts[1]

    const { error } = await supabaseAdmin.storage
      .from('instagram-images')
      .remove([filePath])

    if (error) {
      console.error('[Instagram Storage] Error deleting image:', error)
      return false
    }

    console.log('[Instagram Storage] Image deleted successfully:', filePath)
    return true

  } catch (error) {
    console.error('[Instagram Storage] Error deleting image:', error)
    return false
  }
}