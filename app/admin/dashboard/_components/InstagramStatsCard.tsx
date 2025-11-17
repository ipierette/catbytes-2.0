import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Instagram } from 'lucide-react'
import { formatRelativeTime } from '../_hooks/dateUtils'

interface InstagramStatsCardProps {
  stats: {
    publishedPosts: number
    pendingPosts: number
    lastGenerated: string | null
  }
}

export function InstagramStatsCard({ stats }: InstagramStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Sistema Instagram
        </CardTitle>
        <CardDescription>
          Estatísticas e status do Instagram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Posts Publicados</span>
          <span className="text-lg font-bold text-green-600">{stats.publishedPosts}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Aguardando Aprovação</span>
          <span className="text-lg font-bold text-yellow-600">{stats.pendingPosts}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Última Geração</span>
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(stats.lastGenerated)}
          </span>
        </div>
        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={() => window.open('/admin/instagram', '_self')}>
            Gerenciar Instagram
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
