'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Instagram, 
  FileText, 
  Settings, 
  BarChart3,
  Rocket,
  ChevronLeft,
  User,
  Mail
} from 'lucide-react'

interface AdminNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const adminNavItems: AdminNavItem[] = [
  {
    title: 'Dashboard Principal',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Painel de controle da mega automação'
  },
  {
    title: 'Instagram',
    href: '/admin/instagram', 
    icon: Instagram,
    description: 'Gerenciar posts do Instagram'
  },
  {
    title: 'Blog',
    href: '/admin/blog',
    icon: FileText,
    description: 'Criar e gerenciar posts do blog'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Métricas e relatórios'
  },
  {
    title: 'Email Preview',
    href: '/admin/email-preview',
    icon: Mail,
    description: 'Visualizar templates de email'
  },
  {
    title: 'Configurações',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configurações do sistema'
  }
]

interface AdminNavigationProps {
  className?: string
  variant?: 'sidebar' | 'breadcrumb' | 'tabs'
}

export function AdminNavigation({ className, variant = 'sidebar' }: AdminNavigationProps) {
  const pathname = usePathname()

  if (variant === 'breadcrumb') {
    const currentItem = adminNavItems.find(item => pathname.includes(item.href))
    
    return (
      <nav className={cn("flex items-center space-x-2 text-sm", className)}>
        <Link 
          href="/"
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <Link 
          href="/admin/mega-campaign"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Admin
        </Link>
        {currentItem && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {currentItem.title}
            </span>
          </>
        )}
      </nav>
    )
  }

  if (variant === 'tabs') {
    return (
      <nav className={cn("border-b border-gray-200", className)}>
        <div className="flex space-x-6">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/admin/mega-campaign' && pathname.includes(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border-b-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  // Default sidebar variant
  return (
    <nav className={cn("space-y-1", className)}>
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href || 
                        (item.href !== '/admin/mega-campaign' && pathname.includes(item.href))
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              isActive ? "text-blue-600" : "text-gray-500"
            )} />
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </Link>
        )
      })}
      
      {/* Voltar para o site */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
          <div>
            <div className="font-medium">Voltar ao Site</div>
            <div className="text-xs text-gray-500">CATBytes Portfolio</div>
          </div>
        </Link>
      </div>
    </nav>
  )
}

export function AdminLayoutWrapper({ 
  children, 
  title,
  description 
}: { 
  children: React.ReactNode
  title?: string
  description?: string
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col fixed left-0 top-[73px] bottom-0 z-10">
          <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 h-full overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Admin</h2>
                  <p className="text-xs text-gray-500">CATBytes Panel</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex-grow flex flex-col px-4">
              <AdminNavigation />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col md:ml-64">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <AdminNavigation variant="breadcrumb" />
                {title && (
                  <div className="mt-2">
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {description && (
                      <p className="text-sm text-gray-600">{description}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <AdminNavigation variant="tabs" className="hidden" />
              </div>
            </div>
            
            {/* Tabs navigation for medium+ screens */}
            <div className="mt-4 hidden md:block">
              <AdminNavigation variant="tabs" />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}