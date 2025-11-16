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
import { createClient } from '@/lib/supabase/client'
import { ScriptResponse } from '@/types/studio'

type StudioTab = 'create' | 'editor' | 'projects' | 'library' | 'publish' | 'analytics'

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>('create')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showScriptGenerator, setShowScriptGenerator] = useState(false)
  const [showNarrationGenerator, setShowNarrationGenerator] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string>('')
  const [generatedScript, setGeneratedScript] = useState<string>('')
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, published: 0, hours: 0 })
  const router = useRouter()
  const supabase = createClient()

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
      
      // Calculate stats
      const total = data?.length || 0
      const published = data?.filter(p => p.status === 'published').length || 0
      const totalDuration = data?.reduce((sum, p) => sum + (p.duration || 0), 0) || 0
      const hours = Math.floor(totalDuration / 3600)
      
      setStats({ total, published, hours })
    } catch (error) {
      console.error('Load projects error:', error)
    }
  }

  const handleCreateProject = async (formData: any) => {
    try {
      const response = await fetch('/api/studio/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create project')

      const { project } = await response.json()
      router.push(`/admin/studio/editor/${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Erro ao criar projeto')
    }
  }

  const handleScriptGenerated = (projectId: string, script: ScriptResponse) => {
    console.log('Script generated for project', projectId, script)
    // Save script text for narration
    const fullScript = `${script.hook}\n\n${script.body.map(s => s.text).join('\n\n')}\n\n${script.cta}`
    setGeneratedScript(fullScript)
    setShowScriptGenerator(false)
    setShowNarrationGenerator(true)
  }

  const handleNarrationGenerated = (narration: any) => {
    console.log('Narration generated:', narration)
    // TODO: Upload to Supabase Storage and add to timeline
    setShowNarrationGenerator(false)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CatBytes Media Studio</h1>
            <p className="text-xs text-gray-400">Produção de conteúdo multimídia</p>
          </div>
        </div>

        <div className="flex-1" />

        <nav className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Voltar ao Admin
          </Link>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </header>

      {/* Navigation Tabs */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-1">
        <TabButton
          icon={<Sparkles className="w-4 h-4" />}
          label="Criar"
          active={activeTab === 'create'}
          onClick={() => setActiveTab('create')}
        />
        <TabButton
          icon={<Layers className="w-4 h-4" />}
          label="Editor"
          active={activeTab === 'editor'}
          onClick={() => setActiveTab('editor')}
        />
        <TabButton
          icon={<FileText className="w-4 h-4" />}
          label="Projetos"
          active={activeTab === 'projects'}
          onClick={() => setActiveTab('projects')}
        />
        <TabButton
          icon={<Library className="w-4 h-4" />}
          label="Biblioteca"
          active={activeTab === 'library'}
          onClick={() => setActiveTab('library')}
        />
        <TabButton
          icon={<Upload className="w-4 h-4" />}
          label="Publicar"
          active={activeTab === 'publish'}
          onClick={() => setActiveTab('publish')}
        />
        <TabButton
          icon={<BarChart3 className="w-4 h-4" />}
          label="Analytics"
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
      {activeTab === 'create' && !showScriptGenerator && !showNarrationGenerator && (
        <CreateTab 
          onCreateClick={() => setShowNewProjectModal(true)} 
          onScriptGeneratorClick={() => setShowScriptGenerator(true)}
          stats={stats} 
        />
      )}
      {activeTab === 'create' && showScriptGenerator && (
        <ScriptGenerator
          projectId={currentProjectId}
          locale="pt-BR"
          onScriptGenerated={(script) => handleScriptGenerated(currentProjectId, script)}
          onBack={() => setShowScriptGenerator(false)}
        />
      )}
      {activeTab === 'create' && showNarrationGenerator && (
        <NarrationGenerator
          scriptText={generatedScript}
          onNarrationGenerated={handleNarrationGenerated}
          onBack={() => setShowNarrationGenerator(false)}
        />
      )}
      {activeTab === 'editor' && <EditorTab />}
      {activeTab === 'projects' && <ProjectsTab projects={projects} onCreateClick={() => setShowNewProjectModal(true)} />}
      {activeTab === 'library' && <LibraryTab />}
      {activeTab === 'publish' && <PublishTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  )
}

// ===== TAB BUTTON =====
function TabButton({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${active 
          ? 'bg-orange-500 text-white shadow-lg' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}

// ===== CREATE TAB =====
function CreateTab({ 
  onCreateClick, 
  onScriptGeneratorClick,
  stats 
}: { 
  onCreateClick: () => void
  onScriptGeneratorClick: () => void
  stats: any 
}) {
  const contentTypes = [
    {
      id: 'video',
      title: 'Criar Vídeo',
      description: 'Vídeo para redes sociais com narração AI e visuais',
      icon: <Video className="w-8 h-8" />,
      gradient: 'from-red-500 to-pink-500',
      platforms: ['YouTube', 'TikTok', 'Instagram', 'LinkedIn'],
      onClick: onCreateClick,
    },
    {
      id: 'script',
      title: 'Gerar Roteiro AI',
      description: 'Crie roteiros profissionais com inteligência artificial',
      icon: <Sparkles className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
      platforms: ['YouTube', 'TikTok', 'Instagram'],
      onClick: onScriptGeneratorClick,
    },
    {
      id: 'podcast',
      title: 'Criar Podcast',
      description: 'Episódio de podcast com narração AI profissional',
      icon: <Mic className="w-8 h-8" />,
      gradient: 'from-indigo-500 to-purple-500',
      platforms: ['Spotify', 'Apple Podcasts', 'RSS'],
      onClick: () => {
        setShowNarrationGenerator(true)
        setGeneratedScript('')
      },
    },
    {
      id: 'blog-video',
      title: 'Vídeo para Blog',
      description: 'Vídeo embarcado direto no post do blog',
      icon: <FileText className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-500',
      platforms: ['Blog CatBytes'],
      onClick: undefined,
    },
  ]

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            O que você quer criar hoje?
          </h2>
          <p className="text-gray-400 text-lg">
            Escolha um tipo de conteúdo para começar
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {contentTypes.map((type) => (
            <motion.button
              key={type.id}
              onClick={type.onClick}
              disabled={!type.onClick}
              className={`group relative bg-gray-800 rounded-2xl p-8 text-left transition-all overflow-hidden ${
                type.onClick 
                  ? 'hover:bg-gray-750 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              whileHover={type.onClick ? { y: -8, scale: 1.02 } : {}}
              whileTap={type.onClick ? { scale: 0.98 } : {}}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center text-white mb-6`}>
                {type.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {type.title}
              </h3>
              <p className="text-gray-400 mb-6">
                {type.description}
              </p>

              {/* Platforms */}
              <div className="flex flex-wrap gap-2">
                {type.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div className="absolute bottom-8 right-8 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <StatCard label="Projetos criados" value={stats.total.toString()} />
          <StatCard label="Vídeos publicados" value={stats.published.toString()} />
          <StatCard label="Horas de conteúdo" value={`${stats.hours}h`} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}

// ===== PLACEHOLDER TABS =====
function EditorTab() {
  return <PlaceholderTab title="Editor de Vídeo" description="Editor profissional em desenvolvimento" />
}

function ProjectsTab({ projects, onCreateClick }: { projects: any[]; onCreateClick: () => void }) {
  if (projects.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Nenhum projeto ainda</h3>
          <p className="text-gray-400 mb-6">Crie seu primeiro projeto para começar</p>
          <button
            onClick={onCreateClick}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Projeto
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Meus Projetos</h2>
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/studio/editor/${project.id}`}
              className="group bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all hover:shadow-lg"
            >
              <div className="aspect-video bg-gray-700 flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-600" />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white mb-1 group-hover:text-orange-500 transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="px-2 py-0.5 bg-gray-700 rounded">{project.status}</span>
                  <span>{project.aspect_ratio}</span>
                  <span>{project.duration}s</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function LibraryTab() {
  return <PlaceholderTab title="Biblioteca de Assets" description="Upload e gerencie seus assets" />
}

function PublishTab() {
  return <PlaceholderTab title="Publicar Conteúdo" description="Publique para todas as plataformas" />
}

function AnalyticsTab() {
  return <PlaceholderTab title="Analytics" description="Métricas de performance do seu conteúdo" />
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
          <Layers className="w-12 h-12 text-gray-600" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  )
}
