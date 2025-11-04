'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'

export function PWAAppBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const locale = useLocale()
  
  // Fade to solid após 24px de scroll
  const backgroundColor = useTransform(
    scrollY,
    [0, 24],
    ['rgba(124, 58, 237, 0)', 'rgba(44, 14, 120, 0.95)']
  )
  
  const backdropBlur = useTransform(
    scrollY,
    [0, 24],
    ['blur(10px)', 'blur(20px)']
  )

  // Prevenir scroll quando menu aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const menuItems = [
    { label: 'Home', href: `/${locale}` },
    { label: 'Sobre', href: `/${locale}#about` },
    { label: 'Skills', href: `/${locale}#skills` },
    { label: 'Projetos', href: `/${locale}/projetos` },
    { label: 'Curiosidades', href: `/${locale}#curiosities` },
    { label: 'IA Felina', href: `/${locale}/ia-felina` },
    { label: 'Blog', href: `/${locale}/blog` },
    { label: 'Contato', href: `/${locale}#contact` }
  ]

  return (
    <>
      {/* AppBar */}
      <motion.header
        style={{ 
          backgroundColor,
          backdropFilter: backdropBlur,
          WebkitBackdropFilter: backdropBlur
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      >
        <div 
          className="flex items-center justify-between h-14 px-5"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          {/* Logo - altura aumentada para não cortar orelhas */}
          <a href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-10">
              <Image
                src="/images/catbytes-logo.png"
                alt="CatBytes"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-base font-semibold text-white">
              CatBytes
            </span>
          </a>

          {/* Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-gradient-to-b from-violet-900 to-purple-900"
          style={{ 
            paddingTop: 'calc(56px + env(safe-area-inset-top))',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          <nav className="flex flex-col items-center justify-center h-full px-8 space-y-6">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-semibold text-white hover:text-violet-200 transition-colors"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>
        </motion.div>
      )}
    </>
  )
}
