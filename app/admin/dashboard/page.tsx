'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle, BarChart3, Zap, Clock, FileText } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('overview')
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
        <div className="space-y-6">
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

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Automação</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Monitoramento</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Relatórios</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <StatsCards stats={stats} formatNextExecution={formatNextExecution} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActionRequiredCard />
                <WeeklyCostAnalyticsCard />
              </div>
            </TabsContent>

            {/* Tab: Automação */}
            <TabsContent value="automation" className="space-y-6">
              <AutomationStatusCard stats={stats.automation} />
              
              <div>
                <h2 className="text-2xl font-bold mb-4">📊 Pool de Tópicos</h2>
                <BatchTopicGenerator />
              </div>
            </TabsContent>

            {/* Tab: Monitoramento */}
            <TabsContent value="monitoring" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">⏰ Cron Jobs</h2>
                <CronMonitor />
              </div>
            </TabsContent>

            {/* Tab: Relatórios */}
            <TabsContent value="reports" className="space-y-6">
              <ReportsCard onSendReport={sendReport} sendingReport={sendingReport} />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}
