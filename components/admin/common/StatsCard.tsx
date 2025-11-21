import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  loading?: boolean
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
}

export function StatsCard({
  title,
  value,
  subtitle,
  description,
  icon,
  loading,
  trend
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">{value}</div>
            
            {subtitle && (
              <div className="text-xs text-muted-foreground">
                {subtitle}
              </div>
            )}
            
            {description && (
              <div className="text-xs text-muted-foreground">
                {description}
              </div>
            )}
            
            {trend && (
              <div className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}% {trend.label}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
