'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { PostType, BlogArticle } from '@/types/linkedin'

interface PostTypeSelectorProps {
  postType: PostType
  selectedArticle: string
  articles: BlogArticle[]
  loadingArticles: boolean
  generating: boolean
  onPostTypeChange: (type: PostType) => void
  onArticleChange: (slug: string) => void
  onGenerate: () => void
}

export function PostTypeSelector({
  postType,
  selectedArticle,
  articles,
  loadingArticles,
  generating,
  onPostTypeChange,
  onArticleChange,
  onGenerate
}: PostTypeSelectorProps) {
  const canGenerate = postType === 'fullstack-random' || (postType === 'blog-article' && selectedArticle)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipo de Post</CardTitle>
        <CardDescription>Escolha o que você quer compartilhar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={postType} onValueChange={(value: PostType) => onPostTypeChange(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fullstack-random">
              💼 Post sobre Fullstack (Aleatório)
            </SelectItem>
            <SelectItem value="blog-article">
              📝 Divulgar Artigo do Blog
            </SelectItem>
          </SelectContent>
        </Select>

        {postType === 'blog-article' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecione o Artigo</label>
            <Select
              value={selectedArticle}
              onValueChange={onArticleChange}
              disabled={loadingArticles}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolha um artigo..." />
              </SelectTrigger>
              <SelectContent>
                {articles.map((article) => (
                  <SelectItem key={article.slug} value={article.slug}>
                    {article.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={onGenerate}
          disabled={generating || !canGenerate}
          className="w-full"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Post com IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
