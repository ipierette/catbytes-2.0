import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import type { InstagramStats, PostStatus } from '@/lib/instagram'

interface StatsGridProps {
  stats: InstagramStats | null
  filterStatus?: 'all' | PostStatus
  onFilterChange?: (status: 'all' | PostStatus) => void
}

export function StatsGrid({ stats, filterStatus = 'all', onFilterChange }: StatsGridProps) {
  const handleCardClick = (status: typeof filterStatus) => {
    if (onFilterChange) {
      onFilterChange(filterStatus === status ? 'all' : status)
    }
  }

  const isActive = (status: typeof filterStatus) => filterStatus === status

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card 
        className={`cursor-pointer hover:border-yellow-600 hover:shadow-lg transition-all ${
          isActive('pending') ? 'border-yellow-600 shadow-lg' : ''
        }`}
        onClick={() => handleCardClick('pending')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
          {isActive('pending') && (
            <p className="text-xs text-yellow-600 mt-1">✓ Filtro ativo</p>
          )}
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer hover:border-blue-600 hover:shadow-lg transition-all ${
          isActive('approved') ? 'border-blue-600 shadow-lg' : ''
        }`}
        onClick={() => handleCardClick('approved')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats?.approved || 0}</div>
          {isActive('approved') && (
            <p className="text-xs text-blue-600 mt-1">✓ Filtro ativo</p>
          )}
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer hover:border-green-600 hover:shadow-lg transition-all ${
          isActive('published') ? 'border-green-600 shadow-lg' : ''
        }`}
        onClick={() => handleCardClick('published')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Publicados</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats?.published || 0}</div>
          {isActive('published') && (
            <p className="text-xs text-green-600 mt-1">✓ Filtro ativo</p>
          )}
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer hover:border-red-600 hover:shadow-lg transition-all ${
          isActive('failed') ? 'border-red-600 shadow-lg' : ''
        }`}
        onClick={() => handleCardClick('failed')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Falhas</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
          {isActive('failed') && (
            <p className="text-xs text-red-600 mt-1">✓ Filtro ativo</p>
          )}
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer hover:border-gray-600 hover:shadow-lg transition-all ${
          isActive('all') ? 'border-gray-600 shadow-lg' : ''
        }`}
        onClick={() => handleCardClick('all')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          {isActive('all') && (
            <p className="text-xs text-muted-foreground mt-1">✓ Todos</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
