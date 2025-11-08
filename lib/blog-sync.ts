/**
 * Blog Post Synchronization
 * 
 * Utility to sync blog post updates across components
 * (e.g., view count updates between home and blog pages)
 */

import type { BlogPost } from '@/types/blog'

type PostUpdateListener = (post: BlogPost) => void

class BlogSync {
  private listeners: Set<PostUpdateListener> = new Set()

  /**
   * Subscribe to post updates
   */
  subscribe(listener: PostUpdateListener) {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of a post update
   */
  notifyUpdate(post: BlogPost) {
    this.listeners.forEach((listener) => {
      try {
        listener(post)
      } catch (err) {
        console.error('[BlogSync] Error in listener:', err)
      }
    })
  }
}

// Singleton instance
export const blogSync = new BlogSync()
