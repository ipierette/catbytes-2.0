/**
 * Supabase Client for Browser/Client-Side Usage
 * 
 * This client is specifically designed for use in React components
 * and other client-side code. It uses the anonymous key and enables
 * session persistence for authentication flows.
 */

'use client'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-safe Supabase client
 * - Uses anonymous key (public)
 * - Enables session persistence
 * - Auto-refreshes tokens
 * - Safe to use in components
 */
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Helper function to create a new client instance
 * Useful when you need a fresh client or custom configuration
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}
