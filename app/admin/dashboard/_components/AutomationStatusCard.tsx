import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Calendar, TrendingUp, Zap } from 'lucide-react'
import { formatNextExecution } from '../_hooks/dateUtils'

interface AutomationStatusCardProps {
  stats: {
    status: 'active' | 'paused'
    nextRun: string
    cronJobs: number
  }
}

export function AutomationStatusCard({ stats }: AutomationStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Status da Automação
        </CardTitle>
        <CardDescription>
          Cronograma e configurações do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Geração Automática
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Próxima:</strong> {formatNextExecution(stats.nextRun)}<br/>
              <strong>Frequência:</strong> Seg, Ter, Qui, Sáb<br/>
              <strong>Conteúdo:</strong> Blog + 10 posts Instagram
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Publicação Automática
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Próxima:</strong> {formatNextExecution(stats.nextRun)}<br/>
              <strong>Frequência:</strong> Seg, Qua, Sex, Dom<br/>
              <strong>Ação:</strong> Publica posts aprovados
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Recursos do Sistema
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Cron Jobs:</strong> {stats.cronJobs}/2 ativos<br/>
              <strong>APIs:</strong> OpenAI, Instagram<br/>
              <strong>Storage:</strong> Supabase
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
