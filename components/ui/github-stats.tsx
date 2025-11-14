'use client'

import { useEffect, useState } from 'react'
import { GitCommit, FolderGit2, Star, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface GitHubStats {
  totalCommits: number
  publicRepos: number
  totalStars: number
  topLanguage: string
}

export function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Lazy load stats - só carregar após 2s para priorizar LCP
    const timer = setTimeout(() => {
      const fetchGitHubStats = async () => {
        try {
          console.log('[GitHubStats] Fetching data from API...')

          // Fetch stats from our secure API route
          const response = await fetch('/api/github-stats')

          if (!response.ok) {
            throw new Error(`API failed: ${response.status}`)
          }

          const statsData = await response.json()
          console.log('[GitHubStats] Stats received:', statsData)

          setStats(statsData)
        } catch (error) {
          console.error('[GitHubStats] Error fetching:', error)
          // Fallback values
          const fallbackStats = {
            totalCommits: 250,
            publicRepos: 18,
            totalStars: 12,
            topLanguage: 'TypeScript',
          }
          console.log('[GitHubStats] Using fallback:', fallbackStats)
          setStats(fallbackStats)
        } finally {
          setLoading(false)
        }
      }

      fetchGitHubStats()
    }, 2000) // Delay 2s para priorizar conteúdo crítico

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      icon: GitCommit,
      value: `${stats.totalCommits}+`,
      label: 'Commits',
      color: 'text-green-500 dark:text-green-400',
    },
    {
      icon: FolderGit2,
      value: stats.publicRepos,
      label: 'Repos',
      color: 'text-blue-500 dark:text-blue-400',
    },
    {
      icon: Star,
      value: stats.totalStars,
      label: 'Stars',
      color: 'text-yellow-500 dark:text-yellow-400',
    },
    {
      icon: Code2,
      value: stats.topLanguage,
      label: 'Top Lang',
      color: 'text-purple-500 dark:text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border-2 border-gray-200 dark:border-gray-700 hover:border-catbytes-purple dark:hover:border-catbytes-pink transition-all hover:scale-105"
        >
          <div className="flex items-center gap-2 mb-1">
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {item.value}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
