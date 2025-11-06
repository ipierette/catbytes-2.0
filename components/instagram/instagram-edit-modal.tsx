/**
 * Instagram Edit Modal - Wrapper for Advanced Instagram Editor
 * This component now delegates to the AdvancedInstagramEditor
 */

'use client'

import { AdvancedInstagramEditor } from './advanced-instagram-editor'

interface InstagramPost {
  id: string
  created_at: string
  nicho: string
  titulo: string
  texto_imagem: string
  caption: string
  image_url: string
  instagram_post_id?: string
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'failed'
  error_message?: string
  scheduled_for?: string
  approved_at?: string
  published_at?: string
}

interface InstagramEditModalProps {
  post: InstagramPost
  isOpen: boolean
  onClose: () => void
  onSave: (updatedPost: InstagramPost) => Promise<void>
}

export function InstagramEditModal({ post, isOpen, onClose, onSave }: InstagramEditModalProps) {
  return (
    <AdvancedInstagramEditor
      post={post}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
    />
  )
}