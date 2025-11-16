'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { VideoProject } from '@/types/studio'
import { Grid, Eye, EyeOff, Maximize2 } from 'lucide-react'

interface PreviewCanvasProps {
  project: VideoProject
  currentTime: number
  isPlaying: boolean
  quality: '360p' | '720p' | '1080p'
  showGrid: boolean
  showSafeZones: boolean
  onTimeUpdate: (time: number) => void
  onQualityChange: (quality: '360p' | '720p' | '1080p') => void
  onToggleGrid: () => void
  onToggleSafeZones: () => void
}

export const PreviewCanvas = forwardRef<HTMLCanvasElement, PreviewCanvasProps>(
  function PreviewCanvas(props, ref) {
    const {
      project,
      currentTime,
      isPlaying,
      quality,
      showGrid,
      showSafeZones,
      onQualityChange,
      onToggleGrid,
      onToggleSafeZones,
    } = props

    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw placeholder
      ctx.fillStyle = '#374151'
      ctx.font = '24px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Preview Canvas', canvas.width / 2, canvas.height / 2)

      // Draw grid if enabled
      if (showGrid) {
        drawGrid(ctx, canvas.width, canvas.height)
      }

      // Draw safe zones if enabled
      if (showSafeZones) {
        drawSafeZones(ctx, canvas.width, canvas.height)
      }
    }, [currentTime, showGrid, showSafeZones])

    return (
      <div className="flex-1 bg-black relative flex flex-col">
        {/* Preview Controls */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
          <select
            value={quality}
            onChange={(e) => onQualityChange(e.target.value as any)}
            className="px-2 py-1 bg-gray-700 rounded text-xs text-white"
          >
            <option value="360p">360p (Draft)</option>
            <option value="720p">720p (Preview)</option>
            <option value="1080p">1080p (Full)</option>
          </select>

          <select
            value={project.aspectRatio}
            className="px-2 py-1 bg-gray-700 rounded text-xs text-white"
          >
            <option value="16:9">16:9 (YouTube)</option>
            <option value="9:16">9:16 (TikTok/IG)</option>
            <option value="1:1">1:1 (LinkedIn)</option>
          </select>

          <div className="flex-1" />

          <button
            onClick={onToggleGrid}
            className={`p-1.5 rounded ${showGrid ? 'bg-orange-500' : 'bg-gray-700'}`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={onToggleSafeZones}
            className={`p-1.5 rounded ${showSafeZones ? 'bg-orange-500' : 'bg-gray-700'}`}
            title="Toggle Safe Zones"
          >
            {showSafeZones ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
          </button>

          <button className="p-1.5 rounded bg-gray-700" title="Fullscreen">
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-8">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full shadow-2xl"
            width={1920}
            height={1080}
          />
        </div>

        {/* Timecode Display */}
        <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 rounded font-mono text-sm text-white">
          {formatTimecode(currentTime)}
        </div>
      </div>
    )
  }
)

function formatTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const f = Math.floor((seconds % 1) * 30) // 30fps
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1

  // Vertical lines
  for (let x = 0; x < width; x += width / 12) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y < height; y += height / 12) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

function drawSafeZones(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const margin = 0.1 // 10% margin

  ctx.strokeStyle = 'rgba(255, 165, 0, 0.5)'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])

  ctx.strokeRect(
    width * margin,
    height * margin,
    width * (1 - 2 * margin),
    height * (1 - 2 * margin)
  )

  ctx.setLineDash([])
}
