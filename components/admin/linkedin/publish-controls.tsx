'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Calendar } from 'lucide-react'

interface PublishControlsProps {
  postText: string
  asOrganization: boolean
  onToggleOrganization: () => void
  onSchedule: () => void
}

export function PublishControls({
  postText,
  asOrganization,
  onToggleOrganization,
  onSchedule
}: PublishControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicar</CardTitle>
        <CardDescription>Compartilhe no LinkedIn</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">Publicar como:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleOrganization}
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            {asOrganization ? 'Página CatBytes' : 'Perfil Pessoal'}
          </Button>
        </div>

        <Badge variant="outline" className="w-full justify-center text-sm py-2">
          {asOrganization ? '🏢 Como Página' : '👤 Como Perfil'}
        </Badge>

        <Button
          onClick={onSchedule}
          disabled={!postText.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Agendar ou Publicar
        </Button>

        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-900 dark:text-blue-100">
          <p className="font-medium mb-1">📅 Publicação</p>
          <p className="text-xs leading-relaxed">
            Escolha uma data/hora específica ou publique imediatamente no LinkedIn
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
