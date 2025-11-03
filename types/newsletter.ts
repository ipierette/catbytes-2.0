// =====================================================
// Newsletter Types
// =====================================================

export interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  subscribed: boolean
  subscribed_at: string
  unsubscribed_at: string | null
  verification_token: string | null
  verified: boolean
  verified_at: string | null
  source: string
  ip_address: string | null
  user_agent: string | null
  last_email_sent_at: string | null
  emails_sent_count: number
  emails_opened_count: number
  emails_clicked_count: number
}

export interface NewsletterSubscribeRequest {
  email: string
  name?: string
  source?: string
}

export interface NewsletterCampaign {
  id: string
  blog_post_id: string
  subject: string
  sent_at: string
  recipients_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
}
