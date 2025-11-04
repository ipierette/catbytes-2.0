'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share, Plus } from 'lucide-react'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Verifica se já está instalado
    const checkStandalone = () => {
      const standalone = globalThis.window?.matchMedia('(display-mode: standalone)').matches ||
        (globalThis.navigator as any)?.standalone === true
      setIsStandalone(standalone)
    }

    // Verifica se é iOS
    const checkIOS = () => {
      const ua = globalThis.navigator?.userAgent || ''
      const ios = /iPad|iPhone|iPod/.test(ua) && !(globalThis.window as any)?.MSStream
      setIsIOS(ios)
    }

    // Verifica se já foi dispensado antes
    const wasDismissed = globalThis.localStorage?.getItem('pwa-banner-dismissed') === 'true'
    setDismissed(wasDismissed)

    checkStandalone()
    checkIOS()

    // Listener para Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!wasDismissed && !isStandalone) {
        setShowBanner(true)
      }
    }

    globalThis.window?.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Para iOS, mostra banner se não estiver instalado e não foi dispensado
    if (isIOS && !isStandalone && !wasDismissed) {
      // Delay de 3s para não ser invasivo
      const timer = setTimeout(() => setShowBanner(true), 3000)
      return () => {
        clearTimeout(timer)
        globalThis.window?.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    return () => {
      globalThis.window?.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isIOS, isStandalone])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome: usa o prompt nativo
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowBanner(false)
      }
      
      setDeferredPrompt(null)
    }
    // iOS: banner já mostra as instruções, apenas fecha
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
    globalThis.localStorage?.setItem('pwa-banner-dismissed', 'true')
  }

  // Não mostra se já está instalado ou foi dispensado
  if (isStandalone || dismissed || !showBanner) {
    return null
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-8 md:max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative p-6">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Logo + Content */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  <Image
                    src="/favicon-192x192.png"
                    alt="CatBytes Logo"
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Instalar CatBytes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isIOS 
                      ? 'Acesse o app direto da sua tela inicial!'
                      : 'Instale o app para uma experiência completa'}
                  </p>
                </div>
              </div>

              {/* Instruções iOS */}
              {isIOS && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Como instalar no iOS:
                  </p>
                  <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                        1
                      </span>
                      <span>
                        Toque no botão <Share className="inline w-4 h-4 mx-1" /> Compartilhar na barra inferior do Safari
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                        2
                      </span>
                      <span>
                        Role para baixo e toque em <Plus className="inline w-4 h-4 mx-1" /> "Adicionar à Tela de Início"
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                        3
                      </span>
                      <span>
                        Toque em "Adicionar" no canto superior direito
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Botão de Instalação (Android/Chrome) */}
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Instalar Agora
                </button>
              )}

              {/* Benefícios */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  ✨ Acesso rápido · 📱 Experiência nativa · 🚀 Sem espaço extra
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
