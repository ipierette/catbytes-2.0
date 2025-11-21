export interface BlogArticle {
  title: string
  slug: string
  excerpt: string
  created_at: string
}

export interface LinkedInPost {
  id: string
  text: string
  image_url: string | null
  status: 'draft' | 'pending' | 'approved' | 'published' | 'failed'
  scheduled_for: string | null
  published_at: string | null
  post_type: string
  article_slug: string | null
  as_organization: boolean
  created_at: string
}

export type PostType = 'blog-article' | 'fullstack-random'

export type PostStatus = 'all' | 'draft' | 'approved' | 'published'

export interface PostFormData {
  text: string
  imageUrl: string
  postType: PostType
  articleSlug?: string
  asOrganization: boolean
}
