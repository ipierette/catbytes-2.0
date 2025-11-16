'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Video, Mic, FileText, Library, Upload, BarChart3,
  Sparkles, Play, Layers, Settings, Plus
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NewProjectModal, ProjectFormData } from '@/components/studio/new-project-modal'
import { ScriptGenerator } from '@/components/studio/script-generator'
import { NarrationGenerator } from '@/components/studio/narration-generator'
import { supabase } from '@/lib/supabase'
import { ScriptResponse } from '@/types/studio'

type StudioTab = 'create' | 'projects' | 'library' | 'analytics'

export function StudioDashboardEmbedded() {
  const [activeTab, setActiveTab] = useState<StudioTab>('create')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showScriptGenerator, setShowScriptGenerator] = useState(false)
  const [showNarrationGenerator, setShowNarrationGenerator] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<string>('')
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, published: 0, hours: 0 })
  const router = useRouter()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('video_projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      setProjects(data || [])
      
      const total = data?.length || 0
      const published = data?.filter(p => p.status === 'published').length || 0
      const totalDuration = data?.reduce((sum, p) => sum + (p.duration || 0), 0) || 0
      const hours = Math.floor(totalDuration / 3600)
      
      setStats({ total, published, hours })
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      const response = await fetch('/api/studio/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create project')

      const { project } = await response.json()
      setShowNewProjectModal(false)
      router.push(`/admin/vlog?studio=${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Erro ao criar projeto')
    }
  }

  const handleScriptGenerated = (script: ScriptResponse) => {
    setGeneratedScript(script.script)
    setShowScriptGenerator(false)
    setShowNarrationGenerator(true)
  }

  const handleNarrationGenerated = (audioData: string, duration: number) => {
    console.log('Narration generated:', { duration })
    setShowNarrationGenerator(false)
    // Criar novo projeto com narração
    setShowNewProjectModal(true)
  }

  const tabs = [
    { id: 'create' as StudioTab, label: 'Criar', icon: Plus },
    { id: 'projects' as StudioTab, label: 'Projetos', icon: Video },
    { id: 'library' as StudioTab, label: 'Biblioteca', icon: Library },
    { id: 'analytics' as StudioTab, label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 font-medium transition-all relative
                ${activeTab === tab.id
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Criar Vídeo Manualmente */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
            onClick={() => setShowNewProjectModal(true)}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              Criar Vídeo Manualmente
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Editor completo com timeline, efeitos e publicação automática
            </p>
          </motion.div>

          {/* Gerar Script com IA */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
            onClick={() => setShowScriptGenerator(true)}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              Criar Conteúdo Social
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              IA gera script otimizado + narração profissional
            </p>
          </motion.div>

          {/* Criar Podcast */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
            onClick={() => setShowNarrationGenerator(true)}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              Criar Podcast
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Converta texto em narração com vozes realistas
            </p>
          </motion.div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Meus Projetos
            </h2>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum projeto ainda. Crie seu primeiro vídeo!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-red-500 transition-colors"
                  onClick={() => router.push(`/admin/vlog?studio=${project.id}`)}
                >
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>{project.status}</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'library' && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Library className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Biblioteca de assets em desenvolvimento
          </p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.total}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Projetos Criados</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.published}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Publicados</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.hours}h</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tempo de Vídeo</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {showScriptGenerator && (
        <ScriptGenerator
          onClose={() => setShowScriptGenerator(false)}
          onScriptGenerated={handleScriptGenerated}
        />
      )}

      {showNarrationGenerator && (
        <NarrationGenerator
          onClose={() => setShowNarrationGenerator(false)}
          initialScript={generatedScript}
          onNarrationGenerated={handleNarrationGenerated}
        />
      )}
    </div>
  )
}
