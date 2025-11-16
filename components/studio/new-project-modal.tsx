'use client'

import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Platform } from '@/types/studio'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (projectData: ProjectFormData) => void
}

export interface ProjectFormData {
  title: string
  description?: string
  platformTargets: Platform[]
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
  locale: 'pt-BR' | 'en-US'
  duration: number
}

export function NewProjectModal({ isOpen, onClose, onCreate }: NewProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    platformTargets: ['youtube'],
    aspectRatio: '16:9',
    locale: 'pt-BR',
    duration: 60,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
    onClose()
    // Reset form
    setFormData({
      title: '',
      description: '',
      platformTargets: ['youtube'],
      aspectRatio: '16:9',
      locale: 'pt-BR',
      duration: 60,
    })
  }

  const togglePlatform = (platform: Platform) => {
    setFormData(prev => ({
      ...prev,
      platformTargets: prev.platformTargets.includes(platform)
        ? prev.platformTargets.filter(p => p !== platform)
        : [...prev.platformTargets, platform],
    }))
  }

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
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-gray-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Novo Projeto</h2>
                    <p className="text-sm text-gray-400">Configure seu projeto de vídeo</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Tutorial de React para Iniciantes"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva brevemente o conteúdo do vídeo..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                {/* Platforms */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Plataformas de Destino *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <PlatformCheckbox
                      platform="youtube"
                      label="YouTube"
                      checked={formData.platformTargets.includes('youtube')}
                      onChange={() => togglePlatform('youtube')}
                    />
                    <PlatformCheckbox
                      platform="tiktok"
                      label="TikTok"
                      checked={formData.platformTargets.includes('tiktok')}
                      onChange={() => togglePlatform('tiktok')}
                    />
                    <PlatformCheckbox
                      platform="instagram"
                      label="Instagram Reels"
                      checked={formData.platformTargets.includes('instagram')}
                      onChange={() => togglePlatform('instagram')}
                    />
                    <PlatformCheckbox
                      platform="linkedin"
                      label="LinkedIn"
                      checked={formData.platformTargets.includes('linkedin')}
                      onChange={() => togglePlatform('linkedin')}
                    />
                  </div>
                </div>

                {/* Aspect Ratio & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Proporção
                    </label>
                    <select
                      value={formData.aspectRatio}
                      onChange={(e) => setFormData(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="16:9">16:9 (YouTube, Landscape)</option>
                      <option value="9:16">9:16 (TikTok, Reels)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="4:5">4:5 (Instagram Feed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duração (segundos)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="3600"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Locale */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select
                    value={formData.locale}
                    onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.title || formData.platformTargets.length === 0}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Criar Projeto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function PlatformCheckbox({
  platform,
  label,
  checked,
  onChange,
}: {
  platform: Platform
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors border border-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 bg-gray-700"
      />
      <span className="text-sm text-gray-300 font-medium">{label}</span>
    </label>
  )
}
