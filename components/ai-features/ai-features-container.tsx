'use client'

import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// Lazy load dos componentes pesados
const AdoptCatForm = lazy(() => import('./adopt-cat-form').then(m => ({ default: m.AdoptCatForm })))
const CatPhotoAnalyzer = lazy(() => import('./cat-photo-analyzer').then(m => ({ default: m.CatPhotoAnalyzer })))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="w-8 h-8 animate-spin text-catbytes-purple" />
    <span className="ml-2 text-gray-600 dark:text-gray-300">Carregando...</span>
  </div>
)

interface AIFeaturesContainerProps {
  activeTab: string
}

export function AIFeaturesContainer({ activeTab }: AIFeaturesContainerProps) {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mt-8"
    >
      <Suspense fallback={<LoadingSpinner />}>
        {activeTab === 'adopt' && <AdoptCatForm />}
        {activeTab === 'photo' && <CatPhotoAnalyzer />}
      </Suspense>
    </motion.div>
  )
}