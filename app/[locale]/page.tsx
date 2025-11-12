'use client'

import { Hero } from '@/components/sections/hero'
import { AboutLazy } from '@/components/sections/about-lazy'
import { SkillsLazy } from '@/components/sections/skills-lazy'
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
      <AboutLazy />
      <SkillsLazy />
      <Projects />
      <Curiosities />
      <AIFeaturesLazy />
      <RecentPosts />
      <Contact />
    </>
  )
}
