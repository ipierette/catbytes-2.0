import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { UnifiedAnalyticsDashboard } from '@/components/analytics/unified-analytics-dashboard'

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      <AdminLayoutWrapper title="Analytics" description="Métricas completas do site e blog">
        <UnifiedAnalyticsDashboard />
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}