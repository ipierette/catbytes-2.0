'use client'

import { forwardRef } from 'react'
import { Timeline as TimelineType, VideoProject } from '@/types/studio'

interface TimelineProps {
  project: VideoProject
  currentTime: number
  zoom: number
  selectedClip: string | null
  onClipSelect: (clipId: string | null) => void
  onClipUpdate: (clipId: string, updates: any) => void
  onClipDelete?: (clipId: string) => void
  onClipDuplicate?: (clipId: string) => void
  onClipSplit?: (clipId: string, splitTime: number) => void
  onTimelineChange: (timeline: TimelineType) => void
  onZoomChange: (zoom: number) => void
}

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  function Timeline(props, ref) {
    const { project, currentTime, zoom } = props

    return (
      <div ref={ref} className="h-64 bg-gray-800 border-t border-gray-700 flex flex-col">
        {/* Timeline Header */}
        <div className="h-10 bg-gray-850 border-b border-gray-700 flex items-center px-4">
          <span className="text-xs font-medium text-gray-400">Timeline</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => props.onZoomChange(Math.max(0.5, zoom - 0.25))}
              className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
            >
              -
            </button>
            <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => props.onZoomChange(Math.min(2, zoom + 0.25))}
              className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
            >
              +
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="text-gray-500 text-sm text-center py-8">
            Timeline vazio - Arraste assets da biblioteca
          </div>
        </div>
      </div>
    )
  }
)
