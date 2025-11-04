'use client'

import { usePWAOnboarding } from '@/hooks/use-pwa-onboarding'
import { usePWADetection } from '@/hooks/use-pwa-detection'
import { OnboardingProfessional } from './onboarding-professional'
import { PWAAppBar } from './pwa-appbar'
import { PWAHomeHero } from './pwa-home-hero'
import { PWACards } from './pwa-cards'
import { AnimatePresence, motion } from 'framer-motion'

interface PWAWrapperProps {
  children: React.ReactNode
}

export function PWAWrapper({ children }: PWAWrapperProps) {
  const { showOnboarding, isLoading, completeOnboarding } = usePWAOnboarding()
  const { isPWA } = usePWADetection()

  // Loading minimalista
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Onboarding - só aparece na primeira vez */}
      <AnimatePresence mode="wait">
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OnboardingProfessional onComplete={completeOnboarding} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo principal */}
      {!showOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* AppBar - só no PWA */}
          {isPWA && <PWAAppBar />}
          
          {/* Layout condicional */}
          {isPWA ? (
            // Layout PWA com Hero e Cards customizados
            <div className="pt-14">
              <PWAHomeHero />
              <PWACards />
              {/* Resto do conteúdo original */}
              <div className="px-5">
                {children}
              </div>
            </div>
          ) : (
            // Layout normal (mobile/desktop)
            children
          )}
        </motion.div>
      )}
    </>
  )
}
