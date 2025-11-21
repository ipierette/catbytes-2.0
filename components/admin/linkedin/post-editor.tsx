'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface PostEditorProps {
  value: string
  onChange: (value: string) => void
}

export function PostEditor({ value, onChange }: PostEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Texto do Post</CardTitle>
        <CardDescription>Revise e edite o conteúdo antes de publicar</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="O texto do post aparecerá aqui após gerar..."
          rows={12}
          className="font-sans resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {value.length} / 3000 caracteres
        </p>
      </CardContent>
    </Card>
  )
}
