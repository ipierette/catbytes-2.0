// 🎬 CatBytes Media Studio - Type Definitions

// ===== VIDEO PROJECT =====
export interface VideoProject {
  id: string
  title: string
  description?: string
  script?: string
  narrationUrl?: string
  status: 'draft' | 'rendering' | 'rendered' | 'published'
  platformTargets: Platform[]
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
  locale: 'pt-BR' | 'en-US'
  duration: number // segundos
  timeline: Timeline
  createdAt: Date
  updatedAt: Date
  userId?: string
}

export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'linkedin'

// ===== TIMELINE =====
export interface Timeline {
  duration: number
  tracks: Track[]
}

export interface Track {
  id: string
  name: string
  type: 'video' | 'audio' | 'text' | 'graphics'
  clips: TimelineClip[]
  locked: boolean
  visible: boolean
  volume: number // 0-1
}

export interface TimelineClip {
  id: string
  name: string
  type: 'video' | 'image' | 'audio' | 'text'
  
  // Timing
  startTime: number // segundos
  endTime: number // segundos
  trimStart?: number // trim do início do asset original
  trimEnd?: number // trim do fim do asset original
  
  // Asset reference
  assetId: string
  assetUrl: string
  
  // Position & Transform
  position: { x: number; y: number }
  scale: number
  rotation: number
  opacity: number
  zIndex: number
  
  // Visual
  color?: string // cor do clip na timeline (para UI)
  
  // Effects
  transition?: Transition
  filters: Filter[]
  
  // Audio (para clips de vídeo/áudio)
  volume?: number
  fadeIn?: number
  fadeOut?: number
  
  // Text (para clips de texto)
  text?: TextProperties
}

// ===== EFFECTS & TRANSITIONS =====
export interface Transition {
  type: 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'blur' | 'glitch' | 'modern-swipe'
  duration: number // segundos
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface Filter {
  id: string
  type: 'brightness' | 'contrast' | 'saturation' | 'hue' | 'temperature' | 
        'vignette' | 'blur' | 'sharpen' | 'vintage' | 'cinematic' | 'black-white'
  intensity: number // 0-1
}

export interface TextProperties {
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  alignment: 'left' | 'center' | 'right'
  backgroundColor?: string
  padding?: number
  animation?: TextAnimation
}

export interface TextAnimation {
  type: 'slide-in' | 'fade-in' | 'zoom-in' | 'bounce' | 'rotate' | 'scale'
  duration: number
  delay?: number
  easing?: string
}

// ===== ASSETS =====
export interface Asset {
  id: string
  type: 'video' | 'image' | 'audio' | 'animation'
  name: string
  url: string
  thumbnail?: string
  duration?: number // para vídeos
  fileSize: number
  tags: string[]
  category: string
  createdAt: Date
}

export interface Screenshot extends Asset {
  projectId: string
  sequenceOrder: number
  displayDuration: number // segundos que fica na tela
  status: 'uploaded' | 'used_in_render' | 'deleted'
}

// ===== TEMPLATES =====
export interface Template {
  id: string
  name: string
  description?: string
  platform: Platform
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
  thumbnail: string
  layers: Layer[]
}

export interface Layer {
  type: 'video' | 'image' | 'text' | 'audio'
  position: { x: number; y: number }
  size: { width: number; height: number }
  startTime: number
  endTime: number
  properties: Record<string, any>
}

// ===== SCRIPT GENERATION =====
export interface ScriptRequest {
  topic: string
  tone: 'educational' | 'casual' | 'professional' | 'humorous'
  duration: number // segundos
  platform: Platform | 'podcast'
  locale: 'pt-BR' | 'en-US'
  keywords?: string[]
  targetAudience?: string
}

export interface ScriptResponse {
  title: string
  hook: string // Primeiros 3 segundos
  body: ScriptSegment[]
  cta: string // Call-to-action
  metadata: {
    wordCount: number
    estimatedDuration: number
    seoScore: number
  }
}

export interface ScriptSegment {
  timestamp: number
  text: string
  visualSuggestion: string
  emotionTone: 'neutral' | 'excited' | 'serious'
}

// ===== NARRATION =====
export interface NarrationRequest {
  script: string
  voice: VoiceSettings
  locale: 'pt-BR' | 'en-US'
}

export interface VoiceSettings {
  id: string // Eleven Labs voice ID
  stability: number // 0-1
  similarityBoost: number // 0-1
  style: number // 0-1
}

export interface NarrationResponse {
  url: string
  duration: number
  size: number
}

// ===== RENDER =====
export interface RenderRequest {
  project: VideoProject
  timeline: Timeline
  narration?: {
    url: string
    volume: number
  }
  music?: {
    url: string
    volume: number
  }
  export: ExportSettings
}

export interface ExportSettings {
  resolution: '1080p' | '720p' | '4k'
  framerate: 30 | 60
  format: 'mp4' | 'mov' | 'webm'
  quality: 'draft' | 'good' | 'best'
}

export interface VideoRender {
  id: string
  projectId: string
  platform: Platform
  resolution: string
  fileUrl?: string // URL temporária no Supabase Storage
  fileSize?: number
  duration: number
  thumbnailUrl?: string
  status: 'rendering' | 'ready' | 'uploading' | 'published' | 'deleted'
  publishedUrl?: string // URL final na plataforma
  errorMessage?: string
  createdAt: Date
  publishedAt?: Date
  deletedAt?: Date
}

// ===== BLOG VIDEO POST =====
export interface BlogVideoPost {
  id: string
  slug: string
  title: string
  description: string
  projectId: string
  
