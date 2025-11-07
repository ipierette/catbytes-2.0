'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, BookOpen } from 'lucide-react'
import { GoogleAnalyticsSection } from './google-analytics-section'
import { BlogAnalyticsSection } from './blog-analytics-section'
import { OverviewSection } from './overview-section'

export function UnifiedAnalyticsDashboard() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  return (
    <div className="space-y-6">
      {/* Header com seleção de período */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Métricas completas do site e blog
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Overview Geral</span>
            <span className="sm:hidden">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Google Analytics</span>
            <span className="sm:hidden">Google</span>
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Blog Detalhado</span>
            <span className="sm:hidden">Blog</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview Unificado */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewSection period={period} />
        </TabsContent>

        {/* Tab 2: Google Analytics */}
        <TabsContent value="google" className="space-y-6">
          <GoogleAnalyticsSection period={period} />
        </TabsContent>

        {/* Tab 3: Blog Analytics Detalhado */}
        <TabsContent value="blog" className="space-y-6">
          <BlogAnalyticsSection period={period} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
