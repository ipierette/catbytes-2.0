import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET: List all projects for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: projects, error } = await supabase
      .from('video_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ projects })

  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST: Create new project
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      platformTargets,
      aspectRatio,
      locale,
      duration,
    } = body

    // Create project
    const { data: project, error } = await supabase
      .from('video_projects')
      .insert({
        title: title || 'Novo Projeto',
        description,
        platform_targets: platformTargets || ['youtube'],
        aspect_ratio: aspectRatio || '16:9',
        locale: locale || 'pt-BR',
        duration: duration || 60,
        status: 'draft',
        user_id: user.id,
        timeline: {
          duration: duration || 60,
          tracks: [
            {
              id: 'video-1',
              name: 'Vídeo 1',
              type: 'video',
              clips: [],
              locked: false,
              visible: true,
              volume: 1,
            },
            {
              id: 'audio-1',
              name: 'Áudio 1',
              type: 'audio',
              clips: [],
              locked: false,
              visible: true,
              volume: 1,
            },
            {
              id: 'text-1',
              name: 'Texto',
              type: 'text',
              clips: [],
              locked: false,
              visible: true,
              volume: 1,
            },
          ],
        },
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ project }, { status: 201 })

  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
