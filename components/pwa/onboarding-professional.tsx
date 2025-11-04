'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Zap, Bot, Code2 } from 'lucide-react'
import Image from 'next/image'

interface Slide {
  id: number
  title: string
  subtitle: string
  bullets: string[]
  icon: React.ReactNode
  image?: string
  gradient: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Aplicações Web Modernas',
    subtitle: 'Sites e PWAs rápidos, bonitos e fáceis de usar.',
    bullets: [
      'Performance otimizada (< 1s LCP)',
      'SEO sólido e acessibilidade WCAG AA',
      'Design responsivo e mobile-first'
    ],
    icon: <Code2 className="w-12 h-12" />,
    image: '/images/catbytes-logo.png',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 2,
    title: 'Inteligência Artificial sob medida',
    subtitle: 'Bots, automações e conteúdo que trabalham por você.',
    bullets: [
      'Chatbots e assistentes virtuais',
      'Automação de processos e workflows',
      'Geração de conteúdo inteligente'
    ],
    icon: <Bot className="w-12 h-12" />,
    image: '/images/gato-sentado.webp',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 3,
    title: 'Performance & Automação',
    subtitle: 'Stack moderna (React/Next/TS) + otimizações reais.',
    bullets: [
      'React, Next.js 15 e TypeScript',
      'Supabase, n8n e integrações',
      'CI/CD e deploy automatizado'
    ],
    icon: <Zap className="w-12 h-12" />,
    image: '/images/logo-desenvolvedora.png',
    gradient: 'from-orange-500 to-red-600'
  }
]

interface OnboardingProfessionalProps {
  onComplete: () => void
}

export function OnboardingProfessional({ onComplete }: OnboardingProfessionalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      onComplete()
    } else {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const slide = slides[currentSlide]

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Skip Button - Ghost style no topo direito */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-10 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 opacity-70 hover:opacity-100 transition-all"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        Pular
      </button>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="flex-1 flex flex-col px-5 pt-20 pb-6 max-w-[480px] mx-auto w-full"
          >
            {/* Hero Section - 40-45% da altura */}
            <div className="flex flex-col items-center justify-center mb-8" style={{ minHeight: '40vh' }}>
              {/* Icon Badge com gradiente */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`mb-6 p-4 rounded-2xl bg-gradient-to-br ${slide.gradient} text-white shadow-lg`}
              >
                {slide.icon}
              </motion.div>

              {/* Image - altura aumentada para não cortar orelhas */}
              {slide.image && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative w-32 h-40 mb-6"
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              )}
            </div>

            {/* Título - H1 28-32px */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-semibold tracking-tight text-white text-center mb-3"
            >
              {slide.title}
            </motion.h1>

            {/* Subtítulo - 16-18px, line-height 1.5 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base text-zinc-400 text-center mb-6 leading-relaxed"
            >
              {slide.subtitle}
            </motion.p>

            {/* Bullets de valor - 3 itens consistentes */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mb-8"
            >
              {slide.bullets.map((bullet, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center mt-0.5`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-zinc-300 leading-relaxed">
                    {bullet}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer fixo - Dots + CTA sempre na mesma posição */}
      <div 
        className="bg-zinc-950 border-t border-zinc-800 px-5 pt-4 pb-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {/* Dots de progresso */}
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-violet-600'
                  : 'w-2 bg-zinc-700 hover:bg-zinc-600'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : 'false'}
            />
          ))}
        </div>

        {/* CTA primário - Full width, altura 48px (mínimo touch) */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={`w-full h-12 rounded-2xl font-medium text-white bg-gradient-to-r ${slide.gradient} hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md`}
        >
          {currentSlide === slides.length - 1 ? 'Começar agora' : 'Continuar'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}
