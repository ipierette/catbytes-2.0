/**
 * Tipos TypeScript centralizados para o sistema de Instagram
 */

import { PostStatus } from './constants'

// Post do Instagram
export interface InstagramPost {
  id: string
  created_at: string
  nicho: string
  titulo: string
  texto_imagem: string
  caption: string
  image_url: string
  instagram_post_id?: string
  status: PostStatus
  error_message?: string
  scheduled_for?: string
  approved_at?: string
  approved_by?: string
  published_at?: string
  generation_method?: string
}

// Estatísticas do Instagram
export interface InstagramStats {
  total: number
  published: number
  pending: number
  approved: number
  failed: number
  byNiche: Record<string, number>
}

// Configurações do sistema
export interface InstagramSettings {
  autoGenerationEnabled: boolean
  lastGenerationRun?: string
  nextScheduledRun?: string
}

// Opções para o hook useInstagramPosts
export interface UseInstagramPostsOptions {
  status?: 'all' | PostStatus
  autoRefresh?: boolean
  refreshInterval?: number
}

// Resultado de aprovação
export interface ApprovalResult {
  success: boolean
  message?: string
  error?: string
  scheduledFor?: string
}

// Resultado de aprovação em lote
export interface BulkApprovalResult {
  total: number
  successful: number
  failed: number
  errors: string[]
}

// Dados de atualização de post
export interface PostUpdateData {
  titulo?: string
  texto_imagem?: string
  caption?: string
  image_url?: string
  status?: PostStatus
  scheduled_for?: string
  approved_at?: string
  approved_by?: string
  published_at?: string
  error_message?: string
  instagram_post_id?: string
}

// Resposta da API de listagem de posts
export interface PostsListResponse {
  posts: InstagramPost[]
  total: number
  page?: number
  pageSize?: number
}

// Resposta da API de estatísticas
export interface StatsResponse {
  success: boolean
  stats: InstagramStats
}

// Resposta da API de configurações
export interface SettingsResponse {
  success: boolean
  settings: InstagramSettings
  message?: string
}

// Resposta genérica de sucesso/erro
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
