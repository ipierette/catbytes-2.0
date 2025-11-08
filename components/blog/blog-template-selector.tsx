'use client'

import { useState } from 'react'
import { BlogPost } from '@/types/blog'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  ImageIcon,
  Columns2,
  BookOpen,
  Sparkles
} from 'lucide-react'

export type TemplateType = 'traditional' | 'visual-duo' | 'editorial' | 'final-emphasis'

interface BlogTemplateSelectorProps {
  post: BlogPost
  onTemplateSelect: (template: TemplateType) => void
  selectedTemplate?: TemplateType
}

const templates = [
  {
    id: 'traditional' as TemplateType,
    name: 'Tradicional Vertical',
    description: 'Capa no topo + 1 imagem centralizada',
    icon: FileText,
    preview: 'Simples e limpo, ideal para tutoriais',
    images: { cover: true, body: 1 }
  },
  {
    id: 'visual-duo' as TemplateType,
    name: 'Visual Duplo',
    description: 'Capa no topo + 2 imagens lado a lado',
    icon: Columns2,
    preview: 'Perfeito para reviews e comparações',
    images: { cover: true, body: 2 }
  },
  {
    id: 'editorial' as TemplateType,
    name: 'Narrativo Editorial',
    description: 'Capa overlay + 1 imagem lateral',
    icon: BookOpen,
    preview: 'Sofisticado para storytelling',
    images: { cover: true, body: 1 }
  },
  {
    id: 'final-emphasis' as TemplateType,
    name: 'Imagem Final com Ênfase',
    description: 'Capa no topo + 1 imagem final destacada',
    icon: ImageIcon,
    preview: 'Ideal para artigos reflexivos',
    images: { cover: true, body: 1 }
  }
]

export function BlogTemplateSelector({ 
  post, 
  onTemplateSelect, 
  selectedTemplate 
}: BlogTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-emerald-400">
        <Sparkles className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Escolha o Template de Publicação</h3>
      </div>

      <p className="text-sm text-slate-400">
        📸 Todos os templates exigem <strong className="text-emerald-400">1 imagem de capa</strong> (sempre no topo) 
        + <strong className="text-emerald-400">1 ou 2 imagens no corpo</strong> do texto
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const Icon = template.icon
          const isSelected = selectedTemplate === template.id

          return (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template.id)}
              className={`
                relative p-6 rounded-xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-emerald-500 bg-emerald-900/30 shadow-lg shadow-emerald-500/20' 
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  p-3 rounded-lg
                  ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {template.name}
                  </h4>
                  <p className="text-sm text-slate-400 mb-2">
                    {template.description}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    {template.preview}
                  </p>
                  
                  {/* Image requirements */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded border border-purple-700/50">
                      📸 Capa
                    </span>
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded border border-blue-700/50">
                      🖼️ {template.images.body} {template.images.body === 1 ? 'imagem' : 'imagens'} corpo
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
