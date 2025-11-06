/**
 * Instagram Image Storage - Upload de imagens para Supabase Storage
 * Resolve o problema de URLs temporárias do DALL-E
 */

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const instagramStorage = {
  /**
   * Upload de imagem do Instagram para storage permanente
   */
  async uploadImageFromUrl(imageUrl: string, postId: string): Promise<string> {
    try {
      console.log('📸 Uploading Instagram image to permanent storage...')

      // 1. Baixa a imagem da URL temporária
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }

      const imageBuffer = await response.arrayBuffer()
      const fileName = `instagram-${postId}-${Date.now()}.png`

      // 2. Upload para bucket do Supabase
      const { data, error } = await supabaseAdmin.storage
        .from('instagram-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: false
        })

      if (error) {
        throw error
      }

      // 3. Gera URL pública permanente
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('instagram-images')
        .getPublicUrl(data.path)

      console.log('✅ Instagram image uploaded:', publicUrl)
      return publicUrl

    } catch (error) {
      console.error('❌ Error uploading Instagram image:', error)
      throw error
    }
  },

  /**
   * Cria o bucket se não existir
   */
  async createBucketIfNeeded(): Promise<void> {
    try {
      // Verifica se bucket existe
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

      if (listError) {
        throw listError
      }

      const bucketExists = buckets?.some(bucket => bucket.name === 'instagram-images')

      if (!bucketExists) {
        console.log('📁 Creating instagram-images bucket...')
        
        const { error: createError } = await supabaseAdmin.storage.createBucket('instagram-images', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
          fileSizeLimit: 10485760 // 10MB
        })

        if (createError) {
          throw createError
        }

        console.log('✅ Instagram images bucket created successfully')
      } else {
        console.log('✅ Instagram images bucket already exists')
      }
    } catch (error) {
      console.error('❌ Error managing Instagram images bucket:', error)
      throw error
    }
  },

  /**
   * Remove imagem do storage
   */
  async removeImage(imagePath: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage
        .from('instagram-images')
        .remove([imagePath])

      if (error) {
        throw error
      }

      console.log('🗑️ Instagram image removed:', imagePath)
    } catch (error) {
      console.error('❌ Error removing Instagram image:', error)
      throw error
    }
  }
}