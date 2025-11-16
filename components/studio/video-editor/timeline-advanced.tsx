'use client'

import { forwardRef, useState } from 'react'
import { Timeline as TimelineType, VideoProject, TimelineClip, Track } from '@/types/studio'
import { motion } from 'framer-motion'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Lock, Eye, EyeOff, Volume2, VolumeX, GripVertical } from 'lucide-react'
import { ClipEditor } from './clip-editor'

interface TimelineAdvancedProps {
  project: VideoProject
  currentTime: number
  zoom: number
  selectedClip: string | null
  onClipSelect: (clipId: string | null) => void
  onClipUpdate: (clipId: string, updates: Partial<TimelineClip>) => void
  onClipDelete: (clipId: string) => void
  onClipDuplicate: (clipId: string) => void
  onClipSplit: (clipId: string, splitTime: number) => void
  onTimelineChange: (timeline: VideoProject['timeline']) => void
  onZoomChange: (zoom: number) => void
}

export const Timeline = forwardRef<HTMLDivElement, TimelineAdvancedProps>(
  function Timeline(props, ref) {
    const { 
      project, 
      currentTime, 
      zoom, 
      selectedClip, 
      onClipSelect, 
      onClipUpdate, 
      onClipDelete,
      onClipDuplicate,
      onClipSplit,
      onTimelineChange, 
      onZoomChange 
    } = props

    const pixelsPerSecond = 50 * zoom
    const timeToPixels = (time: number) => time * pixelsPerSecond

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    )

    const handleDragEnd = (event: DragEndEvent, trackId: string) => {
      const { active, over } = event
      
      if (!over || active.id === over.id) return

      const track = project.timeline.tracks.find(t => t.id === trackId)
      if (!track) return

      const oldIndex = track.clips.findIndex(c => c.id === active.id)
      const newIndex = track.clips.findIndex(c => c.id === over.id)

      const newClips = arrayMove(track.clips, oldIndex, newIndex)
      
      // Update timeline
      const newTracks = project.timeline.tracks.map(t =>
        t.id === trackId ? { ...t, clips: newClips } : t
      )

      onTimelineChange({
        ...project.timeline,
        tracks: newTracks,
      })
    }

    return (
      <div ref={ref} className="h-64 bg-gray-800 border-t border-gray-700 flex flex-col">
        {/* Timeline Header */}
        <div className="h-10 bg-gray-850 border-b border-gray-700 flex items-center px-4">
          <span className="text-xs font-medium text-gray-400">Timeline</span>
          <div className="flex-1" />
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
              className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600 text-white"
            >
              -
            </button>
            <span className="text-xs text-gray-400 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(2, zoom + 0.25))}
              className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600 text-white"
            >
              +
            </button>
          </div>
        </div>

        {/* Tracks Container */}
        <div className="flex-1 overflow-auto relative">
          {/* Time Ruler */}
          <TimeRuler duration={project.duration} pixelsPerSecond={pixelsPerSecond} />

          {/* Playhead */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none"
            style={{ left: timeToPixels(currentTime) }}
            initial={false}
            animate={{ left: timeToPixels(currentTime) }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1" />
          </motion.div>

          {/* Tracks */}
          <div className="p-4 space-y-2">
            {project.timeline.tracks.map((track) => (
              <DndContext
                key={track.id}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, track.id)}
              >
                <TrackRow
                  track={track}
                  pixelsPerSecond={pixelsPerSecond}
                  selectedClip={selectedClip}
                  currentTime={currentTime}
                  onClipSelect={onClipSelect}
                  onClipUpdate={onClipUpdate}
                  onClipDelete={onClipDelete}
                  onClipDuplicate={onClipDuplicate}
                  onClipSplit={onClipSplit}
                />
              </DndContext>
            ))}
          </div>
        </div>
      </div>
    )
  }
)

