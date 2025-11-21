'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import { PlatformSelections, Platform } from '@/types/vlog'

interface PlatformSelectorProps {
  platforms: PlatformSelections
  vlogId: string
  publishing: boolean
  hasSelection: boolean
  onTogglePlatform: (platform: Platform, checked: boolean) => void
  onPublish: () => void
}

const platformConfigs = [
  {
    id: 'instagram_feed' as Platform,
    label: 'Instagram Feed',
    description: 'Post de vídeo no feed',
    icon: '📸'
  },
  {
    id: 'instagram_reels' as Platform,
    label: 'Instagram Reels',
    description: 'Vídeo curto em formato vertical',
    icon: '🎬'
  },
  {
    id: 'linkedin' as Platform,
    label: 'LinkedIn',
    description: 'Post profissional com vídeo',
    icon: '💼'
  }
]

export function PlatformSelector({
  platforms,
  vlogId,
  publishing,
  hasSelection,
  onTogglePlatform,
  onPublish
}: PlatformSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Selecione as Plataformas</CardTitle>
        <CardDescription>
          Onde você quer publicar este vídeo?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {platformConfigs.map((config) => (
            <div key={config.id} className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox
                id={config.id}
                checked={platforms[config.id]}
                onCheckedChange={(checked) => onTogglePlatform(config.id, !!checked)}
              />
              <label htmlFor={config.id} className="flex-1 cursor-pointer">
                <div className="font-medium">{config.label}</div>
                <div className="text-xs text-muted-foreground">
                  {config.description}
                </div>
              </label>
              <Badge variant="outline">{config.icon}</Badge>
            </div>
          ))}
        </div>

        <Button
          onClick={onPublish}
          disabled={publishing || !vlogId || !hasSelection}
          className="w-full"
          size="lg"
        >
          {publishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Publicar nas Plataformas
            </>
          )}
        </Button>

        {!vlogId && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-amber-900 dark:text-amber-100">
              Faça o upload e processamento do vídeo antes de publicar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
