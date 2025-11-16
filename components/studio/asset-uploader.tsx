'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileVideo, Image as ImageIcon, Music, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadedFile {
  id: string
  file: File
  preview?: string
  status: 'uploading' | 'success' | 'error'
  progress: number
  url?: string
  error?: string
}

interface AssetUploaderProps {
  projectId: string
  type: 'image' | 'video' | 'audio'
  onUploadComplete: (assets: any[]) => void
  maxFiles?: number
}

export function AssetUploader({ projectId, type, onUploadComplete, maxFiles = 10 }: AssetUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const acceptedTypes = {
    image: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    video: { 'video/*': ['.mp4', '.mov', '.avi', '.webm'] },
    audio: { 'audio/*': ['.mp3', '.wav', '.aac', '.m4a'] },
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: type === 'image' ? URL.createObjectURL(file) : undefined,
      status: 'uploading' as const,
      progress: 0,
    }))

    setFiles(prev => [...prev, ...newFiles])
    setIsUploading(true)

    // Upload each file
    const uploadedAssets = await Promise.all(
      newFiles.map(fileData => uploadFile(fileData))
    )

    setIsUploading(false)
    onUploadComplete(uploadedAssets.filter(Boolean))
  }, [type, projectId])

  const uploadFile = async (fileData: UploadedFile): Promise<any> => {
    try {
      const fileExt = fileData.file.name.split('.').pop()
      const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `studio-assets/${type}s/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media-studio')
        .upload(filePath, fileData.file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media-studio')
        .getPublicUrl(filePath)

      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'success' as const, progress: 100, url: urlData.publicUrl }
          : f
      ))

      // Save to database
      const { data: asset, error: dbError } = await supabase
        .from('studio_assets')
        .insert({
          type,
          name: fileData.file.name,
          url: urlData.publicUrl,
          file_size: fileData.file.size,
          category: 'user-upload',
          tags: [],
        })
        .select()
        .single()

      if (dbError) throw dbError

      return asset

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileData.id 
          ? { ...f, status: 'error' as const, error: (error as Error).message }
          : f
      ))
      return null
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes[type],
    maxFiles,
    disabled: isUploading,
  })

  const getIcon = () => {
    switch (type) {
      case 'image': return <ImageIcon className="w-12 h-12" />
      case 'video': return <FileVideo className="w-12 h-12" />
      case 'audio': return <Music className="w-12 h-12" />
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'image': return 'imagens'
      case 'video': return 'vídeos'
      case 'audio': return 'áudio'
    }
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-orange-500 bg-orange-500/10' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className="text-gray-400">
            {getIcon()}
          </div>
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-orange-500">Solte aqui!</p>
              <p className="text-sm text-gray-400">Os arquivos serão enviados</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-white">
                Arraste {getLabel()} ou clique para selecionar
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Até {maxFiles} arquivos
              </p>
            </div>
          )}

          <Upload className="w-6 h-6 text-gray-500" />
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {files.map(file => (
              <FileUploadItem
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FileUploadItem({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
    >
      {/* Preview/Icon */}
      <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {file.preview ? (
          <img src={file.preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileVideo className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {file.file.name}
        </p>
        <p className="text-xs text-gray-400">
          {(file.file.size / 1024 / 1024).toFixed(2)} MB
        </p>

        {/* Progress */}
        {file.status === 'uploading' && (
          <div className="mt-1">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${file.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {file.status === 'error' && (
          <p className="text-xs text-red-400 mt-1">{file.error}</p>
        )}
      </div>

      {/* Status Icon */}
      <div className="flex-shrink-0">
        {file.status === 'uploading' && (
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
        )}
        {file.status === 'success' && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
        {file.status === 'error' && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
