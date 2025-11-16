'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { VideoEditor } from '@/components/studio/video-editor'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadProject()
  }, [params.id])

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('video_projects')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      if (!data) {
        setError('Projeto não encontrado')
        return
      }

      setProject(data)
    } catch (err) {
      console.error('Load project error:', err)
      setError('Erro ao carregar projeto')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Projeto não encontrado'}</p>
          <button
            onClick={() => router.push('/admin/studio')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Voltar ao Studio
          </button>
        </div>
      </div>
    )
  }

  return <VideoEditor projectId={params.id as string} initialProject={project} />
}
