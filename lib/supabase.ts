// =====================================================
// Supabase Client Configuration
// =====================================================

import { createClient } from '@supabase/supabase-js'
import type { BlogPost, BlogPostInsert, BlogPostUpdate } from '@/types/blog'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client for public operations (read-only)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Admin client for server-side operations (full access)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null

// Type-safe database helpers
export const db = {
  // Get all published posts with pagination
  async getPosts(page = 1, pageSize = 10, locale = 'pt-BR') {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .eq('locale', locale)
      .is('deleted_at', null) // Exclude soft-deleted posts
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('[Supabase] Error fetching posts:', error)
      throw error
    }

    return {
      posts: data as BlogPost[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  // Get recent posts (for homepage)
  async getRecentPosts(limit = 2) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as BlogPost[]
  },

  // Get single post by slug
  async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) throw error
    return data as BlogPost
  },

  // Get single post by ID
  async getPostById(id: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as BlogPost
  },

  // Create new post (admin only - use via API route)
  async createPost(post: BlogPostInsert) {
    if (!supabaseAdmin) throw new Error('Supabase admin client not configured')

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(post)
      .select()
      .single()

    if (error) throw error
    return data as BlogPost
  },

  // Update post (admin only - use via API route)
  async updatePost(id: string, updates: BlogPostUpdate) {
    if (!supabaseAdmin) throw new Error('Supabase admin client not configured')

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as BlogPost
  },

  // Delete post (admin only - use via API route)
  async deletePost(id: string) {
    if (!supabaseAdmin) throw new Error('Supabase admin client not configured')

    const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id)

    if (error) throw error
  },

  // Increment views
  async incrementViews(postId: string) {
    try {
      if (!supabaseAdmin) {
        console.error('Error incrementing views: supabaseAdmin not configured')
        return false
      }

      // Use admin client for RPC calls in Edge runtime
      const { data, error } = await supabaseAdmin.rpc('increment_post_views', {
        post_id: postId,
      })

      if (error) {
        console.error('Error incrementing views:', error)
        console.error('Post ID:', postId)
        return false
      }
      
      console.log('[Views] Incremented views for post:', postId)
      return true
    } catch (err) {
      console.error('Exception incrementing views:', err)
      return false
    }
  },

  // Get total post count
  async getPostCount() {
    const { count, error } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    if (error) throw error
    return count || 0
  },

  // Search posts
  async searchPosts(query: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data as BlogPost[]
  },
}

// Utility function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '') // Remove accents
    .replaceAll(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replaceAll(/\s+/g, '-') // Replace spaces with hyphens
    .replaceAll(/-+/g, '-') // Remove duplicate hyphens
    .substring(0, 100) // Max length
}

// Upload image from URL to Supabase Storage
export async function uploadImageFromUrl(imageUrl: string, fileName: string): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured')
  }

  try {
    // Download image from URL
    console.log('[Supabase] Downloading image from:', imageUrl.substring(0, 60) + '...')
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }

    const imageBlob = await response.blob()
    const imageBuffer = await imageBlob.arrayBuffer()
    console.log('[Supabase] Image downloaded, size:', (imageBuffer.byteLength / 1024).toFixed(2), 'KB')

    // Generate unique file name with timestamp
    const timestamp = Date.now()
    const sanitizedFileName = fileName
      .toLowerCase()
      .replaceAll(/[^a-z0-9-]/g, '-')
      .replaceAll(/-+/g, '-')
      .substring(0, 50)
    const uniqueFileName = `${sanitizedFileName}-${timestamp}.webp`
    const filePath = `blog-covers/${uniqueFileName}`

    // Upload to Supabase Storage
    console.log('[Supabase] Uploading to storage:', filePath)
    const { error } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      })

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl
    console.log('[Supabase] Image uploaded successfully:', publicUrl)

    return publicUrl
  } catch (error) {
    console.error('[Supabase] Error uploading image:', error)
    throw error
  }
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
