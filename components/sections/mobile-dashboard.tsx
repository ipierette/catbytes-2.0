'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, BookOpen, Briefcase } from 'lucide-react'
import { useLocale } from 'next-intl'

export function MobileDashboard() {
  const locale = useLocale()

  const highlights = [
    {
      title: 'Projetos em Destaque',
      description: 'Explore meu portfólio de desenvolvimento',
      icon: Briefcase,
      href: `/${locale}/projetos`,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Blog Tech',
      description: 'Artigos sobre React, Next.js e IA',
      icon: BookOpen,
      href: `/${locale}/blog`,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'IA Felina',
      description: 'Ferramentas de IA para gatos',
      icon: Sparkles,
      href: `/${locale}/ia-felina`,
      gradient: 'from-pink-500 to-rose-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-safe pb-safe">
      {/* Hero Compacto */}
      <section className="px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-xl border-4 border-white/20">
            <Image
              src="/favicon-192x192.png"
              alt="CatBytes Logo"
              width={96}
              height={96}
              className="object-cover"
              priority
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
            Olá, sou Izadora! 👋
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Desenvolvedora Front-end
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
              React
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              Next.js
            </span>
            <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-medium">
              TypeScript
            </span>
          </div>
        </motion.div>
      </section>

      {/* Cards de Destaque */}
      <section className="px-6 pb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Explore
        </h2>
        
        <div className="space-y-4">
          {highlights.map((item, index) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-10 rounded-full -mr-16 -mt-16`} />
                  
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-4 mt-3" />
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center shadow-xl"
        >
          <h3 className="text-xl font-bold mb-2">
            Vamos trabalhar juntos?
          </h3>
          <p className="text-purple-100 mb-4 text-sm">
            Entre em contato para discutir seu projeto
          </p>
          <Link href={`/${locale}/sobre`}>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors w-full max-w-xs">
              Ver Perfil Completo
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
