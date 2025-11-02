'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'

  // Show button after page load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-show tooltip on first visit
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('catbytes_whatsapp_tooltip_seen')
    if (!hasSeenTooltip && isVisible) {
      const timer = setTimeout(() => {
        setShowTooltip(true)
        localStorage.setItem('catbytes_whatsapp_tooltip_seen', 'true')

        // Auto-hide tooltip after 5 seconds
        setTimeout(() => setShowTooltip(false), 5000)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  const handleClick = () => {
    const message = encodeURIComponent(
      'Olá! Vim do site CatBytes e gostaria de saber mais sobre os serviços digitais com IA! 🐱'
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 left-6 z-50 flex items-end gap-3">
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                className="relative mb-2 max-w-xs"
              >
                <div className="rounded-2xl bg-white dark:bg-gray-800 px-4 py-3 shadow-2xl border-2 border-green-500 dark:border-green-400">
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <p className="text-sm font-medium text-gray-900 dark:text-white pr-4">
                    💬 Precisa de ajuda? <br />
                    <span className="text-green-600 dark:text-green-400">
                      Fale comigo no WhatsApp!
                    </span>
                  </p>

                  {/* Arrow pointing to button */}
                  <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white dark:bg-gray-800 border-r-2 border-b-2 border-green-500 dark:border-green-400 transform rotate-45"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp Button */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => {
              const hasSeenTooltip = localStorage.getItem('catbytes_whatsapp_tooltip_seen')
              if (hasSeenTooltip) setShowTooltip(false)
            }}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-2xl transition-all duration-300 hover:shadow-green-500/50"
            aria-label="Abrir WhatsApp"
          >
            {/* Pulsing ring effect */}
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>

            {/* Icon */}
            <FaWhatsapp className="w-8 h-8 relative z-10" />

            {/* Notification badge */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold z-20"
            >
              1
            </motion.span>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-75 blur-xl transition-opacity duration-300 -z-10"></div>
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  )
}
