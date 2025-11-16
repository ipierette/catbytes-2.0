'use client'

import { useState, useEffect } from 'react'
import { Upload, Image, Video, Music, FileText, Plus } from 'lucide-react'
import { Asset } from '@/types/studio'
import { createClient } from '@/lib/supabase/client'
import { AssetUploader } from '../asset-uploader'
import { motion, AnimatePresence } from 'framer-motion'

interface AssetLibraryProps {
  projectId: string
  onAssetSelect: (asset: Asset) => void
}

export function AssetLibrary({ projectId, onAssetSelect }: AssetLibraryProps) {
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'audio'>('images')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadAssets()
  }, [activeTab])

  const loadAssets = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('studio_assets')
        .select('*')
        .eq('type', activeTab === 'images' ? 'image' : activeTab === 'videos' ? 'video' : 'audio')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Load assets error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (newAssets: any[]) => {
    setAssets(prev => [...newAssets, ...prev])
    setShowUploader(false)
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-12 bg-gray-850 border-b border-gray-700 flex items-center px-4">
        <span className="text-sm font-medium text-gray-300">Biblioteca</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <TabButton
          active={activeTab === 'images'}
          onClick={() => setActiveTab('images')}
          icon={<Image className="w-4 h-4" />}
          label="Imagens"
        />
        <TabButton
          active={activeTab === 'videos'}
          onClick={() => setActiveTab('videos')}
          icon={<Video className="w-4 h-4" />}
          label="Vídeos"
        />
        <TabButton
          active={activeTab === 'audio'}
          onClick={() => setActiveTab('audio')}
          icon={<Music className="w-4 h-4" />}
          label="Áudio"
        />
      </div>

      {/* Upload Button */}
      <div className="p-4 border-b border-gray-700">
        <button 
          onClick={() => setShowUploader(!showUploader)}
          className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload {activeTab === 'images' ? 'Imagens' : activeTab === 'videos' ? 'Vídeos' : 'Áudio'}
        </button>
      </div>

      {/* Uploader */}
      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-700 p-4"
          >
            <AssetUploader
              projectId={projectId}
              type={activeTab === 'images' ? 'image' : activeTab === 'videos' ? 'video' : 'audio'}
              onUploadComplete={handleUploadComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-gray-500 text-sm text-center py-8">
            Carregando...
          </div>
        ) : assets.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            Nenhum asset ainda
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <AssetThumbnail
                key={asset.id}
                asset={asset}
                onClick={() => onAssetSelect(asset)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors
        ${active 
          ? 'text-white bg-gray-700' 
          : 'text-gray-400 hover:text-white'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}

function AssetThumbnail({ asset, onClick }: { asset: Asset; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="aspect-square rounded-lg overflow-hidden bg-gray-700 hover:ring-2 hover:ring-orange-500 transition-all group relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {asset.thumbnail ? (
        <img 
          src={asset.thumbnail} 
          alt={asset.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {asset.type === 'video' && <Video className="w-8 h-8 text-gray-500" />}
          {asset.type === 'image' && <Image className="w-8 h-8 text-gray-500" />}
          {asset.type === 'audio' && <Music className="w-8 h-8 text-gray-500" />}
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
        <p className="text-xs text-white truncate">{asset.name}</p>
      </div>
    </motion.button>
  )
}
