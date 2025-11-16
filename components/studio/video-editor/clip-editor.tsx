'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Scissors, Copy, Trash2, GripHorizontal } from 'lucide-react'
import { TimelineClip } from '@/types/studio'

interface ClipEditorProps {
  clip: TimelineClip
  trackId: string
  zoom: number
  onUpdate: (clipId: string, updates: Partial<TimelineClip>) => void
  onDelete: (clipId: string) => void
  onDuplicate: (clipId: string) => void
  onSplit: (clipId: string, splitTime: number) => void
  onSelect: (clipId: string) => void
  isSelected: boolean
  currentTime: number
}

export function ClipEditor({
  clip,
  trackId,
  zoom,
  onUpdate,
  onDelete,
  onDuplicate,
  onSplit,
  onSelect,
  isSelected,
  currentTime,
}: ClipEditorProps) {
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const clipRef = useRef<HTMLDivElement>(null)

  const duration = clip.endTime - clip.startTime
  const pixelsPerSecond = 100 * zoom
  const clipWidth = duration * pixelsPerSecond
  const clipLeft = clip.startTime * pixelsPerSecond

  // ===== TRIM HANDLES =====
  useEffect(() => {
    if (!isResizingLeft && !isResizingRight) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.movementX
      const deltaTime = deltaX / pixelsPerSecond

      if (isResizingLeft) {
        const newStartTime = Math.max(0, clip.startTime + deltaTime)
        const minDuration = 0.1 // Minimum 0.1 seconds
        
        if (clip.endTime - newStartTime >= minDuration) {
          onUpdate(clip.id, { startTime: newStartTime })
        }
      } else if (isResizingRight) {
        const newEndTime = Math.max(clip.startTime + 0.1, clip.endTime + deltaTime)
        onUpdate(clip.id, { endTime: newEndTime })
      }
    }

    const handleMouseUp = () => {
      setIsResizingLeft(false)
      setIsResizingRight(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingLeft, isResizingRight, clip, pixelsPerSecond, onUpdate])

  // ===== CONTEXT MENU =====
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowContextMenu(true)
    onSelect(clip.id)
  }

  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false)
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showContextMenu])

  // ===== SPLIT AT CURRENT TIME =====
  const handleSplitAtPlayhead = () => {
    if (currentTime > clip.startTime && currentTime < clip.endTime) {
      onSplit(clip.id, currentTime)
    }
    setShowContextMenu(false)
  }

  const canSplit = currentTime > clip.startTime && currentTime < clip.endTime

  return (
    <>
      <motion.div
        ref={clipRef}
        onClick={() => onSelect(clip.id)}
        onContextMenu={handleContextMenu}
        className={`
          absolute h-12 rounded-lg overflow-hidden cursor-move group
          ${isSelected ? 'ring-2 ring-orange-500' : ''}
        `}
        style={{
          left: `${clipLeft}px`,
          width: `${clipWidth}px`,
          backgroundColor: clip.color || '#3b82f6',
        }}
        whileHover={{ y: -2 }}
        layout
      >
        {/* Clip Content */}
        <div className="h-full px-2 flex items-center justify-between text-white text-xs font-medium">
          <div className="flex items-center gap-1 truncate">
            <GripHorizontal className="w-3 h-3 opacity-50" />
            <span className="truncate">{clip.assetId || 'Clip'}</span>
          </div>
          <span className="opacity-70">{duration.toFixed(1)}s</span>
        </div>

        {/* Left Trim Handle */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation()
            setIsResizingLeft(true)
          }}
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
        </div>

        {/* Right Trim Handle */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation()
            setIsResizingRight(true)
          }}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l" />
        </div>

        {/* Playhead Indicator */}
        {currentTime >= clip.startTime && currentTime <= clip.endTime && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-orange-500"
            style={{
              left: `${(currentTime - clip.startTime) * pixelsPerSecond}px`,
            }}
          />
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-orange-500 rounded-lg pointer-events-none" />
        )}
      </motion.div>

      {/* Context Menu */}
      {showContextMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50"
          style={{
            left: clipRef.current?.getBoundingClientRect().left,
            top: (clipRef.current?.getBoundingClientRect().top || 0) - 150,
          }}
        >
          <ContextMenuItem
            icon={<Scissors className="w-4 h-4" />}
            label="Dividir no Playhead"
            onClick={handleSplitAtPlayhead}
            disabled={!canSplit}
          />
          <ContextMenuItem
            icon={<Copy className="w-4 h-4" />}
            label="Duplicar"
            onClick={() => {
              onDuplicate(clip.id)
              setShowContextMenu(false)
            }}
          />
          <div className="h-px bg-gray-700 my-1" />
          <ContextMenuItem
            icon={<Trash2 className="w-4 h-4" />}
            label="Deletar"
            onClick={() => {
              onDelete(clip.id)
              setShowContextMenu(false)
            }}
            danger
          />
        </motion.div>
      )}
    </>
  )
}

// ===== CONTEXT MENU ITEM =====
function ContextMenuItem({
  icon,
  label,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full px-4 py-2 flex items-center gap-3 text-sm transition-colors
        ${disabled
          ? 'text-gray-600 cursor-not-allowed'
          : danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-white hover:bg-gray-700'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}
