'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Heart, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CatBytesStoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CatBytesStoryModal({ isOpen, onClose }: CatBytesStoryModalProps) {
  const t = useTranslations('about.catbytes')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl pointer-events-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-catbytes-purple dark:text-catbytes-pink" />
                    <h2 className="text-3xl md:text-4xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent">
                      {t('storyTitle')}
                    </h2>
                    <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {t('storySubtitle')}
                  </p>
                </motion.div>

                {/* Story Content */}
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Image */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-catbytes-purple/20 dark:border-catbytes-pink/20">
                      <Image
                        src="/images/axel-adulto.webp"
                        alt="Axel - A inspiração do CatBytes"
                        width={500}
                        height={500}
                        className="w-full h-auto object-cover"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      {/* Name tag */}
                      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          🐱 Axel - {t('axelRole')}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Text */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        {t('storyPart1')}
                      </p>
                      <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        {t('storyPart2')}
                      </p>
                      <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        {t('storyPart3')}
                      </p>
                    </div>

                    {/* Fun Facts */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-catbytes-purple/20 dark:border-catbytes-pink/20">
                      <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200">
                        💜 {t('funFactsTitle')}
                      </h3>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-catbytes-purple dark:text-catbytes-pink">🐾</span>
                          <span>{t('funFact1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-catbytes-purple dark:text-catbytes-pink">💻</span>
                          <span>{t('funFact2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-catbytes-purple dark:text-catbytes-pink">✨</span>
                          <span>{t('funFact3')}</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 text-center"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {t('footer')}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
