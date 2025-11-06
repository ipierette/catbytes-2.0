'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Moon, Sun, LogOut, Home } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAdmin } from '@/hooks/use-admin'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
  const { theme, setTheme } = useTheme()
  const { logout } = useAdmin()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-900 shadow-lg border-b border-gray-800">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/logo-desenvolvedora.webp"
              alt="Logo CatBytes"
              width={150}
              height={50}
              className="h-12 w-auto"
              priority
            />
            <span className="text-sm font-semibold text-gray-300 hidden sm:inline">
              Admin Panel
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Voltar ao Site */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Site</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}
