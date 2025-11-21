'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface VideoUploaderProps {
  file: File | null
  onFileSelect: (file: File | null) => void
}

export function VideoUploader({ file, onFileSelect }: VideoUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    onFileSelect(selectedFile || null)
  }

  const fileSize = file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Upload do Vídeo</CardTitle>
        <CardDescription>
          Selecione um vídeo de até 10MB (MP4, MOV, AVI, WEBM)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            onChange={handleFileChange}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            {file ? (
              <div className="space-y-2">
                <p className="font-medium text-green-600">
                  ✓ {file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {fileSize}
                </p>
                <Button variant="outline" size="sm" type="button">
                  Trocar vídeo
                </Button>
              </div>
            ) : (
              <>
                <p className="font-medium">Clique para selecionar</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou arraste o vídeo aqui
                </p>
              </>
            )}
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
