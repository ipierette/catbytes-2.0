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
  // O PWAWrapper agora gerencia toda a lógica de PWA
  // Esta página renderiza apenas o conteúdo padrão
  
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
