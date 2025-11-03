'use client'

import { useState, useEffect } from 'react'
import { FaWhatsapp } from 'react-icons/fa'

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'

  // Show button after page loads
  useEffect(() => {
    setIsVisible(true)
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
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
      aria-label="Contato via WhatsApp"
      title="Fale comigo no WhatsApp"
    >
      <FaWhatsapp className="w-7 h-7 md:w-8 md:h-8" />
    </button>
  )
}
