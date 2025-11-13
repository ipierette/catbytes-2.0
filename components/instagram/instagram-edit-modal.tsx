/**
 * Instagram Edit Modal - Simple Title and Caption Editor
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

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
  const [editedPost, setEditedPost] = useState<InstagramPost>(post)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(editedPost)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar post. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const charCount = editedPost.caption.length
  const charLimit = 2200

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✏️ Editar Post Instagram</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview da Imagem */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-black rounded-lg overflow-hidden">
              <Image
                src={post.image_url}
                alt={post.titulo}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 A imagem não pode ser editada. Para alterar a imagem, gere um novo post.
              </p>
            </div>
          </div>

          {/* Campos de Edição */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título Interno</Label>
              <Input
                id="titulo"
                value={editedPost.titulo}
                onChange={(e) => setEditedPost({ ...editedPost, titulo: e.target.value })}
                placeholder="Título para identificação interna"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Usado apenas para organização interna
              </p>
            </div>

            <div>
              <Label htmlFor="caption">Legenda do Post</Label>
              <Textarea
                id="caption"
                value={editedPost.caption}
                onChange={(e) => setEditedPost({ ...editedPost, caption: e.target.value })}
                placeholder="Escreva a legenda do seu post..."
                className="min-h-[300px] font-sans"
                maxLength={charLimit}
                autoComplete="off"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Use emojis 😊 e quebras de linha para melhor visualização</span>
                <span className={charCount > charLimit - 100 ? 'text-orange-500 font-semibold' : ''}>
                  {charCount} / {charLimit}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Salvando...' : '💾 Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}