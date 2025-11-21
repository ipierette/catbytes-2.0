'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageManagerProps {
  imagePrompt: string
  imageUrl: string
  uploading: boolean
  onPromptChange: (value: string) => void
  onGenerateImage: () => void
  onFileSelect: (file: File) => void
}

export function ImageManager({
  imagePrompt,
  imageUrl,
  uploading,
  onPromptChange,
  onGenerateImage,
  onFileSelect
}: ImageManagerProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagem do Post</CardTitle>
        <CardDescription>Gere uma imagem profissional com IA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Prompt da Imagem</label>
          <Textarea
            value={imagePrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Descreva a imagem que você quer gerar..."
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onGenerateImage}
            disabled={uploading || !imagePrompt.trim()}
            className="w-full"
            variant="outline"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                DALL-E
              </>
            )}
          </Button>

          <Button
            onClick={() => document.getElementById('linkedin-file-upload')?.click()}
            disabled={uploading}
            className="w-full"
            variant="outline"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>

        <input
          id="linkedin-file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        {imageUrl && (
          <div className="border rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt="Preview da imagem"
              width={1024}
              height={1024}
              className="w-full h-auto"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
