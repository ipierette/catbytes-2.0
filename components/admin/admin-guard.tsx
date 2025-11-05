'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/hooks/use-admin'

interface AdminGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AdminGuard({ children, redirectTo = '/pt-BR/admin/login' }: AdminGuardProps) {
  const { isAdmin, isLoading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push(redirectTo)
    }
  }, [isAdmin, isLoading, router, redirectTo])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAdmin) {
    return null
  }

  // Show protected content
  return <>{children}</>
}