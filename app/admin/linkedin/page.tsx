'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { ScheduleLinkedInModal } from '@/components/admin/schedule-linkedin-modal'
import { PostTypeSelector } from '@/components/admin/linkedin/post-type-selector'
import { PostEditor } from '@/components/admin/linkedin/post-editor'
import { ImageManager } from '@/components/admin/linkedin/image-manager'
import { SavedPostsList } from '@/components/admin/linkedin/saved-posts-list'
import { PublishControls } from '@/components/admin/linkedin/publish-controls'
import { useLinkedInPosts } from '@/hooks/use-linkedin-posts'
import { usePostGeneration } from '@/hooks/use-post-generation'
import { useImageUpload } from '@/hooks/use-image-upload'
import { BlogArticle, PostType, PostStatus } from '@/types/linkedin'

export default function LinkedInAdminPage() {
  const { showToast } = useToast()
  
  // Estado local
  const [postType, setPostType] = useState<PostType>('fullstack-random')
  const [articles, setArticles] = useState<BlogArticle[]>([])
  const [selectedArticle, setSelectedArticle] = useState<string>('')
  const [postText, setPostText] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [asOrganization, setAsOrganization] = useState(false)
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<PostStatus>('all')
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  
  // Custom hooks
  const { posts, loading: loadingSavedPosts, loadPosts, deletePost } = useLinkedInPosts()
  
  const { generate, generating } = usePostGeneration({
    onSuccess: (data) => {
      setPostText(data.postText)
      setImagePrompt(data.imagePrompt)
      setImageUrl('')
      showToast('✨ Post gerado! Clique em "Gerar Imagem" se desejar adicionar uma imagem.', 'success')
    },
    onError: (error) => showToast(error, 'error')
  })
  
  const { uploadFile, generateImage, uploading } = useImageUpload({
    onSuccess: (url) => {
      setImageUrl(url)
      showToast('✅ Imagem carregada com sucesso!', 'success')
    },
    onError: (error) => showToast(error, 'error')
  })

  // Buscar artigos do blog
  useEffect(() => {
    if (postType === 'blog-article') {
      fetchArticles()
    }
  }, [postType])

  const fetchArticles = async () => {
    setLoadingArticles(true)
    try {
      const response = await fetch('/api/blog/posts?status=published&limit=50')
      if (!response.ok) throw new Error('Erro ao buscar artigos')
      
      const data = await response.json()
      setArticles(data.posts || [])
    } catch (error) {
      showToast('Não foi possível carregar os artigos', 'error')
    } finally {
      setLoadingArticles(false)
    }
  }

  // Gerar conteúdo do post
  const handleGenerate = async () => {
    if (postType === 'blog-article' && !selectedArticle) {
      showToast('Selecione um artigo do blog', 'error')
      return
    }

    await generate(postType, selectedArticle || undefined)
  }

  // Carregar post salvo
  const handleLoadPost = (post: any) => {
    setPostText(post.text)
    setImageUrl(post.image_url || '')
    setAsOrganization(post.as_organization)
    setPostType(post.post_type as PostType)
    setLoadedPostId(post.id)
    if (post.article_slug) {
      setSelectedArticle(post.article_slug)
    }
    showToast('Post carregado! Você pode editá-lo ou publicá-lo', 'success')
  }

  // Deletar post salvo
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return

    setDeletingPostId(postId)
    const success = await deletePost(postId)
    setDeletingPostId(null)
    
    if (success) {
      showToast('Post deletado com sucesso', 'success')
    } else {
      showToast('Não foi possível deletar o post', 'error')
    }
  }

  const handlePostTypeChange = (type: PostType) => {
    setPostType(type)
    setPostText('')
    setImagePrompt('')
    setImageUrl('')
  }

  return (
    <AdminGuard>
    <AdminLayoutWrapper>
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Posts</h1>
          <p className="text-muted-foreground mt-1">
            Gere e publique posts profissionais no LinkedIn
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {asOrganization ? '🏢 Como Página' : '👤 Como Perfil'}
        </Badge>
      </div>

      {/* Posts Salvos */}
      <SavedPostsList
        posts={posts}
        filterStatus={filterStatus}
        loading={loadingSavedPosts}
        deletingPostId={deletingPostId}
        onFilterChange={setFilterStatus}
        onRefresh={loadPosts}
        onLoadPost={handleLoadPost}
        onDeletePost={handleDeletePost}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Configuração */}
        <div className="space-y-6">
          <PostTypeSelector
            postType={postType}
            selectedArticle={selectedArticle}
            articles={articles}
            loadingArticles={loadingArticles}
            generating={generating}
            onPostTypeChange={handlePostTypeChange}
            onArticleChange={setSelectedArticle}
            onGenerate={handleGenerate}
          />

          <PostEditor value={postText} onChange={setPostText} />
        </div>

        {/* Coluna Direita - Imagem e Publicação */}
        <div className="space-y-6">
          <ImageManager
            imagePrompt={imagePrompt}
            imageUrl={imageUrl}
            uploading={uploading}
            onPromptChange={setImagePrompt}
            onGenerateImage={() => generateImage(imagePrompt)}
            onFileSelect={uploadFile}
          />

          <PublishControls
            postText={postText}
            asOrganization={asOrganization}
            onToggleOrganization={() => setAsOrganization(!asOrganization)}
            onSchedule={() => setShowScheduleModal(true)}
          />
        </div>
      </div>
    </div>

    {/* Modal de Agendamento */}
    <ScheduleLinkedInModal
      open={showScheduleModal}
      onOpenChange={setShowScheduleModal}
      post={{
        text: postText,
        imageUrl: imageUrl,
        postType: postType,
        articleSlug: postType === 'blog-article' ? selectedArticle : undefined,
        asOrganization: asOrganization
      }}
      postId={loadedPostId || undefined}
      onSuccess={() => {
        setPostText('')
        setImagePrompt('')
        setImageUrl('')
        setSelectedArticle('')
        setLoadedPostId(null)
        loadPosts()
        showToast('✅ Operação realizada com sucesso!', 'success')
      }}
    />
    </AdminLayoutWrapper>
    </AdminGuard>
  )
}
