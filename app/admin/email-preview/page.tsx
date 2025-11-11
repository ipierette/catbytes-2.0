'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Eye, Send, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { Alert, AlertDescription } from '@/components/ui/alert'

type EmailType = 'welcome' | 'new-post'

interface QualityReport {
  score: number
  passed: boolean
  summary: {
    criticalIssues: number
    totalIssues: number
    totalWarnings: number
  }
  formattedReport: string
}

export default function EmailPreviewPage() {
  const [selectedEmail, setSelectedEmail] = useState<EmailType>('welcome')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null)
  const [showQualityReport, setShowQualityReport] = useState(false)

  // Custom email state
  const [customEmail, setCustomEmail] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    message: '',
  })

  const loadPreview = async (type: EmailType) => {
    try {
      setLoading(true)
      setMessage(null)
      setSelectedEmail(type) // Atualiza o email selecionado

      const response = await fetch(`/api/email-preview?template=${type}&locale=pt-BR`)
      
      if (response.ok) {
        const html = await response.text()
        setPreviewHtml(html)
        setMessage({ type: 'success', text: 'Preview carregado com sucesso!' })
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

  const checkQuality = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setShowQualityReport(false)

      const response = await fetch(`/api/email-quality?template=${selectedEmail}`)
      const data = await response.json()

      if (data.success) {
        setQualityReport(data)
        setShowQualityReport(true)
        
        if (data.report.passed) {
          setMessage({ 
            type: 'success', 
            text: `✅ Email passou no teste de qualidade! Score: ${data.report.score}/100` 
          })
        } else {
          setMessage({ 
            type: 'error', 
            text: `⚠️ Email não passou no teste. Score: ${data.report.score}/100 - Veja o relatório abaixo.` 
          })
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao verificar qualidade' })
      }
    } catch (error) {
      console.error('Error checking quality:', error)
      setMessage({ type: 'error', text: 'Erro ao verificar qualidade do email' })
    } finally {
      setLoading(false)
    }
  }

  const sendCustomEmail = async () => {
    try {
      setLoading(true)
      setMessage(null)

      // Validação
      if (!customEmail.recipientEmail || !customEmail.recipientName || !customEmail.subject || !customEmail.message) {
        setMessage({ type: 'error', text: 'Preencha todos os campos do formulário' })
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/send-custom-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''}`
        },
        body: JSON.stringify({
          ...customEmail,
          locale: 'pt-BR'
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Email enviado com sucesso para ${customEmail.recipientEmail}!` 
        })
        // Limpar form
        setCustomEmail({
          recipientEmail: '',
          recipientName: '',
          subject: '',
          message: '',
        })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao enviar email' })
      }
    } catch (error) {
      console.error('Error sending custom email:', error)
      setMessage({ type: 'error', text: 'Erro ao enviar email customizado' })
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
                  onClick={() => loadPreview('welcome')}
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
                  onClick={() => loadPreview('new-post')}
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
                  {loading ? 'Carregando...' : 'Recarregar Preview'}
                </Button>
                <Button
                  onClick={checkQuality}
                  disabled={loading}
                  variant="secondary"
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verificar Qualidade
                </Button>
                <Button
                  onClick={sendTestEmail}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Teste
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Email Sender */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-purple-600" />
                Enviar Email Personalizado
              </CardTitle>
              <CardDescription>
                Responda contatos ou envie emails customizados com o template profissional do CatBytes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Email do Destinatário *</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="exemplo@email.com"
                      value={customEmail.recipientEmail}
                      onChange={(e) => setCustomEmail({ ...customEmail, recipientEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Nome do Destinatário *</Label>
                    <Input
                      id="recipientName"
                      type="text"
                      placeholder="João Silva"
                      value={customEmail.recipientName}
                      onChange={(e) => setCustomEmail({ ...customEmail, recipientName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto do Email *</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Re: Seu contato - CatBytes"
                    value={customEmail.subject}
                    onChange={(e) => setCustomEmail({ ...customEmail, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    placeholder="Escreva sua mensagem aqui...

A mensagem será formatada com o template profissional do CatBytes, incluindo logo, banner de assinatura e links para redes sociais."
                    rows={8}
                    value={customEmail.message}
                    onChange={(e) => setCustomEmail({ ...customEmail, message: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Dica: Escreva de forma natural. O template já inclui saudação, assinatura e design profissional.
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={sendCustomEmail}
                    disabled={loading || !customEmail.recipientEmail || !customEmail.recipientName || !customEmail.subject || !customEmail.message}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Enviando...' : 'Enviar Email Personalizado'}
                  </Button>
                  <Button
                    onClick={() => setCustomEmail({ recipientEmail: '', recipientName: '', subject: '', message: '' })}
                    variant="outline"
                    disabled={loading}
                  >
                    Limpar
                  </Button>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">
                    ✨ Template Otimizado
                  </h4>
                  <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                    <li>✅ Design profissional com logo e banner do CatBytes</li>
                    <li>✅ Otimizado para evitar spam (HTML simples e limpo)</li>
                    <li>✅ Responsivo (funciona em mobile e desktop)</li>
                    <li>✅ Inclui assinatura completa com links sociais</li>
                    <li>✅ Compatível com Gmail, Outlook e Apple Mail</li>
                  </ul>
                </div>
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
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full border-0"
                    style={{ height: '800px', minHeight: '600px' }}
                    title="Email Preview"
                    sandbox="allow-same-origin allow-popups"
                  />
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Dica:</strong> As imagens são carregadas de <code className="bg-white dark:bg-gray-800 px-1 rounded">{process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'}</code>. 
                    Certifique-se de que o site está no ar para ver as imagens corretamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Report */}
          {showQualityReport && qualityReport && (
            <Card className={qualityReport.passed ? 'border-green-500' : 'border-orange-500'}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {qualityReport.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    )}
                    Relatório de Qualidade
                  </span>
                  <span className={`text-2xl font-bold ${
                    qualityReport.score >= 90 ? 'text-green-600' :
                    qualityReport.score >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {qualityReport.score}/100
                  </span>
                </CardTitle>
                <CardDescription>
                  Análise completa de qualidade do email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Críticos</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">
                      {qualityReport.summary.criticalIssues}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">Issues</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-700">
                      {qualityReport.summary.totalIssues}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Warnings</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {qualityReport.summary.totalWarnings}
                    </div>
                  </div>
                </div>

                {/* Detailed Report */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <pre className="text-xs whitespace-pre-wrap font-mono overflow-x-auto">
                    {qualityReport.formattedReport}
                  </pre>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => setShowQualityReport(false)}
                  variant="outline"
                  className="w-full"
                >
                  Fechar Relatório
                </Button>
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
