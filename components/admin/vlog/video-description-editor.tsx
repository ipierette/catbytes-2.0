'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles } from 'lucide-react'

interface VideoDescriptionEditorProps {
  description: string
  uploading: boolean
  canUpload: boolean
  onChange: (value: string) => void
  onUpload: () => void
}

export function VideoDescriptionEditor({
  description,
  uploading,
  canUpload,
  onChange,
  onUpload
}: VideoDescriptionEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Descrição do Vídeo</CardTitle>
        <CardDescription>
          Descreva brevemente o assunto do vídeo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={description}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: Neste vídeo eu explico os benefícios de usar Next.js para criar aplicações web modernas..."
          rows={6}
          className="resize-none"
        />

        <Button
          onClick={onUpload}
          disabled={uploading || !canUpload}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Processar e Melhorar com IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
