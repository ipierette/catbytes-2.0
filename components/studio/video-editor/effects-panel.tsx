'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wand2, Film, Type, Volume2, Search, 
  Plus, X, Sparkles, Zap, Wind
} from 'lucide-react'

type EffectCategory = 'transitions' | 'filters' | 'text' | 'audio'

interface Effect {
  id: string
  name: string
  category: EffectCategory
  preview?: string
  icon?: React.ReactNode
  description?: string
}

interface EffectsPanelProps {
  onApplyEffect: (effect: Effect) => void
}

const TRANSITIONS: Effect[] = [
  { id: 'fade', name: 'Fade', category: 'transitions', icon: <Wind className="w-4 h-4" />, description: 'Transição suave com fade' },
  { id: 'dissolve', name: 'Dissolve', category: 'transitions', icon: <Sparkles className="w-4 h-4" />, description: 'Dissolução gradual' },
  { id: 'wipe', name: 'Wipe', category: 'transitions', icon: <Film className="w-4 h-4" />, description: 'Corte deslizante' },
  { id: 'slide', name: 'Slide', category: 'transitions', icon: <Zap className="w-4 h-4" />, description: 'Deslizamento lateral' },
  { id: 'zoom', name: 'Zoom', category: 'transitions', icon: <Plus className="w-4 h-4" />, description: 'Zoom in/out' },
  { id: 'blur', name: 'Blur', category: 'transitions', description: 'Desfoque suave' },
  { id: 'glitch', name: 'Glitch', category: 'transitions', description: 'Efeito glitch moderno' },
  { id: 'modern-swipe', name: 'Modern Swipe', category: 'transitions', description: 'Swipe estilo TikTok' },
]

const FILTERS: Effect[] = [
  { id: 'brightness', name: 'Brilho', category: 'filters', description: 'Ajustar brilho' },
  { id: 'contrast', name: 'Contraste', category: 'filters', description: 'Aumentar contraste' },
  { id: 'saturation', name: 'Saturação', category: 'filters', description: 'Ajustar cores' },
  { id: 'blur-filter', name: 'Desfoque', category: 'filters', description: 'Aplicar desfoque' },
  { id: 'grayscale', name: 'Preto & Branco', category: 'filters', description: 'Remover cores' },
  { id: 'sepia', name: 'Sépia', category: 'filters', description: 'Tom vintage' },
  { id: 'vignette', name: 'Vinheta', category: 'filters', description: 'Escurecer bordas' },
  { id: 'chromatic', name: 'Aberração Cromática', category: 'filters', description: 'Efeito RGB split' },
]

const TEXT_EFFECTS: Effect[] = [
  { id: 'typewriter', name: 'Typewriter', category: 'text', icon: <Type className="w-4 h-4" />, description: 'Texto digitado' },
  { id: 'fade-in', name: 'Fade In', category: 'text', description: 'Aparecer gradualmente' },
  { id: 'slide-up', name: 'Slide Up', category: 'text', description: 'Subir da base' },
  { id: 'bounce', name: 'Bounce', category: 'text', description: 'Pular na entrada' },
  { id: 'glitch-text', name: 'Glitch', category: 'text', description: 'Efeito glitch' },
]

const AUDIO_EFFECTS: Effect[] = [
  { id: 'fade-audio-in', name: 'Fade In', category: 'audio', icon: <Volume2 className="w-4 h-4" />, description: 'Volume crescente' },
  { id: 'fade-audio-out', name: 'Fade Out', category: 'audio', icon: <Volume2 className="w-4 h-4" />, description: 'Volume decrescente' },
  { id: 'echo', name: 'Echo', category: 'audio', description: 'Efeito de eco' },
  { id: 'reverb', name: 'Reverb', category: 'audio', description: 'Reverberação' },
]

export function EffectsPanel({ onApplyEffect }: EffectsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<EffectCategory>('transitions')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'transitions' as EffectCategory, label: 'Transições', icon: <Film className="w-4 h-4" /> },
    { id: 'filters' as EffectCategory, label: 'Filtros', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'text' as EffectCategory, label: 'Texto', icon: <Type className="w-4 h-4" /> },
    { id: 'audio' as EffectCategory, label: 'Áudio', icon: <Volume2 className="w-4 h-4" /> },
  ]

  const getEffectsByCategory = (category: EffectCategory): Effect[] => {
    switch (category) {
      case 'transitions': return TRANSITIONS
      case 'filters': return FILTERS
      case 'text': return TEXT_EFFECTS
      case 'audio': return AUDIO_EFFECTS
      default: return []
    }
  }

  const currentEffects = getEffectsByCategory(activeCategory).filter(effect =>
    effect.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-white">Efeitos & Transições</h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar efeitos..."
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-2 border-b border-gray-800 bg-gray-950">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
              ${activeCategory === category.id
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
            `}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Effects Grid */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-2"
          >
            {currentEffects.map((effect) => (
              <motion.button
                key={effect.id}
                onClick={() => onApplyEffect(effect)}
                className="group relative bg-gray-800 hover:bg-gray-750 rounded-lg p-3 text-left transition-all overflow-hidden"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Content */}
                <div className="relative">
                  {effect.icon && (
                    <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-purple-400 mb-2">
                      {effect.icon}
                    </div>
                  )}
                  <h4 className="text-sm font-medium text-white mb-1">
                    {effect.name}
                  </h4>
                  {effect.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {effect.description}
                    </p>
                  )}
                </div>

                {/* Add Icon */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {currentEffects.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm">
              Nenhum efeito encontrado
            </p>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="p-3 border-t border-gray-800 bg-gray-950">
        <div className="text-xs text-gray-500">
          💡 <span className="text-gray-400">Dica:</span> Arraste efeitos para clips na timeline
        </div>
      </div>
    </div>
  )
}
