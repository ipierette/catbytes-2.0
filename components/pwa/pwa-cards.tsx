'use client'

import { motion } from 'framer-motion'
import { ExternalLink, FileText, Sparkles, Code2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const cards = [
  {
    id: 'projetos',
    title: 'Projetos',
    description: 'Aplicações web e PWAs que desenvolvi',
    icon: Code2,
    href: '/projetos',
    gradient: 'from-violet-500 to-purple-600',
    size: 'large', // Card principal, maior
    elevation: 'shadow-xl shadow-violet-500/20'
  },
  {
    id: 'blog',
    title: 'Blog',
    description: '+30 artigos sobre desenvolvimento',
    icon: FileText,
    href: '/blog',
    gradient: 'from-cyan-500 to-blue-600',
    size: 'small', // Secundário, menor
    elevation: 'shadow-lg shadow-cyan-500/10'
  },
  {
    id: 'ia-felina',
    title: 'IA Felina',
    description: 'Identifique raças, gere anúncios e mais',
    icon: Sparkles,
    href: '/#ai-features',
    gradient: 'from-amber-500 to-orange-600', // Cor exclusiva, não reciclada
    size: 'small',
    elevation: 'shadow-lg shadow-amber-500/10'
  }
]

export function PWACards() {
  const t = useTranslations()

  return (
    <div className="px-5 pb-12 space-y-4">
      {/* Card Principal - Projetos (Maior) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link href={cards[0].href} className="block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${cards[0].gradient} ${cards[0].elevation}`}
          >
            {/* Icon Badge */}
            <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-white mb-2">
                {cards[0].title}
              </h3>
              <p className="text-base text-white/90 leading-relaxed mb-4">
                {cards[0].description}
              </p>
              
              {/* CTA */}
              <div className="flex items-center gap-2 text-white font-medium">
                <span>Ver todos</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>

            {/* Mini-mockup decorativo */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/5 rounded-xl rotate-12 backdrop-blur-sm" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Cards Secundários - Grid 2 colunas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card Blog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href={cards[1].href} className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${cards[1].gradient} ${cards[1].elevation} min-h-[160px]`}
            >
              {/* Icon */}
              <FileText className="w-8 h-8 text-white mb-3" />
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-1">
                {cards[1].title}
              </h3>
              <p className="text-sm text-white/90 leading-snug">
                {cards[1].description}
              </p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Card IA Felina */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href={cards[2].href} className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${cards[2].gradient} ${cards[2].elevation} min-h-[160px]`}
            >
              {/* Icon */}
              <Sparkles className="w-8 h-8 text-white mb-3" />
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-1">
                {cards[2].title}
              </h3>
              <p className="text-sm text-white/90 leading-snug">
                {cards[2].description}
              </p>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
