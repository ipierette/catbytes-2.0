'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Scissors, Copy, Trash2, Undo, Redo, Download,
  Grid, Maximize, ZoomIn, ZoomOut, Layers, Save
} from 'lucide-react'
import { VideoProject, EditorState } from '@/types/studio'
import { Timeline } from './timeline'
import { PreviewCanvas } from './preview-canvas'
import { AssetLibrary } from './asset-library'
import { PropertiesPanel } from './properties-panel'
import { PlaybackControls } from './playback-controls'
import { EditorToolbar } from './toolbar'
import { EffectsPanel } from './effects-panel'
import { VideoRenderer } from '../video-renderer'
import { SocialPublisher } from '../social-publisher'

interface VideoEditorProps {
  projectId: string
  initialProject?: VideoProject
}

export function VideoEditor({ projectId, initialProject }: VideoEditorProps) {
  // Editor State
  const [editorState, setEditorState] = useState<EditorState>({
    project: initialProject || createEmptyProject(projectId),
    currentTime: 0,
    isPlaying: false,
    selectedClip: null,
    timelineZoom: 1,
    previewQuality: '720p',
    showGrid: true,
    showSafeZones: true,
    history: [initialProject || createEmptyProject(projectId)],
    historyIndex: 0,
  })

  const [showEffectsPanel, setShowEffectsPanel] = useState(false)
  const [showRenderer, setShowRenderer] = useState(false)
  const [showPublisher, setShowPublisher] = useState(false)
  const [completedRenderId, setCompletedRenderId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // ===== HISTORY MANAGEMENT =====
  const handleUndo = useCallback(() => {
    if (editorState.historyIndex > 0) {
      setEditorState(prev => ({
        ...prev,
        historyIndex: prev.historyIndex - 1,
        project: prev.history[prev.historyIndex - 1],
      }))
    }
  }, [editorState.historyIndex])

  const handleRedo = useCallback(() => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      setEditorState(prev => ({
        ...prev,
        historyIndex: prev.historyIndex + 1,
        project: prev.history[prev.historyIndex + 1],
      }))
    }
  }, [editorState.historyIndex, editorState.history.length])

  const addToHistory = useCallback((newProject: VideoProject) => {
    setEditorState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1)
      newHistory.push(newProject)
      return {
        ...prev,
        project: newProject,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      }
    })
  }, [])

  // ===== PLAYBACK CONTROLS =====
  const togglePlay = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }))
  }, [])

  const handleSeek = useCallback((time: number) => {
    setEditorState(prev => ({
      ...prev,
      currentTime: time,
      isPlaying: false,
    }))
  }, [])

  // ===== CLIP OPERATIONS =====
  const handleClipDelete = useCallback((clipId: string) => {
    const updatedTracks = editorState.project.timeline.tracks.map(track => ({
      ...track,
      clips: track.clips.filter(clip => clip.id !== clipId),
    }))

    const updatedProject = {
      ...editorState.project,
      timeline: { ...editorState.project.timeline, tracks: updatedTracks },
    }
    
    addToHistory(updatedProject)
  }, [editorState.project, addToHistory])

  const handleClipDuplicate = useCallback((clipId: string) => {
    const updatedTracks = editorState.project.timeline.tracks.map(track => {
      const clipIndex = track.clips.findIndex(c => c.id === clipId)
      if (clipIndex === -1) return track

      const originalClip = track.clips[clipIndex]
      const newClip = {
        ...originalClip,
        id: `${clipId}-copy-${Date.now()}`,
        startTime: originalClip.endTime,
        endTime: originalClip.endTime + (originalClip.endTime - originalClip.startTime),
      }

      return {
        ...track,
        clips: [...track.clips.slice(0, clipIndex + 1), newClip, ...track.clips.slice(clipIndex + 1)],
      }
    })

    const updatedProject = {
      ...editorState.project,
      timeline: { ...editorState.project.timeline, tracks: updatedTracks },
    }
    
    addToHistory(updatedProject)
  }, [editorState.project, addToHistory])

  const handleClipSplit = useCallback((clipId: string, splitTime: number) => {
    const updatedTracks = editorState.project.timeline.tracks.map(track => {
      const clipIndex = track.clips.findIndex(c => c.id === clipId)
      if (clipIndex === -1) return track

      const originalClip = track.clips[clipIndex]
      
      const firstClip = {
        ...originalClip,
        endTime: splitTime,
      }

      const secondClip = {
        ...originalClip,
        id: `${clipId}-split-${Date.now()}`,
        startTime: splitTime,
      }

      return {
        ...track,
        clips: [
          ...track.clips.slice(0, clipIndex),
          firstClip,
          secondClip,
          ...track.clips.slice(clipIndex + 1),
        ],
      }
    })

    const updatedProject = {
      ...editorState.project,
      timeline: { ...editorState.project.timeline, tracks: updatedTracks },
    }
    
    addToHistory(updatedProject)
  }, [editorState.project, addToHistory])

  // ===== SAVE PROJECT =====
  const handleSave = useCallback(async () => {
    try {
      const response = await fetch(`/api/studio/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editorState.project),
      })

      if (response.ok) {
        // TODO: Show success toast
        console.log('Project saved successfully')
      }
    } catch (error) {
      console.error('Failed to save project:', error)
      // TODO: Show error toast
    }
  }, [projectId, editorState.project])

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Toolbar */}
      <EditorToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onToggleEffects={() => setShowEffectsPanel(!showEffectsPanel)}
        onExport={() => setShowRenderer(true)}
        canUndo={editorState.historyIndex > 0}
        canRedo={editorState.historyIndex < editorState.history.length - 1}
        showEffects={showEffectsPanel}
        project={editorState.project}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Asset Library */}
        <AssetLibrary
          projectId={projectId}
          onAssetSelect={(asset) => {
            console.log('Asset selected:', asset)
            // TODO: Add to timeline
          }}
        />

        {/* Center - Preview Canvas */}
        <div className="flex-1 flex flex-col">
          <PreviewCanvas
            ref={canvasRef}
            project={editorState.project}
            currentTime={editorState.currentTime}
            isPlaying={editorState.isPlaying}
            quality={editorState.previewQuality}
            showGrid={editorState.showGrid}
            showSafeZones={editorState.showSafeZones}
            onTimeUpdate={(time) => setEditorState(prev => ({ ...prev, currentTime: time }))}
            onQualityChange={(quality) => setEditorState(prev => ({ ...prev, previewQuality: quality }))}
            onToggleGrid={() => setEditorState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            onToggleSafeZones={() => setEditorState(prev => ({ ...prev, showSafeZones: !prev.showSafeZones }))}
          />

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={editorState.isPlaying}
            currentTime={editorState.currentTime}
            duration={editorState.project.duration}
            onPlay={togglePlay}
            onPause={togglePlay}
            onSeek={handleSeek}
          />
        </div>

        {/* Middle Sidebar - Effects Panel (Collapsible) */}
        {showEffectsPanel && (
          <div className="w-72 border-l border-gray-800">
            <EffectsPanel
              onApplyEffect={(effect) => {
                console.log('Apply effect:', effect)
                // TODO: Apply effect to selected clip
              }}
            />
          </div>
        )}

        {/* Right Sidebar - Properties Panel */}
        <PropertiesPanel
          selectedClip={editorState.selectedClip}
          project={editorState.project}
          onUpdate={(updates) => {
            // TODO: Update clip properties
            console.log('Property updates:', updates)
          }}
        />
      </div>

      {/* Bottom - Timeline */}
      <Timeline
        ref={timelineRef}
        project={editorState.project}
        currentTime={editorState.currentTime}
        zoom={editorState.timelineZoom}
        selectedClip={editorState.selectedClip}
        onClipSelect={(clipId) => setEditorState(prev => ({ ...prev, selectedClip: clipId }))}
        onClipUpdate={(clipId, updates) => {
          const updatedTracks = editorState.project.timeline.tracks.map(track => ({
            ...track,
            clips: track.clips.map(clip =>
              clip.id === clipId ? { ...clip, ...updates } : clip
            ),
          }))
          const updatedProject = {
            ...editorState.project,
            timeline: { ...editorState.project.timeline, tracks: updatedTracks },
          }
          addToHistory(updatedProject)
        }}
        onClipDelete={handleClipDelete}
        onClipDuplicate={handleClipDuplicate}
        onClipSplit={handleClipSplit}
        onTimelineChange={(newTimeline) => {
          const updatedProject = { ...editorState.project, timeline: newTimeline }
          addToHistory(updatedProject)
        }}
        onZoomChange={(zoom) => setEditorState(prev => ({ ...prev, timelineZoom: zoom }))}
      />

      {/* Video Renderer Modal */}
      <AnimatePresence>
        {showRenderer && (
          <VideoRenderer
            projectId={projectId}
            projectTitle={editorState.project.title}
            onClose={() => setShowRenderer(false)}
            onRenderComplete={(renderId) => {
              setCompletedRenderId(renderId)
              setShowRenderer(false)
              setShowPublisher(true)
            }}
          />
        )}
      </AnimatePresence>

      {/* Social Publisher Modal */}
      <AnimatePresence>
        {showPublisher && completedRenderId && (
          <SocialPublisher
            renderId={completedRenderId}
            projectTitle={editorState.project.title}
            onClose={() => {
              setShowPublisher(false)
              setCompletedRenderId(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ===== HELPER: CREATE EMPTY PROJECT =====
function createEmptyProject(projectId: string): VideoProject {
  return {
    id: projectId,
    title: 'Novo Projeto',
    status: 'draft',
    platformTargets: ['youtube'],
    aspectRatio: '16:9',
    locale: 'pt-BR',
    duration: 60,
    timeline: {
      duration: 60,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
