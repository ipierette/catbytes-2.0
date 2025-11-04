// ================================================
// PWA App Shell - Mobile Native Experience
// ================================================

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  BookOpen,
  Sparkles,
  User,
  Menu,
  ArrowLeft,
  Share2,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: Readonly<AppShellProps>) {
  const pathname = usePathname()
  const locale = useLocale()
  const [isStandalone, setIsStandalone] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  
  const [canShare, setCanShare] = useState(false)
  
  // Detect if running as PWA
  useEffect(() => {
    const checkStandalone = () => {
      if (globalThis.window !== undefined) {
        setIsStandalone(
          globalThis.window.matchMedia('(display-mode: standalone)').matches ||
          (globalThis.navigator as any).standalone ||
          globalThis.document?.referrer.includes('android-app://')
        )
      }
    }    // Check if share API is available
    setCanShare(!!navigator.share)
    
    checkStandalone()
  }, [])

  // Hide app shell on non-mobile or browser mode
  if (!isStandalone && globalThis.window !== undefined && globalThis.window.innerWidth > 768) {
    return <>{children}</>
  }

  const navigation = [
    {
      name: 'Home',
      icon: Home,
      href: `/${locale}`,
      active: pathname === `/${locale}` || pathname === '/'
    },
    {
      name: 'Projetos',
      icon: BookOpen,
      href: `/${locale}/projetos`,
      active: pathname.includes('/projetos')
    },
    {
      name: 'Blog',
      icon: Sparkles,
      href: `/${locale}/blog`,
      active: pathname.includes('/blog')
    },
    {
      name: 'IA',
      icon: User,
      href: `/${locale}/ia-felina`,
      active: pathname.includes('/ia-felina')
    }
  ]

  const handleShare = async () => {
    if (canShare && globalThis.navigator?.share) {
      try {
        await globalThis.navigator.share({
          title: 'CatBytes',
          text: 'Confira o CatBytes - Tecnologia com estilo felino! 🐱',
          url: globalThis.window?.location.href
        })
      } catch {
        // Usuário cancelou o compartilhamento
      }
    }
  }

  return (
    <div className="app-shell">
      {/* App Header - Professional Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <img
                src="/favicon-192x192.png"
                alt="CatBytes"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CatBytes
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {canShare && (
              <button 
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={locale === 'pt-BR' ? 'Compartilhar' : 'Share'}
              >
                <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}
            <button 
              onClick={() => setShowMenu(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Page Transitions */}
      <main className="pt-14 pb-20 min-h-screen bg-gray-50 dark:bg-gray-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2,
              ease: 'easeInOut'
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - iOS Style Professional */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 pb-safe">
        <div className="flex items-center justify-around px-2 h-16">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 relative"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="relative"
                >
                  <Icon 
                    className={`w-6 h-6 transition-colors ${
                      item.active 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                    strokeWidth={item.active ? 2.5 : 2}
                  />
                  
                  {/* Active indicator dot */}
                  {item.active && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-600 dark:bg-purple-400"
                      transition={{ 
                        type: 'spring',
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </motion.div>
                
                <span 
                  className={`text-xs font-medium transition-colors ${
                    item.active 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Side Menu Drawer - Modern Design */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: 'spring',
                damping: 25,
                stiffness: 300
              }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-[70] shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header with Profile */}
              <div className="relative h-40 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative p-6 flex flex-col justify-end h-full">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-white/30 shadow-xl">
                      <img
                        src="/favicon-192x192.png"
                        alt="CatBytes"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        CatBytes
                      </h2>
                      <p className="text-sm text-purple-100">
                        Tecnologia com estilo felino 🐱
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-1">
                <Link 
                  href={`/${locale}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => setShowMenu(false)}
                >
                  <Home className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  <span className="font-medium text-gray-900 dark:text-white">Home</span>
                </Link>
                
                <Link 
                  href={`/${locale}/projetos`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => setShowMenu(false)}
                >
                  <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  <span className="font-medium text-gray-900 dark:text-white">Projetos</span>
                </Link>
                
                <Link 
                  href={`/${locale}/blog`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => setShowMenu(false)}
                >
                  <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  <span className="font-medium text-gray-900 dark:text-white">Blog</span>
                </Link>
                
                <Link 
                  href={`/${locale}/ia-felina`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => setShowMenu(false)}
                >
                  <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  <span className="font-medium text-gray-900 dark:text-white">IA Felina</span>
                </Link>
                
                <Link 
                  href={`/${locale}/sobre`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  onClick={() => setShowMenu(false)}
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  <span className="font-medium text-gray-900 dark:text-white">Sobre</span>
                </Link>
              </div>

              {/* Footer Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  v2.0.0 · Made with 💜 by Izadora
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