  // URLs dos vídeos publicados
  youtubeUrl?: string
  youtubeVideoId?: string
  tiktokUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  
  // Thumbnail
  thumbnailUrl: string
  useYoutubeThumbnail: boolean
  
  // Metadata
  locale: 'pt-BR' | 'en-US'
  published: boolean
  publishedAt?: Date
  
  // Engagement
  views: number
  likes: number
  
  createdAt: Date
  updatedAt: Date
}

// ===== PODCAST =====
export interface PodcastEpisode {
  id: string
  episodeNumber: number
  title: string
  description: string
  script: string
  audioUrl: string
  duration: number
  fileSize: number
  thumbnailUrl?: string
  locale: 'pt-BR' | 'en-US'
  published: boolean
  publishedAt?: Date
  views: number
  likes: number
  transcript?: string
  keywords: string[]
  createdAt: Date
  updatedAt: Date
}

// ===== ANALYTICS =====
export interface AnalyticsEvent {
  id: string
  type: 'view' | 'play' | 'pause' | 'complete' | 'like' | 'share' | 'download'
  contentType: 'video' | 'podcast'
  contentId: string
  timestamp: Date
  userIp?: string
  userAgent?: string
  metadata?: Record<string, any>
}

// ===== EDITOR STATE =====
export interface EditorState {
  project: VideoProject
  currentTime: number
  isPlaying: boolean
  selectedClip: string | null
  timelineZoom: number
  previewQuality: '360p' | '720p' | '1080p'
  showGrid: boolean
  showSafeZones: boolean
  history: VideoProject[]
  historyIndex: number
}

// ===== VOICE PRESETS =====
export const VOICE_PRESETS = {
  'pt-BR': {
    female: {
      professional: 'voice_id_pt_f_professional',
      casual: 'voice_id_pt_f_casual',
      energetic: 'voice_id_pt_f_energetic',
    },
    male: {
      professional: 'voice_id_pt_m_professional',
      casual: 'voice_id_pt_m_casual',
      deep: 'voice_id_pt_m_deep',
    },
  },
  'en-US': {
    female: {
      professional: 'voice_id_en_f_professional',
      casual: 'voice_id_en_f_casual',
      energetic: 'voice_id_en_f_energetic',
    },
    male: {
      professional: 'voice_id_en_m_professional',
      casual: 'voice_id_en_m_casual',
      deep: 'voice_id_en_m_deep',
    },
  },
} as const

// ===== PLATFORM PRESETS =====
export const PLATFORM_PRESETS = {
  youtube: {
    aspectRatio: '16:9' as const,
    resolution: '1080p' as const,
    framerate: 60,
    maxDuration: 60 * 60, // 1 hora
  },
  tiktok: {
    aspectRatio: '9:16' as const,
    resolution: '1080p' as const,
    framerate: 30,
    maxDuration: 60 * 10, // 10 minutos
  },
  instagram: {
    aspectRatio: '9:16' as const,
    resolution: '1080p' as const,
    framerate: 30,
    maxDuration: 90, // 90 segundos para reels
  },
  linkedin: {
    aspectRatio: '1:1' as const,
    resolution: '720p' as const,
    framerate: 30,
    maxDuration: 60 * 10, // 10 minutos
  },
} as const
