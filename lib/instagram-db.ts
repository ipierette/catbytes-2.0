/**
 * Supabase Database Functions - Instagram Automation
 * 
 * TABELA A CRIAR NO SUPABASE:
 * 
 * CREATE TABLE instagram_posts (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   nicho VARCHAR(50) NOT NULL,
 *   titulo TEXT NOT NULL,
 *   texto_imagem VARCHAR(100) NOT NULL,
 *   caption TEXT NOT NULL,
 *   image_url TEXT NOT NULL,
 *   instagram_post_id VARCHAR(100),
 *   status VARCHAR(20) NOT NULL DEFAULT 'pending',
 *   error_message TEXT,
 *   scheduled_for TIMESTAMP WITH TIME ZONE,
 *   approved_at TIMESTAMP WITH TIME ZONE,
 *   approved_by VARCHAR(100),
 *   published_at TIMESTAMP WITH TIME ZONE,
 *   
 *   CHECK (nicho IN ('advogados', 'medicos', 'terapeutas', 'nutricionistas')),
 *   CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'failed'))
 * );
 * 
 * CREATE INDEX idx_instagram_posts_created_at ON instagram_posts(created_at DESC);
 * CREATE INDEX idx_instagram_posts_status ON instagram_posts(status);
 * CREATE INDEX idx_instagram_posts_scheduled ON instagram_posts(scheduled_for) WHERE status = 'approved';
 * 
 * -- Função para manter apenas os últimos 100 registros publicados
 * CREATE OR REPLACE FUNCTION cleanup_old_instagram_posts()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   DELETE FROM instagram_posts
 *   WHERE status IN ('published', 'rejected', 'failed')
 *   AND id IN (
 *     SELECT id FROM instagram_posts
 *     WHERE status IN ('published', 'rejected', 'failed')
 *     ORDER BY created_at DESC
 *     OFFSET 100
 *   );
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 * 
 * CREATE TRIGGER trigger_cleanup_instagram_posts
 * AFTER UPDATE ON instagram_posts
 * FOR EACH ROW
 * WHEN (NEW.status IN ('published', 'rejected', 'failed'))
 * EXECUTE FUNCTION cleanup_old_instagram_posts();
 */

