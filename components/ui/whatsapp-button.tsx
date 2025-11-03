'use client'

import { useState, useEffect } from 'react'
import { FaWhatsapp } from 'react-icons/fa'

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'

  // Show button after page loads
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleClick = () => {
    const message = encodeURIComponent(
      'Olá! Vim do site CatBytes e gostaria de saber mais sobre os serviços digitais com IA! 🐱'
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Tooltip */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg shadow-xl whitespace-nowrap transition-all duration-200 pointer-events-none ${
          showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        Fale comigo no WhatsApp! 💬
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="border-8 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-95"
        aria-label="Contato via WhatsApp"
      >
        {/* Pulsing ring effect */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></span>

        {/* Icon */}
        <FaWhatsapp className="w-7 h-7 md:w-8 md:h-8 relative z-10 group-hover:scale-110 transition-transform duration-200" />

        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full shadow-md animate-bounce">
          1
        </span>
      </button>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
