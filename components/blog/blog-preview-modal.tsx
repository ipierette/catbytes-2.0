'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Save, FileText } from 'lucide-react'
import { BlogTemplateEditor } from '@/components/blog/blog-template-editor'
import { TemplateType } from '@/components/blog/blog-template-selector'
import { BlogPost } from '@/types/blog'
import { AIAutoFill } from '@/components/blog/ai-autofill'
import { toast } from 'sonner'

interface BlogPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (post: BlogPost & { 
    template?: TemplateType
    templateImages?: { 
      coverImage?: string
      bodyImage1?: string
      bodyImage2?: string
    }
  }) => void
  initialPost: Partial<BlogPost>
  theme: string
}

export function BlogPreviewModal({
  isOpen,
  onClose,
  onSave,
  initialPost,
  theme
}: BlogPreviewModalProps) {
  const [post, setPost] = useState<Partial<BlogPost>>({
    id: initialPost.id || '',
    slug: initialPost.slug || '',
    title: initialPost.title || '',
    excerpt: initialPost.excerpt || '',
    content: initialPost.content || '',
    category: initialPost.category || theme,
    tags: initialPost.tags || [],
    author: initialPost.author || 'Admin',
    status: initialPost.status || 'draft',
    created_at: initialPost.created_at || new Date().toISOString(),
    image_prompt: initialPost.image_prompt,
    content_image_prompts: initialPost.content_image_prompts
  })

  const [templateData, setTemplateData] = useState<{
    template: TemplateType
    images: { 
      coverImage?: string
      bodyImage1?: string
      bodyImage2?: string
    }
  }>({
    template: 'traditional',
    images: {}
  })

  const handleSave = () => {
    onSave({
      ...post as BlogPost,
      template: templateData.template,
      templateImages: templateData.images
    })
  }

  const handleTagsChange = (tagsStr: string) => {
    const tags = tagsStr.split(',').map(tag => tag.trim()).filter(Boolean)
    setPost(prev => ({ ...prev, tags }))
  }

  const handleAutoFill = (data: {
    title: string
    excerpt: string
    content: string
    tags: string[]
    suggestedTemplate: TemplateType
    templateJustification: string
  }) => {
    setPost(prev => ({
      ...prev,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      tags: data.tags
    }))

    setTemplateData(prev => ({
      ...prev,
      template: data.suggestedTemplate
    }))

    // Mostrar justificativa do template
    toast.success(
      `✨ Template sugerido: ${data.suggestedTemplate}\n${data.templateJustification}`,
      { duration: 5000 }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <Eye className="h-5 w-5 text-emerald-400" />
            Editor de Artigo do Blog
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="content" className="data-[state=active]:bg-emerald-600">
              <FileText className="w-4 h-4 mr-2" />
              Editar Conteúdo
            </TabsTrigger>
            <TabsTrigger value="template" className="data-[state=active]:bg-emerald-600">
              <Eye className="w-4 h-4 mr-2" />
              Template & Preview
            </TabsTrigger>
          </TabsList>

          {/* Tab: Editar Conteúdo */}
          <TabsContent value="content" className="space-y-6 mt-6">
            {/* AI AutoFill */}
            <AIAutoFill theme={theme} onAutoFill={handleAutoFill} />

            <div className="space-y-4 p-6 bg-slate-800 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-emerald-400">Revisão do Texto</h3>
              
              <div className="space-y-2">
                <Label className="text-slate-200">Título</Label>
                <Input
                  value={post.title}
                  onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-slate-900 border-slate-700 text-slate-100"
                  placeholder="Título do artigo..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Resumo (Excerpt)</Label>
                <Textarea
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="bg-slate-900 border-slate-700 text-slate-100 min-h-[80px]"
                  placeholder="Resumo do artigo..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Conteúdo (HTML/Markdown)</Label>
                <Textarea
                  value={post.content}
                  onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                  className="bg-slate-900 border-slate-700 text-slate-100 min-h-[300px] font-mono text-sm"
                  placeholder="Conteúdo do artigo em HTML ou Markdown..."
                />
                <p className="text-xs text-slate-400">
                  💡 Você pode editar o texto aqui. Use HTML ou Markdown para formatação.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Categoria</Label>
                  <Input
                    value={post.category}
                    onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-slate-900 border-slate-700 text-slate-100"
                    placeholder="Ex: Tecnologia, IA, Web..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Tags (separadas por vírgula)</Label>
                  <Input
                    value={post.tags?.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-slate-100"
                    placeholder="react, nextjs, ai..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Template & Preview */}
          <TabsContent value="template" className="space-y-6 mt-6">
            <BlogTemplateEditor
              post={post as BlogPost}
              onSave={(data: {
                template: TemplateType
                images: { 
                  coverImage?: string
                  bodyImage1?: string
                  bodyImage2?: string
                }
              }) => setTemplateData(data)}
            />
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Artigo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
