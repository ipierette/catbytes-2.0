import { createClient } from '@supabase/supabase-js'

// Supabase Admin Client (server-side only)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface LinkedInPost {
  id: string
  text: string
  image_url: string | null
  image_storage_path: string | null // Caminho no Supabase Storage
  status: 'draft' | 'pending' | 'approved' | 'published' | 'failed'
  scheduled_for: string | null
  published_at: string | null
  approved_at: string | null
  approved_by: string | null
  linkedin_post_id: string | null // ID do post no LinkedIn após publicação
  post_type: 'fullstack-random' | 'blog-article' | 'custom'
  article_slug: string | null // Se for divulgação de artigo
  as_organization: boolean
  error_message: string | null
  created_at: string
  updated_at: string
}

export const linkedInDB = {
  /**
   * Salva uma nova postagem no banco (status: draft por padrão)
   */
  async savePost(post: Omit<LinkedInPost, 'id' | 'created_at' | 'updated_at'>): Promise<LinkedInPost> {
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .insert([{
        ...post,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('[LinkedIn DB] Error saving post:', error)
      throw error
    }

    return data
  },

  /**
   * Atualiza um post existente
   */
  async updatePost(id: string, updates: Partial<LinkedInPost>): Promise<LinkedInPost> {
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[LinkedIn DB] Error updating post:', error)
      throw error
    }

    return data
  },

  /**
   * Busca posts pendentes de aprovação
   */
  async getPendingPosts(): Promise<LinkedInPost[]> {
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[LinkedIn DB] Error fetching pending posts:', error)
      throw error
    }

    return data || []
  },

  /**
   * Busca posts aprovados prontos para publicar
   */
  async getApprovedPostsReadyToPublish(): Promise<LinkedInPost[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('status', 'approved')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('[LinkedIn DB] Error fetching approved posts:', error)
      throw error
    }

    return data || []
  },

  /**
   * Busca todos os posts agendados (futuros)
   */
  async getScheduledPosts(): Promise<LinkedInPost[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('status', 'approved')
      .gt('scheduled_for', now)
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('[LinkedIn DB] Error fetching scheduled posts:', error)
      throw error
    }

    return data || []
  },

  /**
   * Busca posts publicados
   */
  async getPublishedPosts(limit: number = 50): Promise<LinkedInPost[]> {
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[LinkedIn DB] Error fetching published posts:', error)
      throw error
    }

    return data || []
  },

  /**
   * Aprova um post e agenda para publicação
   */
  async approvePost(id: string, scheduledFor: Date, approvedBy: string): Promise<LinkedInPost> {
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
        scheduled_for: scheduledFor.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[LinkedIn DB] Error approving post:', error)
      throw error
    }

    return data
  },

  /**
   * Marca um post como publicado
   */
  async markAsPublished(id: string, linkedInPostId: string): Promise<LinkedInPost> {
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        linkedin_post_id: linkedInPostId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[LinkedIn DB] Error marking post as published:', error)
      throw error
    }

    return data
  },

  /**
   * Marca um post como falhado
   */
  async markAsFailed(id: string, errorMessage: string): Promise<LinkedInPost> {
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .update({
        status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[LinkedIn DB] Error marking post as failed:', error)
      throw error
    }

    return data
  },

  /**
   * Deleta um post
   */
  async deletePost(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('linkedin_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[LinkedIn DB] Error deleting post:', error)
      throw error
    }
  },

  /**
   * Busca um post pelo ID
   */
  async getPostById(id: string): Promise<LinkedInPost | null> {
    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[LinkedIn DB] Error fetching post:', error)
      return null
    }

    return data
  },

  /**
   * Busca estatísticas de posts
   */
  async getStats() {
    const [pending, approved, published, failed] = await Promise.all([
      this.getPendingPosts(),
      this.getScheduledPosts(),
      this.getPublishedPosts(100),
      supabaseAdmin
        .from('linkedin_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
    ])

    return {
      pending: pending.length,
      scheduled: approved.length,
      published: published.length,
      failed: failed.count || 0,
      total: pending.length + approved.length + published.length + (failed.count || 0)
    }
  }
}

/**
 * Upload de imagem para o Supabase Storage (bucket blog-images)
 */
export async function uploadLinkedInImage(
  imageUrl: string, 
  postId: string
): Promise<{ publicUrl: string; storagePath: string } | null> {
  try {
    console.log('[LinkedIn Storage] Downloading image from DALL-E...')
    
    // Download da imagem
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }

    const imageBlob = await response.blob()
    const imageBuffer = await imageBlob.arrayBuffer()
    
    console.log('[LinkedIn Storage] Image downloaded, size:', (imageBuffer.byteLength / 1024).toFixed(2), 'KB')

    // Nome do arquivo
    const timestamp = Date.now()
    const fileName = `linkedin-${postId}-${timestamp}.png`
    const storagePath = `linkedin-posts/${fileName}`

    // Upload para Supabase Storage
    console.log('[LinkedIn Storage] Uploading to bucket blog-images...')
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(storagePath)

    const publicUrl = publicUrlData.publicUrl
    
    console.log('[LinkedIn Storage] ✅ Image uploaded successfully:', publicUrl)

    return {
      publicUrl,
      storagePath
    }
  } catch (error) {
    console.error('[LinkedIn Storage] Error uploading image:', error)
    return null
  }
}
