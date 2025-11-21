'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { useDashboardStats } from './_hooks/useDashboardStats'
import { useReports } from './_hooks/useReports'
import { formatNextExecution } from './_hooks/dateUtils'
import { DashboardHeader } from './_components/DashboardHeader'
import { StatsCards } from './_components/StatsCards'
import { AutomationStatusCard } from './_components/AutomationStatusCard'
import { ReportsCard } from './_components/ReportsCard'
import { APICostAnalyticsCard } from './_components/APICostAnalyticsCard'
import { ActionRequiredCard } from '@/components/admin/action-required-card'
import { WeeklyCostAnalyticsCard } from '@/components/admin/weekly-cost-analytics-card'
import CronMonitor from '@/components/admin/CronMonitor'
import BatchTopicGenerator from '@/components/admin/BatchTopicGenerator'

export default function DashboardPage() {
  const { stats, loading, error, isCached, lastUpdate, reload } = useDashboardStats()
  const { sendReport, sendingReport, message } = useReports()

  if (loading && !stats) {
    return (
      <AdminGuard>
        <AdminLayoutWrapper title="Dashboard Principal" description="Painel de controle da mega automação">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </AdminLayoutWrapper>
      </AdminGuard>
    )
  }

  if (error && !stats) {
    return (
      <AdminGuard>
        <AdminLayoutWrapper title="Dashboard Principal" description="Painel de controle da mega automação">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </AdminLayoutWrapper>
      </AdminGuard>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <AdminGuard>
      <AdminLayoutWrapper title="Dashboard Principal" description="Painel de controle da mega automação">
        <div className="space-y-8">
          {/* Header */}
          <DashboardHeader
            isCached={isCached}
            lastUpdate={lastUpdate}
            loading={loading}
            onRefresh={reload}
          />

          {/* Message Alert */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Main Stats Cards */}
          <StatsCards stats={stats} formatNextExecution={formatNextExecution} />

          {/* System Overview - Ação Necessária e Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ActionRequiredCard />
            <WeeklyCostAnalyticsCard />
          </div>

          {/* Automation Status */}
          <AutomationStatusCard stats={stats.automation} />

          {/* Topics Pool Monitor */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">📊 Pool de Tópicos</h2>
            
            {/* Batch Topic Generator */}
            <div className="mb-8">
              <BatchTopicGenerator />
            </div>
          </div>

          {/* Cron Monitoring */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">⏰ Monitoramento de Cron Jobs</h2>
            <CronMonitor />
          </div>

          {/* Reports */}
          <ReportsCard onSendReport={sendReport} sendingReport={sendingReport} />
        </div>
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}
