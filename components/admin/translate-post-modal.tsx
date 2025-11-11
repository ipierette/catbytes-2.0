'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Languages, Send, X, Globe } from 'lucide-react'
import type { BlogPost } from '@/types/blog'

interface TranslatePostModalProps {
  post: BlogPost
  isOpen: boolean
  onClose: () => void
  onTranslated: () => void
}

export function TranslatePostModal({ post, isOpen, onClose, onTranslated }: TranslatePostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [targetLocale, setTargetLocale] = useState<'en-US' | 'pt-BR'>(
    post.locale === 'pt-BR' ? 'en-US' : 'pt-BR'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/blog/posts/${post.id}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          targetLocale,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create translation')
      }

      const result = await response.json()
      console.log('Translation created:', result)
      
      // Reset form
      setTitle('')
      setContent('')
      setExcerpt('')
      
      onTranslated()
      onClose()
      
      alert(`Translation created successfully! Notification emails sent to ${targetLocale} subscribers.`)
    } catch (error) {
      console.error('Error creating translation:', error)
      alert(error instanceof Error ? error.message : 'Failed to create translation')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-3">
            <Languages className="w-6 h-6 text-catbytes-purple" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Translate Post
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Original: <span className="font-medium">{post.title}</span> ({post.locale})
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Language */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4" />
                Target Language
              </label>
              <select
                value={targetLocale}
                onChange={(e) => setTargetLocale(e.target.value as 'en-US' | 'pt-BR')}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en-US">English (EN-US)</option>
                <option value="pt-BR">Português (PT-BR)</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Translated Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={targetLocale === 'en-US' ? 'Enter title in English...' : 'Digite o título em português...'}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Translated Excerpt (Optional)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={targetLocale === 'en-US' ? 'Brief description in English...' : 'Breve descrição em português...'}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-y"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Translated Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={targetLocale === 'en-US' 
                  ? 'Paste the translated content in English here...\n\nSupports Markdown format:\n- ## Headers\n- **Bold text**\n- [Links](url)\n- ![Images](url)\n- Tables and FAQ sections'
                  : 'Cole o conteúdo traduzido em português aqui...\n\nSuporta formato Markdown:\n- ## Títulos\n- **Texto em negrito**\n- [Links](url)\n- ![Imagens](url)\n- Tabelas e seções FAQ'
                }
                rows={20}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-y font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {targetLocale === 'en-US' 
                  ? 'Tip: Copy the original content and translate section by section to maintain formatting'
                  : 'Dica: Copie o conteúdo original e traduza seção por seção para manter a formatação'
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {targetLocale === 'en-US' 
                  ? 'EN-US subscribers will be notified automatically'
                  : 'Assinantes PT-BR serão notificados automaticamente'
                }
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || !title.trim() || !content.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-catbytes-purple to-catbytes-blue hover:from-catbytes-blue hover:to-catbytes-purple text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publish Translation
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}