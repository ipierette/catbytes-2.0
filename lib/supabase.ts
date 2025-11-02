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
  async getPosts(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

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
    const { error } = await supabase.rpc('increment_post_views', {
      post_id: postId,
    })

    if (error) console.error('Error incrementing views:', error)
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
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .substring(0, 100) // Max length
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
