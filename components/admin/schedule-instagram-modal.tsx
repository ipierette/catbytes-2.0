'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScheduleDateTimePicker } from './schedule-datetime-picker'
import { useToast } from '@/components/ui/toast'
import { Loader2, Send, Calendar } from 'lucide-react'
import Image from 'next/image'

interface ScheduleInstagramModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: {
    caption: string
    image_url?: string
    carousel_images?: string[]
  }
  onSuccess: () => void
}

export function ScheduleInstagramModal({ 
  open, 
  onOpenChange, 
  post,
  onSuccess 
}: ScheduleInstagramModalProps) {
  const { showToast } = useToast()
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>(undefined)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleSchedule = async () => {
    if (!scheduledFor) {
      showToast('Selecione uma data e hora para agendar', 'error')
      return
    }

    setIsScheduling(true)
    try {
      // 1. Salvar o post
      const saveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          caption: post.caption,
          image_url: post.image_url || null,
          carousel_images: post.carousel_images || null
        })
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        throw new Error(error.error || 'Erro ao salvar post')
      }

      const saveData = await saveResponse.json()
      const postId = saveData.postId

      // 2. Aprovar o post
      const approveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          postId,
          scheduledFor: scheduledFor.toISOString()
        })
      })

      if (!approveResponse.ok) {
        const error = await approveResponse.json()
        throw new Error(error.error || 'Erro ao aprovar post')
      }

      showToast(`📅 Post agendado para ${scheduledFor.toLocaleString('pt-BR')}`, 'success')
      onSuccess()
      onOpenChange(false)
      setScheduledFor(undefined)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao agendar post',
        'error'
      )
    } finally {
      setIsScheduling(false)
    }
  }

  const handlePublishNow = async () => {
    setIsPublishing(true)
    try {
      // 1. Salvar o post
      const saveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          caption: post.caption,
          image_url: post.image_url || null,
          carousel_images: post.carousel_images || null
        })
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        throw new Error(error.error || 'Erro ao salvar post')
      }

      const saveData = await saveResponse.json()
      const postId = saveData.postId

      // 2. Aprovar com scheduled_for = agora
      const now = new Date()
      const approveResponse = await fetch('/api/instagram/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          postId,
          scheduledFor: now.toISOString()
        })
      })

      if (!approveResponse.ok) {
        const error = await approveResponse.json()
        throw new Error(error.error || 'Erro ao aprovar post')
      }

      // 3. Publicar imediatamente
      const publishResponse = await fetch('/api/instagram/publish-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })

      if (!publishResponse.ok) {
        const error = await publishResponse.json()
        throw new Error(error.error || 'Erro ao publicar post')
      }

      const publishData = await publishResponse.json()
      showToast('🎉 Post publicado com sucesso no Instagram!', 'success')
      onSuccess()
      onOpenChange(false)
      setScheduledFor(undefined)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao publicar post',
        'error'
      )
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📸 Agendar Post no Instagram</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview do Post */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="text-sm font-medium mb-3">Preview do Post</h3>
            
            {/* Carousel ou Imagem Única */}
            {post.carousel_images && post.carousel_images.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Carrossel com {post.carousel_images.length} imagens
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {post.carousel_images.slice(0, 6).map((url, idx) => (
                    <div key={idx} className="aspect-square relative rounded overflow-hidden border">
                      <Image
                        src={url}
                        alt={`Imagem ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : post.image_url ? (
              <div className="aspect-square relative rounded overflow-hidden border max-w-xs mx-auto">
                <Image
                  src={post.image_url}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            {/* Caption */}
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Legenda:</p>
              <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded border">
                {post.caption}
              </p>
            </div>
          </div>

          {/* Date/Time Picker */}
          <ScheduleDateTimePicker
            value={scheduledFor}
            onChange={setScheduledFor}
            minDate={new Date()}
            label="Data e Hora de Publicação"
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleSchedule}
              disabled={isScheduling || isPublishing || !scheduledFor}
              className="w-full"
              variant="outline"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Post
                </>
              )}
            </Button>

            <Button
              onClick={handlePublishNow}
              disabled={isScheduling || isPublishing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publicar Agora
                </>
              )}
            </Button>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">ℹ️ Informação</p>
            <p className="text-xs leading-relaxed">
              <strong>Agendar:</strong> O post será salvo e publicado automaticamente na data/hora escolhida<br />
              <strong>Publicar Agora:</strong> O post será publicado imediatamente no Instagram
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
