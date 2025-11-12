'use client'

import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { Skills } from '@/components/sections/skills'
import { Projects } from '@/components/sections/projects'
import { Curiosities } from '@/components/sections/curiosities'
import { AIFeaturesLazy } from '@/components/sections/ai-features-lazy'
import { RecentPosts } from '@/components/sections/recent-posts'
import { Contact } from '@/components/sections/contact'
import { SEOContent } from '@/components/sections/seo-content'

export default function Home() {
  return (
    <>
      <SEOContent />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Curiosities />
  <AIFeaturesLazy />
      <RecentPosts />
      <Contact />
    </>
  )
}
