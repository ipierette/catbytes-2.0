import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { formatRelativeTime } from '../_hooks/dateUtils'

interface BlogStatsCardProps {
  stats: {
    publishedPosts: number
    drafts: number
    lastGenerated: string | null
  }
}

export function BlogStatsCard({ stats }: BlogStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          Sistema de Blog
        </CardTitle>
        <CardDescription>
          Estatísticas e status do blog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Posts Publicados</span>
          <span className="text-lg font-bold text-emerald-600">{stats.publishedPosts}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Rascunhos</span>
          <span className="text-lg font-bold text-muted-foreground">{stats.drafts}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Última Geração</span>
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(stats.lastGenerated)}
          </span>
        </div>
        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={() => window.open('/admin/blog', '_self')}>
            Gerenciar Blog
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
