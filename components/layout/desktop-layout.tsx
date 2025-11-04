'use client'

import { useEffect, useState } from 'react'
import { Header } from './header'
import { Footer } from './footer'

interface DesktopLayoutProps {
  children: React.ReactNode
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const [isStandalone, setIsStandalone] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    const checkStandalone = () => {
      setIsStandalone(
        globalThis.window?.matchMedia('(display-mode: standalone)').matches ||
        (globalThis.navigator as any)?.standalone === true
      )
    }

    const checkMobile = () => {
      setIsMobileView(globalThis.window?.innerWidth < 768)
    }

    checkStandalone()
    checkMobile()

    globalThis.window?.addEventListener('resize', checkMobile)
    return () => globalThis.window?.removeEventListener('resize', checkMobile)
  }, [])

  // Se for PWA mobile, não renderiza Header/Footer (AppShell já cuida)
  if (isStandalone && isMobileView) {
    return <>{children}</>
  }

  // Desktop ou mobile web: renderiza Header/Footer tradicional
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
