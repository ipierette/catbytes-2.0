'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { TypeAnimation } from 'react-type-animation'
import Image from 'next/image'
import { useState } from 'react'
import { AnimatedParticles } from '@/components/ui/animated-particles'
import { GitHubStats } from '@/components/ui/github-stats'

export function Hero() {
  const t = useTranslations('hero')
  const [showCatMessage, setShowCatMessage] = useState(false)

  return (
    <section
      id="hero"
      className="relative min-h-screen max-h-screen flex items-end justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 pt-20 pb-0"
    >
      {/* Background Particles Effect */}
      <AnimatedParticles />

      {/* Desktop and Tablet Layout */}
      <div className="hidden md:grid container mx-auto px-4 z-10 md:grid-cols-2 gap-12 h-full max-h-full">
        {/* Text Content - Vertically Centered */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 flex flex-col justify-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-comfortaa font-bold leading-tight text-gray-900 dark:text-white"
          >
            {t('title')}
            <br />
            <span className="bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent animate-gradient text-5xl md:text-7xl lg:text-8xl">
              {t('brandName')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium"
          >
            {t('subtitle')}
          </motion.p>

          {/* Typing Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-2xl md:text-3xl font-bold"
          >
            <TypeAnimation
              sequence={[
                t('typing.creativity'),
                2000,
                t('typing.code'),
                2000,
                t('typing.ai'),
                2000,
                t('typing.passion'),
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent"
            />
          </motion.div>

          {/* GitHub Stats - Dynamic */}
          <GitHubStats />
        </motion.div>

        {/* Cat Image with Hover Effect - Sits at Bottom of Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
          className="relative flex items-end justify-center"
        >
          <div
            className="relative w-full max-w-md mx-auto cursor-pointer flex items-end group"
            onMouseEnter={() => setShowCatMessage(true)}
            onMouseLeave={() => setShowCatMessage(false)}
          >
            <div className="w-full flex justify-center transition-all duration-300 hover:scale-105 hover:brightness-110">
              <Image
                src="/images/gato-sentado.webp"
                alt="Axel - Gato mascote do CatBytes"
                width={250}
                height={250}
                className="w-48 sm:w-56 md:w-64 lg:w-56 h-auto drop-shadow-2xl"
                priority
              />
            </div>

            {/* Cat Speech Bubble - Hover */}
            <AnimatePresence>
              {showCatMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xs border-2 border-gray-200 dark:border-gray-700 z-50"
                >
                  <p className="text-sm font-medium">{t('catMessage')}</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white dark:border-t-gray-800"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Mobile Layout - Cat Peeking from Right (Image 2 Style) */}
      <div className="md:hidden w-full min-h-screen flex flex-col justify-center px-6 py-20 z-10 relative overflow-hidden">
        {/* Background subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-purple-950/50 -z-10" />
        
        {/* Content Container - Full Width */}
        <div className="relative w-full max-w-md mx-auto">
          {/* Text Content - Left Aligned, More Space */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 space-y-4"
          >
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold leading-tight text-gray-900 dark:text-white"
            >
              Bem-vindo ao
              <br />
              Mundo
              <br />
              <span className="bg-gradient-to-r from-green-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                CatBytes
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-[260px]"
            >
              {t('subtitle')}
            </motion.p>

            {/* CTA Button with WhatsApp icon */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group relative overflow-hidden">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Conheça meus projetos miau 🐾
              </button>
            </motion.div>
          </motion.div>

          {/* Cat Image - PEEKING from Right Side (Only Half Visible) */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              type: "spring",
              stiffness: 120,
              damping: 15
            }}
            className="absolute top-16 -right-4 z-0 w-[160px] h-[280px] overflow-hidden"
            onTouchStart={() => setShowCatMessage(true)}
            onTouchEnd={() => setTimeout(() => setShowCatMessage(false), 2000)}
          >
            <div className="relative w-full h-full">
              {/* Cat positioned to show only LEFT HALF (head + partial body peeking) */}
              <Image
                src="/images/gato-sentado.webp"
                alt="Axel - Mascote CatBytes"
                width={280}
                height={280}
                className="absolute -right-20 top-0 w-[280px] h-[280px] object-contain drop-shadow-2xl"
                priority
              />
            </div>

            {/* Cat Speech Bubble - Touch/Tap */}
            <AnimatePresence>
              {showCatMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  className="absolute top-4 -left-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-medium border-2 border-purple-200 dark:border-purple-700 max-w-[180px] z-50"
                >
                  {t('catMessage')}
                  <div className="absolute top-1/2 -translate-y-1/2 -right-2 translate-x-full w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-transparent border-l-white dark:border-l-gray-800" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-gray-800 dark:border-white rounded-full flex justify-center backdrop-blur-sm">
          <motion.div
            className="w-1.5 h-3 bg-gray-800 dark:bg-white rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.div>
    </section>
  )
}