function TimeRuler({ duration, pixelsPerSecond }: { duration: number; pixelsPerSecond: number }) {
  const markers = []
  const interval = 5 // markers every 5 seconds
  
  for (let i = 0; i <= duration; i += interval) {
    markers.push(i)
  }

  return (
    <div className="h-6 bg-gray-850 border-b border-gray-700 relative">
      {markers.map((time) => (
        <div
          key={time}
          className="absolute top-0 bottom-0 flex flex-col items-start"
          style={{ left: time * pixelsPerSecond }}
        >
          <div className="w-px h-2 bg-gray-600" />
          <span className="text-xs text-gray-500 ml-1">{formatTime(time)}</span>
        </div>
      ))}
    </div>
  )
}

function TrackRow({
  track,
  pixelsPerSecond,
  selectedClip,
  currentTime,
  onClipSelect,
  onClipUpdate,
  onClipDelete,
  onClipDuplicate,
  onClipSplit,
}: {
  track: Track
  pixelsPerSecond: number
  selectedClip: string | null
  currentTime: number
  onClipSelect: (clipId: string | null) => void
  onClipUpdate: (clipId: string, updates: any) => void
  onClipDelete: (clipId: string) => void
  onClipDuplicate: (clipId: string) => void
  onClipSplit: (clipId: string, splitTime: number) => void
}) {
  const [isLocked, setIsLocked] = useState(track.locked)
  const [isVisible, setIsVisible] = useState(track.visible)
  const [isMuted, setIsMuted] = useState(track.volume === 0)

  return (
    <div className="flex items-center gap-2">
      {/* Track Controls */}
      <div className="w-32 flex items-center gap-1 px-2 py-1 bg-gray-750 rounded text-xs flex-shrink-0">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-1 rounded ${isLocked ? 'text-orange-500' : 'text-gray-400 hover:text-white'}`}
          title={isLocked ? 'Unlock track' : 'Lock track'}
        >
          <Lock className="w-3 h-3" />
        </button>
        
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`p-1 rounded ${!isVisible ? 'text-orange-500' : 'text-gray-400 hover:text-white'}`}
          title={isVisible ? 'Hide track' : 'Show track'}
        >
          {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>

        {track.type === 'audio' && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1 rounded ${isMuted ? 'text-orange-500' : 'text-gray-400 hover:text-white'}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
        )}

        <span className="flex-1 truncate text-gray-300">{track.name}</span>
      </div>

      {/* Clips Container */}
      <div className="flex-1 h-16 bg-gray-750 rounded relative">
        <SortableContext
          items={track.clips.map(c => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {track.clips.map((clip) => (
            <ClipEditor
              key={clip.id}
              clip={clip}
              trackId={track.id}
              zoom={1}
              onUpdate={onClipUpdate}
              onDelete={onClipDelete}
              onDuplicate={onClipDuplicate}
              onSplit={onClipSplit}
              onSelect={onClipSelect}
              isSelected={selectedClip === clip.id}
              currentTime={currentTime}
            />
          ))}
        </SortableContext>

        {track.clips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600">
            Arraste assets aqui
          </div>
        )}
      </div>
    </div>
  )
}

function DraggableClip({
  clip,
  pixelsPerSecond,
  isSelected,
  isLocked,
  onSelect,
  onUpdate,
}: {
  clip: TimelineClip
  pixelsPerSecond: number
  isSelected: boolean
  isLocked: boolean
  onSelect: () => void
  onUpdate: (updates: any) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: clip.id, disabled: isLocked })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const clipWidth = (clip.endTime - clip.startTime) * pixelsPerSecond
  const clipPosition = clip.startTime * pixelsPerSecond

  return (
    <div
      ref={setNodeRef}
      className={`
        absolute h-12 rounded cursor-move transition-all flex items-center px-2 gap-1
        ${isDragging ? 'opacity-50 z-50' : 'z-10'}
        ${isSelected 
          ? 'bg-orange-500 ring-2 ring-orange-400' 
          : 'bg-blue-500 hover:bg-blue-400'
        }
        ${isLocked ? 'cursor-not-allowed opacity-50' : ''}
      `}
      style={{
        ...style,
        left: clipPosition,
        width: clipWidth,
        top: '50%',
        transform: `translateY(-50%) ${style.transform || ''}`,
      }}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="w-3 h-3 text-white/50 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white font-medium truncate">{clip.name}</p>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
