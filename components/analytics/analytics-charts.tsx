'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts'

// =====================================================
// CORES
// =====================================================

export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  tertiary: '#f59e0b',
  quaternary: '#8b5cf6',
  danger: '#ef4444',
  gray: '#6b7280'
}

export const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899']

// =====================================================
// LINE CHART (Visualizações ao longo do tempo)
// =====================================================

interface ViewsOverTimeData {
  date: string
  views: number
  reads?: number
}

export function ViewsOverTimeChart({ data }: { data: ViewsOverTimeData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString('pt-BR')
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="views"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.primary, r: 3 }}
          activeDot={{ r: 5 }}
          name="Visualizações"
        />
        {data[0]?.reads !== undefined && (
          <Line
            type="monotone"
            dataKey="reads"
            stroke={CHART_COLORS.secondary}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.secondary, r: 3 }}
            activeDot={{ r: 5 }}
            name="Leituras"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

// =====================================================
// BAR CHART (Top Posts)
// =====================================================

interface TopPostsData {
  title: string
  views: number
}

export function TopPostsChart({ data, maxItems = 10 }: { data: TopPostsData[]; maxItems?: number }) {
  const truncatedData = data.slice(0, maxItems).map(item => ({
    ...item,
    shortTitle: item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={truncatedData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" stroke="#6b7280" fontSize={12} />
        <YAxis
          type="category"
          dataKey="shortTitle"
          stroke="#6b7280"
          fontSize={11}
          width={150}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          formatter={(value: number, name: string, props: any) => {
            return [value, props.payload.title]
          }}
        />
        <Bar
          dataKey="views"
          fill={CHART_COLORS.primary}
          radius={[0, 4, 4, 0]}
          name="Visualizações"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// =====================================================
// PIE CHART (Distribuição por Idioma/Categoria)
// =====================================================

interface DistributionData {
  name: string
  value: number
  [key: string]: string | number
}

export function DistributionPieChart({
  data,
  title
}: {
  data: DistributionData[]
  title?: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value || 0) / total * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// =====================================================
// DUAL LINE CHART (Google vs Blog)
// =====================================================

interface UnifiedTrafficData {
  date: string
  totalPageViews: number
  blogViews: number
}

export function UnifiedTrafficChart({ data }: { data: UnifiedTrafficData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString('pt-BR')
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalPageViews"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.primary, r: 3 }}
          name="Total (Google Analytics)"
        />
        <Line
          type="monotone"
          dataKey="blogViews"
          stroke={CHART_COLORS.secondary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.secondary, r: 3 }}
          name="Blog (Dados Próprios)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// =====================================================
// SIMPLE PROGRESS BAR LIST
// =====================================================

interface ProgressItem {
  title: string
  value: number
  subtitle?: string
}

export function ProgressBarList({
  data,
  maxValue
}: {
  data: ProgressItem[]
  maxValue?: number
}) {
  const max = maxValue || Math.max(...data.map(item => item.value))

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                )}
              </div>
              <span className="text-sm font-bold">{item.value.toLocaleString('pt-BR')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
