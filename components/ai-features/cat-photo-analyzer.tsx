'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Camera } from 'lucide-react'
import { useState } from 'react'

interface CatPhotoAnalyzerProps {
  onAnalysis?: (data: any) => void
}

export function CatPhotoAnalyzer({ onAnalysis }: CatPhotoAnalyzerProps) {
  const t = useTranslations('aiFeatures.photoAnalysis')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setAnalysis(null)
      setError('')
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/analyze-cat-photo', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(t('errorAnalysis'))
      }

      const data = await response.json()
      setAnalysis(data)
      onAnalysis?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorUnknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Camera className="w-6 h-6 text-catbytes-purple" />
        {t('title')}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{t('description')}</p>

      <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('uploadLabel')}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-catbytes-purple file:text-white hover:file:bg-purple-600"
            />
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {selectedFile.name}
              </span>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-catbytes-purple hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? t('analyzing') : t('analyze')}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {analysis && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-800 dark:text-white">{t('results.title')}</h4>
            <div className="grid gap-4">
              {analysis.breed && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">{t('results.breed')}</h5>
                  <p className="text-gray-600 dark:text-gray-300">{analysis.breed}</p>
                </div>
              )}
              
              {analysis.characteristics && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">{t('results.characteristics')}</h5>
                  <p className="text-gray-600 dark:text-gray-300">{analysis.characteristics}</p>
                </div>
              )}

              {analysis.health_tips && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">{t('results.healthTips')}</h5>
                  <p className="text-gray-600 dark:text-gray-300">{analysis.health_tips}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}