'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Eye, Send } from 'lucide-react'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { Alert, AlertDescription } from '@/components/ui/alert'

type EmailType = 'welcome' | 'new-post'

export default function EmailPreviewPage() {
  const [selectedEmail, setSelectedEmail] = useState<EmailType>('welcome')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadPreview = async (type: EmailType) => {
    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch(`/api/email-preview?template=${type}&locale=pt-BR`)
      
      if (response.ok) {
        const html = await response.text()
        setPreviewHtml(html)
      } else {
        setMessage({ type: 'error', text: 'Erro ao carregar preview' })
      }
    } catch (error) {
      console.error('Error loading preview:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar preview' })
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch('/api/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedEmail })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Email de teste enviado com sucesso!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao enviar email' })
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      setMessage({ type: 'error', text: 'Erro ao enviar email de teste' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminGuard>
      <AdminLayoutWrapper title="Preview de Emails" description="Visualize e teste os templates de email">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Mail className="h-8 w-8" />
                Preview de Emails
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualize como os emails aparecem para os assinantes
              </p>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Email Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Selecione o Template</CardTitle>
              <CardDescription>
                Escolha qual email você quer visualizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedEmail('welcome')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedEmail === 'welcome'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mail className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-semibold text-lg">Email de Boas-Vindas</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enviado quando alguém se inscreve na newsletter
                  </p>
                </button>

                <button
                  onClick={() => setSelectedEmail('new-post')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedEmail === 'new-post'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mail className="h-8 w-8 mb-2 text-green-600" />
                  <h3 className="font-semibold text-lg">Novo Artigo</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enviado quando um novo post é publicado
                  </p>
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => loadPreview(selectedEmail)}
                  disabled={loading}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {loading ? 'Carregando...' : 'Visualizar Preview'}
                </Button>
                <Button
                  onClick={sendTestEmail}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Email de Teste
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {previewHtml && (
            <Card>
              <CardHeader>
                <CardTitle>Preview do Email</CardTitle>
                <CardDescription>
                  Visualização de como o email aparece para os assinantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[600px] border-0"
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>ℹ️ Instruções</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Visualizar Preview:</strong> Clique no botão "Visualizar Preview" para ver como o email aparece.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Enviar Email de Teste:</strong> Envia o email para o endereço configurado em ADMIN_EMAIL ({process.env.ADMIN_EMAIL || 'não configurado'}).
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Templates:</strong> Os templates estão em <code className="bg-gray-100 px-1 rounded">/lib/email-templates/</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}
