import { AdminProvider } from '@/hooks/use-admin'
import type { Metadata } from 'next'

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
  return <AdminProvider>{children}</AdminProvider>
}
