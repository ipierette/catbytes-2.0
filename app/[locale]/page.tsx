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

export default function Home() {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // Detecta se está rodando como PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      return isStandalone || isInWebAppiOS
    }
    setIsPWA(checkPWA())
  }, [])

  // No PWA, não renderiza nada (PWAWrapper já mostra Hero + Cards customizados)
  if (isPWA) {
    return null
  }

  // Browser normal: renderiza todas as seções
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
