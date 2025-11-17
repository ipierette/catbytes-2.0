import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Instagram, Zap, Clock } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    blog: {
      totalPosts: number
      publishedPosts: number
    }
    instagram: {
      totalPosts: number
      pendingPosts: number
    }
    automation: {
      status: 'active' | 'paused'
      cronJobs: number
      nextRun: string
    }
  }
  formatNextExecution: (date: string) => string
}

export function StatsCards({ stats, formatNextExecution }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Posts do Blog</CardTitle>
          <FileText className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{stats.blog.totalPosts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.blog.publishedPosts} publicados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Posts Instagram</CardTitle>
          <Instagram className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{stats.instagram.totalPosts}</div>
          <p className="text-xs text-muted-foreground">
            {stats.instagram.pendingPosts} pendentes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Automação</CardTitle>
          <Zap className={`h-4 w-4 ${stats.automation.status === 'active' ? 'text-emerald-600' : 'text-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.automation.status === 'active' ? 'text-emerald-600' : 'text-red-500'}`}>
            {stats.automation.status === 'active' ? 'ATIVA' : 'PAUSADA'}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.automation.cronJobs}/2 cron jobs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próxima Execução</CardTitle>
          <Clock className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-emerald-600">
            {new Date(stats.automation.nextRun).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatNextExecution(stats.automation.nextRun).replace(/ às \d{2}:\d{2}$/, '')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
