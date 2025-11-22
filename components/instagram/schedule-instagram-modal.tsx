'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScheduleDateTimePicker } from '../admin/schedule-datetime-picker'
import { Loader2, Calendar, Send, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface ScheduleInstagramModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: {
    id: string
    titulo: string
    texto_imagem: string
    caption: string
    image_url: string
  }
  onSuccess: () => void
}

export function ScheduleInstagramModal({ 
  open, 
  onOpenChange, 
  post,
  onSuccess 
}: ScheduleInstagramModalProps) {
  const [scheduledFor, setScheduledFor] = useState<Date>(new Date())
  const [approving, setApproving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSchedule = async () => {
    setApproving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/instagram/approve/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_for: scheduledFor.toISOString()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao agendar post')
      }

      const data = await response.json()

      setMessage({ 
        type: 'success', 
        text: `✅ Post agendado para ${scheduledFor.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        })}!` 
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
      setApproving(false)
    }
  }

  const handlePublishNow = async () => {
    setPublishing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao publicar')
      }

      setMessage({ 
        type: 'success', 
        text: '🎉 Post publicado com sucesso no Instagram!' 
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

  const handleApproveForAuto = async () => {
    setApproving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/instagram/approve/${post.id}`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao aprovar post')
      }

      const data = await response.json()

      setMessage({ 
        type: 'success', 
        text: data.message || '✅ Post aprovado! Será publicado automaticamente no próximo horário.' 
      })

      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
      }, 2000)

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao aprovar'
      })
    } finally {
      setApproving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">📅 Agendar Post Instagram</DialogTitle>
          <DialogDescription>
            Escolha quando publicar este post no Instagram
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
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex gap-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={post.image_url}
                alt={post.titulo}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-2">{post.titulo}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {post.texto_imagem}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {post.caption}
              </p>
            </div>
          </div>
        </div>

        {/* Opções de Publicação */}
        <div className="space-y-4">
          {/* Opção 1: Publicar Agora */}
          <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <Send className="h-4 w-4 text-green-600" />
                  Publicar Agora
                </h4>
                <p className="text-sm text-muted-foreground">
                  Publica imediatamente no Instagram
                </p>
              </div>
              <Button
                onClick={handlePublishNow}
                disabled={publishing || approving}
                className="gap-2"
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publicar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Opção 2: Agendar Data Específica */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Agendar para Data Específica
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha exatamente quando quer publicar
            </p>
            
            <ScheduleDateTimePicker
              value={scheduledFor}
              onChange={setScheduledFor}
            />

            <Button
              onClick={handleSchedule}
              disabled={approving || publishing}
              className="w-full mt-4 gap-2"
              variant="default"
            >
              {approving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Agendar para {scheduledFor.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </>
              )}
            </Button>
          </div>

          {/* Opção 3: Aprovar para Automático */}
          <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold mb-1 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  Aprovar para Sistema Automático
                </h4>
                <p className="text-sm text-muted-foreground">
                  Será publicado automaticamente no próximo horário agendado (Segunda, Quarta, Sexta, Domingo às 9:00)
                </p>
              </div>
              <Button
                onClick={handleApproveForAuto}
                disabled={approving || publishing}
                variant="outline"
                className="gap-2"
              >
                {approving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Aprovando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Aprovar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>💡 Dica:</strong> Posts agendados aparecem na aba "Agendados" e serão publicados automaticamente no horário escolhido.
        </div>
      </DialogContent>
    </Dialog>
  )
}
