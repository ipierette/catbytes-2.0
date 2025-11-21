'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Sparkles } from 'lucide-react'

interface ProcessedVideoProps {
  videoUrl: string
  improvedDescription: string
  onDescriptionChange: (value: string) => void
}

export function ProcessedVideo({
  videoUrl,
  improvedDescription,
  onDescriptionChange
}: ProcessedVideoProps) {
  const hasVideo = !!videoUrl
  const hasDescription = !!improvedDescription

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Descrição Profissional</CardTitle>
        <CardDescription>
          {hasDescription ? 'Gerada automaticamente pela IA' : 'Aguardando processamento'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasVideo && (
          <div className="border rounded-lg overflow-hidden">
            <video src={videoUrl} controls className="w-full h-auto" />
          </div>
        )}

        {hasDescription ? (
          <div className="space-y-4">
            <Textarea
              value={improvedDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={10}
              className="resize-none font-sans"
            />
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Descrição melhorada pela IA</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>A descrição melhorada aparecerá aqui</p>
            <p className="text-sm mt-1">após processar o vídeo</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
