'use client'

import { useEffect, useState } from 'react'
import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { Skills } from '@/components/sections/skills'
import { Projects } from '@/components/sections/projects'
import { Curiosities } from '@/components/sections/curiosities'
import { AIFeatures } from '@/components/sections/ai-features'
import { RecentPosts } from '@/components/sections/recent-posts'
import { Contact } from '@/components/sections/contact'
import { MobileDashboard } from '@/components/sections/mobile-dashboard'

export default function Home() {
  const [isMobileView, setIsMobileView] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    const checkStandalone = () => {
      const isPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      setIsStandalone(isPWA)
    }

    checkMobile()
    checkStandalone()

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile PWA: Dashboard com destaques
  // Desktop ou Mobile Browser: Landing page completa
  if (isMobileView && isStandalone) {
    return <MobileDashboard />
  }

  // Landing page tradicional para desktop e mobile web
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Curiosities />
      <AIFeatures />
      <RecentPosts />
      <Contact />
    </>
  )
}
