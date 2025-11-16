'use client'

import { Undo, Redo, Save, Download, Share2, Settings, Wand2 } from 'lucide-react'
import { VideoProject } from '@/types/studio'
import { motion } from 'framer-motion'

interface EditorToolbarProps {
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onToggleEffects?: () => void
  onExport?: () => void
  canUndo: boolean
  canRedo: boolean
  showEffects?: boolean
  project: VideoProject
}

export function EditorToolbar({
  onUndo,
  onRedo,
  onSave,
  onToggleEffects,
  onExport,
  canUndo,
  canRedo,
  showEffects = false,
  project,
}: EditorToolbarProps) {
  return (
    <div className="h-14 bg-gray-950 border-b border-gray-800 flex items-center px-4 gap-2">
      {/* Project Title */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={project.title}
          className="bg-transparent text-white font-medium text-sm px-2 py-1 rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Nome do projeto"
        />
        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">
          {project.status}
        </span>
      </div>

      <div className="flex-1" />

      {/* Edit Tools */}
      <div className="flex items-center gap-1">
        <ToolButton
          icon={<Undo className="w-4 h-4" />}
          onClick={onUndo}
          disabled={!canUndo}
          tooltip="Desfazer (Cmd+Z)"
        />
        <ToolButton
          icon={<Redo className="w-4 h-4" />}
          onClick={onRedo}
          disabled={!canRedo}
          tooltip="Refazer (Cmd+Shift+Z)"
        />
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Toggle Effects */}
      {onToggleEffects && (
        <>
          <ToolButton
            icon={<Wand2 className="w-4 h-4" />}
            onClick={onToggleEffects}
            tooltip="Efeitos & Transições"
            active={showEffects}
          />
          <div className="w-px h-6 bg-gray-700" />
        </>
      )}

      {/* Action Buttons */}
      <ToolButton
        icon={<Save className="w-4 h-4" />}
        onClick={onSave}
        tooltip="Salvar (Cmd+S)"
      />
      {onExport && (
        <ToolButton
          icon={<Download className="w-4 h-4" />}
          onClick={onExport}
          tooltip="Exportar vídeo"
        />
      )}
      <ToolButton
        icon={<Share2 className="w-4 h-4" />}
        onClick={() => console.log('Share')}
        tooltip="Compartilhar"
      />
      <ToolButton
        icon={<Settings className="w-4 h-4" />}
        onClick={() => console.log('Settings')}
        tooltip="Configurações"
      />
    </div>
  )
}

function ToolButton({
  icon,
  onClick,
  disabled = false,
  active = false,
  tooltip,
}: {
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  tooltip?: string
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2 rounded transition-colors
        ${disabled 
          ? 'text-gray-600 cursor-not-allowed' 
          : active
          ? 'text-white bg-orange-500 hover:bg-orange-600'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      title={tooltip}
    >
      {icon}
    </motion.button>
  )
}
