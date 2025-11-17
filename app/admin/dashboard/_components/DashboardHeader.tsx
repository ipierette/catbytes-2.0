import { Button } from '@/components/ui/button'
import { LayoutDashboard, RefreshCw } from 'lucide-react'
import { formatRelativeTime } from '../_hooks/dateUtils'

interface DashboardHeaderProps {
  isCached: boolean
  lastUpdate: Date | null
  loading: boolean
  onRefresh: () => void
}

export function DashboardHeader({ isCached, lastUpdate, loading, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8" />
          Dashboard Principal
        </h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          Visão geral do sistema de automação
          {isCached && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              • Dados em cache
            </span>
          )}
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              • Atualizado {formatRelativeTime(lastUpdate.toISOString())}
            </span>
          )}
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  )
}
