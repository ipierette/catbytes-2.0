'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [activeTab, setActiveTab] = useState('content')

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(editedPost)
      onClose()
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Erro ao salvar post. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const charCount = editedPost.caption.length
  const charLimit = 2200 // Instagram caption limit

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✏️ Editar Post do Instagram</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">📝 Conteúdo</TabsTrigger>
            <TabsTrigger value="preview">👁️ Preview</TabsTrigger>
          </TabsList>

          {/* Aba de Edição de Conteúdo */}
          <TabsContent value="content" className="space-y-4 mt-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título Interno</Label>
              <Input
                id="titulo"
                value={editedPost.titulo}
                onChange={(e) => setEditedPost({ ...editedPost, titulo: e.target.value })}
                placeholder="Título para identificação interna"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Este título é apenas para organização interna
              </p>
            </div>

            {/* Texto da Imagem */}
            <div className="space-y-2">
              <Label htmlFor="texto_imagem">Texto da Imagem (máx. 6 palavras)</Label>
              <Input
                id="texto_imagem"
                value={editedPost.texto_imagem}
                onChange={(e) => setEditedPost({ ...editedPost, texto_imagem: e.target.value })}
                placeholder="Ex: Automatize seu consultório com IA"
                className="w-full"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {editedPost.texto_imagem.split(' ').length} palavras
              </p>
            </div>

            {/* Caption (Legenda) */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Legenda do Post)</Label>
              <Textarea
                id="caption"
                value={editedPost.caption}
                onChange={(e) => setEditedPost({ ...editedPost, caption: e.target.value })}
                placeholder="Escreva a legenda do seu post..."
                className="w-full min-h-[300px] font-sans"
                maxLength={charLimit}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Use emojis 😊 e quebras de linha para melhor visualização</span>
                <span className={charCount > charLimit - 100 ? 'text-orange-500 font-semibold' : ''}>
                  {charCount} / {charLimit} caracteres
                </span>
              </div>
            </div>

            {/* Dicas de Formatação */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">💡 Dicas de Formatação:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Use emojis para destacar pontos importantes</li>
                <li>• Adicione espaços entre parágrafos para melhor legibilidade</li>
                <li>• Inclua hashtags relevantes no final</li>
                <li>• Call-to-action no primeiro parágrafo</li>
                <li>• Máximo de 30 hashtags (recomendado: 5-10)</li>
              </ul>
            </div>
          </TabsContent>

          {/* Aba de Preview */}
          <TabsContent value="preview" className="space-y-4 mt-4">
            <div className="bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6">
              <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                {/* Instagram Header */}
                <div className="flex items-center gap-3 p-3 border-b dark:border-gray-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    CB
                  </div>
                  <div>
                    <p className="font-semibold text-sm">catbytes.site</p>
                    <p className="text-xs text-muted-foreground">{editedPost.nicho}</p>
                  </div>
                </div>

                {/* Imagem */}
                <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800">
                  {editedPost.image_url ? (
                    <Image
                      src={editedPost.image_url}
                      alt={editedPost.titulo}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Imagem não disponível
                    </div>
                  )}
                </div>

                {/* Instagram Actions */}
                <div className="flex items-center gap-4 p-3 border-b dark:border-gray-800">
                  <span className="text-2xl">❤️</span>
                  <span className="text-2xl">💬</span>
                  <span className="text-2xl">📤</span>
                  <span className="text-2xl ml-auto">🔖</span>
                </div>

                {/* Caption */}
                <div className="p-3 max-h-[300px] overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">
                    <span className="font-semibold">catbytes.site</span> {editedPost.caption}
                  </p>
                </div>

                {/* Instagram Footer */}
                <div className="p-3 text-xs text-muted-foreground border-t dark:border-gray-800">
                  há alguns segundos
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : '💾 Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}