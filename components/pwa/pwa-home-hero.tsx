'use client'

import { motion } from 'framer-motion'
import { Code2, Database, Workflow } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { useTranslations } from 'next-intl'

const techStack = [
  { name: 'React · Next.js', icon: Code2, color: 'from-cyan-500 to-blue-500' },
  { name: 'TypeScript', icon: Code2, color: 'from-blue-500 to-indigo-500' },
  { name: 'Supabase', icon: Database, color: 'from-green-500 to-emerald-500' },
  { name: 'n8n', icon: Workflow, color: 'from-pink-500 to-rose-500' }
]

export function PWAHomeHero() {
  const t = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-5 pt-20 pb-12 bg-zinc-950"
    >
      {/* Headline - Objetivo claro */}
      <h1 className="text-3xl font-semibold tracking-tight text-white mb-4 leading-tight">
        Crio PWAs e automações de IA que geram resultado
      </h1>

      {/* Subtitle - Stack */}
      <p className="text-base text-zinc-400 leading-relaxed mb-8">
        Desenvolvimento full-stack especializado em aplicações web modernas e inteligência artificial
      </p>

      {/* Tech Stack - Max 3 chips visíveis */}
      <div className="flex flex-wrap gap-2 mb-8">
        {techStack.slice(0, 3).map((tech, index) => {
          const Icon = tech.icon
          return (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${tech.color} bg-opacity-10 backdrop-blur-sm border border-zinc-800`}
            >
              <Icon className="w-4 h-4 text-zinc-300" />
              <span className="text-sm font-medium text-zinc-300">
                {tech.name}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* WhatsApp CTA - Primary, não flutuante */}
      <motion.a
        href="https://wa.me/5511999999999?text=Olá!%20Vim%20do%20seu%20PWA"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaWhatsapp className="w-5 h-5" />
        <span>Fale comigo no WhatsApp</span>
      </motion.a>

      {/* Separator */}
      <div className="mt-12 mb-8 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
    </motion.div>
  )
}