import { createClient } from '@supabase/supabase-js'
import type { InstagramPost, Niche } from './instagram-automation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const instagramDB = {
  /**
   * Salva uma nova postagem no banco (status: pending por padrão)
   */
  async savePost(post: Omit<InstagramPost, 'id' | 'created_at'>): Promise<InstagramPost> {
    const { data, error } = await supabase
      .from('instagram_posts')
      .insert([post])
      .select()
      .single()

    if (error) {
      console.error('Error saving Instagram post:', error)
      throw error
    }

    return data
  },

  /**
   * Busca posts pendentes de aprovação
   */
  async getPendingPosts(): Promise<InstagramPost[]> {
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending posts:', error)
      throw error
    }

    return data || []
  },

  /**
   * Busca posts aprovados prontos para publicar
   */
  async getApprovedPostsReadyToPublish(): Promise<InstagramPost[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('*')
      .eq('status', 'approved')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('Error fetching approved posts:', error)
      throw error
    }

    return data || []
  },

  /**
   * Aprova um post e agenda para publicação
   */
  async approvePost(id: string, scheduledFor: Date, approvedBy: string): Promise<InstagramPost> {
    const { data, error } = await supabase
      .from('instagram_posts')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy,
        scheduled_for: scheduledFor.toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error approving post:', error)
      throw error
    }

    return data
  },

  /**
   * Rejeita um post
   */
  async rejectPost(id: string, reason?: string): Promise<InstagramPost> {
    const { data, error } = await supabase
      .from('instagram_posts')
      .update({
        status: 'rejected',
        error_message: reason || 'Rejeitado pelo admin'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error rejecting post:', error)
      throw error
    }

    return data
  },

  /**
   * Marca post como publicado
   */
  async markAsPublished(id: string, instagramPostId: string): Promise<InstagramPost> {
    const { data, error } = await supabase
      .from('instagram_posts')
      .update({
        status: 'published',
        instagram_post_id: instagramPostId,
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error marking post as published:', error)
      throw error
    }

    return data
  },

  /**
   * Marca post como falho
   */
  async markAsFailed(id: string, errorMessage: string): Promise<InstagramPost> {
    const { data, error } = await supabase
      .from('instagram_posts')
      .update({
        status: 'failed',
        error_message: errorMessage
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error marking post as failed:', error)
      throw error
    }

    return data
  },

  /**
   * Busca a última postagem para determinar o próximo nicho
   */
  async getLastPost(): Promise<InstagramPost | null> {
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // Ignora erro de "não encontrado"
      console.error('Error fetching last post:', error)
      throw error
    }

    return data || null
  },

  /**
   * Retorna o próximo nicho na rotação
   */
  async getNextNiche(): Promise<Niche> {
    const nichos: Niche[] = ['advogados', 'medicos', 'terapeutas', 'nutricionistas']
    
    const lastPost = await this.getLastPost()
    
    if (!lastPost) {
      return nichos[0] // Primeira postagem: advogados
    }

    const currentIndex = nichos.indexOf(lastPost.nicho)
    const nextIndex = (currentIndex + 1) % nichos.length
    
    return nichos[nextIndex]
  },

  /**
   * Lista todas as postagens (paginado)
   */
  async listPosts(page = 1, pageSize = 20) {
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    const { data, error, count } = await supabase
      .from('instagram_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) {
      console.error('Error listing posts:', error)
      throw error
    }

    return {
      posts: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    }
  },

  /**
   * Estatísticas das postagens
   */
  async getStats() {
    const { data: publishedCount } = await supabase
      .from('instagram_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')

    const { data: pendingCount } = await supabase
      .from('instagram_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { data: approvedCount } = await supabase
      .from('instagram_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')

    const { data: failedCount } = await supabase
      .from('instagram_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed')

    const { data: totalCount } = await supabase
      .from('instagram_posts')
      .select('id', { count: 'exact', head: true })

    const { data: byNiche } = await supabase
      .from('instagram_posts')
      .select('nicho')
      .eq('status', 'published')

    const nicheStats = byNiche?.reduce((acc, post) => {
      acc[post.nicho] = (acc[post.nicho] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return {
      total: totalCount || 0,
      published: publishedCount || 0,
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      failed: failedCount || 0,
      byNiche: nicheStats
    }
  },

  /**
   * Calcula a próxima data disponível para agendamento
   * Dias: Segunda (1), Quarta (3), Sexta (5), Domingo (0)
   * Horário: 10h BRT
   */
  async getNextAvailableSlot(): Promise<Date> {
    const postDays = [1, 3, 5, 0] // Dias da semana para postar
    const postHour = 10 // 10h da manhã
    
    // Busca todas as datas já agendadas
    const { data: scheduledPosts } = await supabase
      .from('instagram_posts')
      .select('scheduled_for')
      .eq('status', 'approved')
      .not('scheduled_for', 'is', null)
      .order('scheduled_for', { ascending: true })

    const scheduledDates = new Set(
      scheduledPosts?.map(p => new Date(p.scheduled_for).toISOString().split('T')[0]) || []
    )

    // Encontra a próxima data disponível
    let candidate = new Date()
    candidate.setHours(postHour, 0, 0, 0)

    // Se já passou das 10h hoje, começa de amanhã
    if (new Date().getHours() >= postHour) {
      candidate.setDate(candidate.getDate() + 1)
    }

    // Busca próximo dia válido não ocupado
    let attempts = 0
    while (attempts < 30) { // Máximo 30 dias
      const dayOfWeek = candidate.getDay()
      const dateStr = candidate.toISOString().split('T')[0]

      if (postDays.includes(dayOfWeek) && !scheduledDates.has(dateStr)) {
        return candidate
      }

      candidate.setDate(candidate.getDate() + 1)
      attempts++
    }

    // Se não encontrou, retorna o próximo dia válido mesmo que ocupado
    return candidate
  }
}
