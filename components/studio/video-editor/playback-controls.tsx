'use client'

import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface PlaybackControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
}

export function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
}: PlaybackControlsProps) {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value))
  }

  return (
    <div className="h-16 bg-gray-850 border-t border-gray-700 flex items-center px-6 gap-4">
      {/* Play/Pause Button */}
      <motion.button
        onClick={isPlaying ? onPause : onPlay}
        className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" fill="white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
        )}
      </motion.button>

      {/* Skip Buttons */}
      <button className="p-2 text-gray-400 hover:text-white transition-colors">
        <SkipBack className="w-5 h-5" />
      </button>
      <button className="p-2 text-gray-400 hover:text-white transition-colors">
        <SkipForward className="w-5 h-5" />
      </button>

      {/* Timecode */}
      <div className="text-sm text-gray-400 font-mono">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Seek Bar */}
      <div className="flex-1">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="80"
          className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
