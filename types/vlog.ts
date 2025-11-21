export interface Vlog {
  id: string
  filename: string
  video_url: string
  original_description: string
  improved_description: string
  file_size: number
  mime_type: string
  status: 'pending' | 'published_partial' | 'published_all' | 'failed'
  published_to?: string[]
  created_at: string
}

export type Platform = 'instagram_feed' | 'instagram_reels' | 'linkedin'

export interface PlatformConfig {
  id: Platform
  label: string
  description: string
  icon: string
  enabled: boolean
}

export interface VlogUploadData {
  file: File
  description: string
}

export interface VlogPublishData {
  vlogId: string
  platforms: Platform[]
  description: string
}

export interface PlatformSelections {
  instagram_feed: boolean
  instagram_reels: boolean
  linkedin: boolean
}
