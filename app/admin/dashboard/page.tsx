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
import { BlogStatsCard } from './_components/BlogStatsCard'
import { InstagramStatsCard } from './_components/InstagramStatsCard'
import { AutomationStatusCard } from './_components/AutomationStatusCard'
import { QuickActionsCard } from './_components/QuickActionsCard'
import { ReportsCard } from './_components/ReportsCard'
import { CronMonitoringCard } from './_components/CronMonitoringCard'
import { APICostAnalyticsCard } from './_components/APICostAnalyticsCard'

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

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BlogStatsCard stats={stats.blog} />
            <InstagramStatsCard stats={stats.instagram} />
          </div>

          {/* Automation Status */}
          <AutomationStatusCard stats={stats.automation} />

          {/* Cron Monitoring */}
          <CronMonitoringCard />

          {/* API Cost Analytics */}
          <APICostAnalyticsCard />

          {/* Quick Actions */}
          <QuickActionsCard />

          {/* Reports */}
          <ReportsCard onSendReport={sendReport} sendingReport={sendingReport} />
        </div>
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}
