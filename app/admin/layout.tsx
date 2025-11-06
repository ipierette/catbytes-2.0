import { AdminProvider } from '@/hooks/use-admin'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AdminHeader } from '@/components/layout/admin-header'
import type { Metadata } from 'next'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Admin Panel | CatBytes',
  description: 'CatBytes Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AdminProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <AdminHeader />
          {children}
        </div>
      </AdminProvider>
    </ThemeProvider>
  )
}
