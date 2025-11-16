'use client'

import { VideoProject } from '@/types/studio'
import { Sliders } from 'lucide-react'

interface PropertiesPanelProps {
  selectedClip: string | null
  project: VideoProject
  onUpdate: (updates: any) => void
}

export function PropertiesPanel({ selectedClip, project, onUpdate }: PropertiesPanelProps) {
  if (!selectedClip) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="h-12 bg-gray-850 border-b border-gray-700 flex items-center px-4">
          <span className="text-sm font-medium text-gray-300">Propriedades</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Sliders className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-sm">Selecione um clip</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="h-12 bg-gray-850 border-b border-gray-700 flex items-center px-4">
        <span className="text-sm font-medium text-gray-300">Propriedades</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <PropertyGroup title="Posição">
            <PropertySlider label="X" value={0} onChange={() => {}} />
            <PropertySlider label="Y" value={0} onChange={() => {}} />
          </PropertyGroup>

          <PropertyGroup title="Transformação">
            <PropertySlider label="Escala" value={100} onChange={() => {}} />
            <PropertySlider label="Rotação" value={0} onChange={() => {}} />
            <PropertySlider label="Opacidade" value={100} onChange={() => {}} />
          </PropertyGroup>
        </div>
      </div>
    </div>
  )
}

function PropertyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-400 uppercase">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function PropertySlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}
