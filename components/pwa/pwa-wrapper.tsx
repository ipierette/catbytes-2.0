'use client'

import { usePWAOnboarding } from '@/hooks/use-pwa-onboarding'
import { OnboardingProfessional } from './onboarding-professional'
import { AnimatePresence, motion } from 'framer-motion'

interface PWAWrapperProps {
  children: React.ReactNode
}

export function PWAWrapper({ children }: PWAWrapperProps) {
  const { showOnboarding, isLoading, completeOnboarding } = usePWAOnboarding()

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

      {!showOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </>
  )
}
