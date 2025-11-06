import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { AnalyticsOverview } from '@/components/analytics/analytics-overview'

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      <AdminLayoutWrapper title="Analytics" description="Métricas e relatórios detalhados">
        <AnalyticsOverview />
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}