'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Home } from 'lucide-react'
import { useState } from 'react'

interface AdoptCatFormProps {
  onSubmit?: (data: any) => void
}

export function AdoptCatForm({ onSubmit }: AdoptCatFormProps) {
  const t = useTranslations('aiFeatures.adoptCat')
  const [formData, setFormData] = useState({ age: '', color: '', localizacao: '' })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/adopt-cat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(t('form.errorFetch'))
      }

      const data = await response.json()
      setResults(data)
      onSubmit?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('form.errorUnknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Home className="w-6 h-6 text-catbytes-blue" />
        {t('title')}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{t('description')}</p>

      <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('form.age')}
            </label>
            <input
              type="text"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('form.agePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('form.color')}
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('form.colorPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('form.location')}
            </label>
            <input
              type="text"
              value={formData.localizacao}
              onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t('form.locationPlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-catbytes-blue hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? t('form.searching') : t('form.submit')}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {results && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-white">{t('results.title')}</h4>
            {results.cats?.map((cat: any, index: number) => (
              <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h5 className="font-medium text-gray-900 dark:text-white">{cat.name}</h5>
                <p className="text-gray-600 dark:text-gray-300">{cat.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}