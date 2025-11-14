'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScheduleDateTimePicker } from './schedule-datetime-picker'
import { Loader2, Calendar, Send } from 'lucide-react'
import Image from 'next/image'

interface ScheduleLinkedInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: {
    text: string
    imageUrl?: string
    postType: string
    articleSlug?: string
    asOrganization: boolean
  }
  onSuccess: () => void
}

export function ScheduleLinkedInModal({ 
  open, 
  onOpenChange, 
  post,
  onSuccess 
}: ScheduleLinkedInModalProps) {
  const [scheduledFor, setScheduledFor] = useState<Date>(new Date())
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSchedule = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Salvar post
      const saveResponse = await fetch('/api/linkedin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          text: post.text,
          image_url: post.imageUrl,
          post_type: post.postType,
          article_slug: post.articleSlug,
          as_organization: post.asOrganization
        })
      })

      if (!saveResponse.ok) {
        const error = await saveResponse.json()
        throw new Error(error.error || 'Erro ao salvar post')
      }

      const saveData = await saveResponse.json()

      // Aprovar e agendar
      const approveResponse = await fetch('/api/linkedin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          post_id: saveData.post.id,
          scheduled_for: scheduledFor.toISOString()
        })
      })

      if (!approveResponse.ok) {
        const error = await approveResponse.json()
        throw new Error(error.error || 'Erro ao agendar post')
      }

      setMessage({ 
        type: 'success', 
        text: `✅ Post agendado para ${scheduledFor.toLocaleString('pt-BR')}!` 
      })

      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
      }, 2000)

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao agendar'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePublishNow = async () => {
    setPublishing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: post.text,
          imageUrl: post.imageUrl,
          asOrganization: post.asOrganization
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao publicar')
      }

      setMessage({ 
        type: 'success', 
        text: '🎉 Post publicado com sucesso no LinkedIn!' 
      })

      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
      }, 2000)

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao publicar'
      })
    } finally {
      setPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    setSavingDraft(true)
    setMessage(null)

    try {
      const response = await fetch('/api/linkedin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          text: post.text,
          image_url: post.imageUrl,
          post_type: post.postType,
          article_slug: post.articleSlug,
          as_organization: post.asOrganization
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar rascunho')
      }

      setMessage({ 
        type: 'success', 
        text: '💾 Rascunho salvo! Você pode editá-lo e publicar depois.' 
      })

      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
      }, 2000)

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao salvar rascunho'
      })
    } finally {
      setSavingDraft(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">📅 Agendar Post LinkedIn</DialogTitle>
          <DialogDescription>
            Escolha quando publicar este post no LinkedIn
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200' 
              : 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Preview do Post */}
        <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {post.asOrganization ? 'CB' : 'IC'}
            </div>
            <span className="font-medium">
              {post.asOrganization ? 'CatBytes' : 'Izadora Cury Pierette'}
            </span>
          </div>

          <p className="text-sm whitespace-pre-wrap line-clamp-4">
            {post.text}
          </p>

          {post.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <Image
                src={post.imageUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Agendamento */}
        <ScheduleDateTimePicker
          value={scheduledFor}
          onChange={setScheduledFor}
          required
        />

        {/* Ações */}
        <div className="space-y-3">
          {/* Primeira linha: Salvar Rascunho */}
          <Button
            onClick={handleSaveDraft}
            disabled={saving || publishing || savingDraft}
            className="w-full bg-gray-600 hover:bg-gray-700"
            size="lg"
            variant="secondary"
          >
            {savingDraft ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                💾 Salvar Rascunho
              </>
            )}
          </Button>

          {/* Segunda linha: Agendar e Publicar */}
          <div className="flex gap-3">
            <Button
              onClick={handleSchedule}
              disabled={saving || publishing || savingDraft}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {saving ? (
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
              disabled={saving || publishing || savingDraft}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
              variant="default"
            >
              {publishing ? (
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
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <p className="text-center">
            💾 <strong>Salvar Rascunho:</strong> Guarda o post sem publicar (economiza créditos nos testes)
          </p>
          <p className="text-center">
            📅 <strong>Agendar:</strong> Publica automaticamente na data/hora escolhida
          </p>
          <p className="text-center">
            🚀 <strong>Publicar Agora:</strong> Publica imediatamente no LinkedIn
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
