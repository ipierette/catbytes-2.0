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

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const [isStandalone, setIsStandalone] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  
  const [canShare, setCanShare] = useState(false)
  
  // Detect if running as PWA
  useEffect(() => {
    const checkStandalone = () => {
      const isStandalonePWA = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      
      setIsStandalone(isStandalonePWA)
      
      // Add class to body for PWA-specific styling
      if (isStandalonePWA) {
        document.body.classList.add('pwa-standalone')
      }
    }
    
    // Check if share API is available
    setCanShare(!!navigator.share)
    
    checkStandalone()
  }, [])

  // Hide app shell on non-mobile or browser mode
  if (!isStandalone && typeof window !== 'undefined' && window.innerWidth > 768) {
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CatBytes',
          text: 'Confira o CatBytes - Tecnologia com estilo felino! 🐱',
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  return (
    <div className="app-shell">
      {/* App Header - Native Style */}
      <header className="app-header">
        <div className="app-header-content">
          {pathname !== `/${locale}` && pathname !== '/' ? (
            <button 
              onClick={() => window.history.back()}
              className="app-header-button"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={() => setShowMenu(true)}
              className="app-header-button"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="app-header-title">
            <span className="app-logo-text">Cat</span>
            <span className="app-logo-highlight">Bytes</span>
          </div>

          <div className="app-header-actions">
            {canShare && (
              <button 
                onClick={handleShare}
                className="app-header-button"
                aria-label={locale === 'pt-BR' ? 'Compartilhar' : 'Share'}
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <button 
              className="app-header-button"
              aria-label="Mais opções"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Page Transitions */}
      <main className="app-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              type: 'spring',
              stiffness: 380,
              damping: 30
            }}
            className="app-page"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Native Style */}
      <nav className="app-bottom-nav">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`app-nav-item ${item.active ? 'active' : ''}`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="app-nav-icon-wrapper"
              >
                <Icon className="app-nav-icon" />
                {item.active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="app-nav-indicator"
                    transition={{ 
                      type: 'spring',
                      stiffness: 380,
                      damping: 30
                    }}
                  />
                )}
              </motion.div>
              <span className="app-nav-label">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="app-drawer-overlay"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
              className="app-drawer"
            >
              <div className="app-drawer-header">
                <div className="app-drawer-logo">
                  <span className="text-2xl">🐱</span>
                  <div>
                    <h2 className="text-xl font-comfortaa font-bold text-white">
                      CatBytes
                    </h2>
                    <p className="text-xs text-purple-200">
                      Tecnologia Felina
                    </p>
                  </div>
                </div>
              </div>

              <div className="app-drawer-content">
                <Link 
                  href={`/${locale}`}
                  className="app-drawer-item"
                  onClick={() => setShowMenu(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link 
                  href={`/${locale}/projetos`}
                  className="app-drawer-item"
                  onClick={() => setShowMenu(false)}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Projetos</span>
                </Link>
                <Link 
                  href={`/${locale}/blog`}
                  className="app-drawer-item"
                  onClick={() => setShowMenu(false)}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Blog</span>
                </Link>
                <Link 
                  href={`/${locale}/ia-felina`}
                  className="app-drawer-item"
                  onClick={() => setShowMenu(false)}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>IA Felina</span>
                </Link>
                <Link 
                  href={`/${locale}/sobre`}
                  className="app-drawer-item"
                  onClick={() => setShowMenu(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Sobre</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
