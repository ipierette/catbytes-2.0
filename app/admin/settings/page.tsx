'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Save, 
  Key, 
  Database, 
  Mail, 
  Instagram, 
  Bot,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminLayoutWrapper } from '@/components/admin/admin-navigation'
import { AdminGuard } from '@/components/admin/admin-guard'
import { TokenGeneratorModal } from '@/components/admin/token-generator-modal'
import { createTokenReminder } from '@/lib/token-utils'

interface SystemSettings {
  automation: {
    blogGeneration: boolean
    instagramGeneration: boolean
    autoPublishing: boolean
    batchSize: number
  }
  api: {
    openaiKey: string
    instagramToken: string
    instagramTokenExpiryDate?: string // Data de expiração do token (60 dias)
    linkedinToken: string
    linkedinTokenExpiryDate?: string // Data de expiração do token LinkedIn (60 dias)
    emailService: boolean
    databaseUrl: string
  }
  content: {
    blogLanguages: string[]
    instagramNiches: string[]
    defaultAuthor: string
    contentTone: 'professional' | 'casual' | 'technical'
  }
  notifications: {
    emailAlerts: boolean
    errorNotifications: boolean
    successNotifications: boolean
    dailyReports: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [tokenDaysRemaining, setTokenDaysRemaining] = useState<number | null>(null)
  const [linkedinTokenDaysRemaining, setLinkedinTokenDaysRemaining] = useState<number | null>(null)
  const [showTokenGenerator, setShowTokenGenerator] = useState(false)
  const [tokenGeneratorPlatform, setTokenGeneratorPlatform] = useState<'instagram' | 'linkedin'>('instagram')
  const [tokenAlerts, setTokenAlerts] = useState<Array<{platform: string, daysRemaining: number, urgency: string}>>([])
  const [lastReminderCheck, setLastReminderCheck] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
    // Verificar lembretes pendentes quando carregar a página
    checkTokenReminders()
  }, [])

  useEffect(() => {
    if (settings?.api.instagramTokenExpiryDate) {
      calculateDaysRemaining(settings.api.instagramTokenExpiryDate)
    }
    if (settings?.api.linkedinTokenExpiryDate) {
      calculateLinkedinDaysRemaining(settings.api.linkedinTokenExpiryDate)
    }
  }, [settings?.api.instagramTokenExpiryDate, settings?.api.linkedinTokenExpiryDate])

  const calculateDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setTokenDaysRemaining(diffDays)
  }

  const calculateLinkedinDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setLinkedinTokenDaysRemaining(diffDays)
  }

  const checkTokenReminders = async () => {
    try {
      console.log('🔍 Verificando status dos tokens...')
      
      const response = await fetch('/api/admin/token-check')
      const data = await response.json()
      
      if (data.success && data.alerts) {
        setTokenAlerts(data.alerts)
        
        // Marcar verificação realizada
        const now = new Date().toISOString()
        setLastReminderCheck(now)
        localStorage.setItem('lastTokenCheck', now)

        // Se houver alertas críticos, mostrar notificação
        const criticalAlerts = data.alerts.filter((a: any) => a.urgency === 'critical')
        if (criticalAlerts.length > 0) {
          setMessage({
            type: 'error',
            text: `⚠️ ${criticalAlerts.length} token(s) expiram em menos de 3 dias! Renove urgentemente.`
          })
        } else if (data.alerts.length > 0) {
          setMessage({
            type: 'error',
            text: `📅 ${data.alerts.length} token(s) precisam de atenção nas próximas semanas.`
          })
        }

        console.log('✅ Verificação de tokens concluída:', data.summary)
      } else {
        console.warn('⚠️ Erro na verificação de tokens:', data.error)
      }
    } catch (error) {
      console.error('❌ Erro ao verificar lembretes:', error)
      
      // Fallback: verificação local se API falhar
      const alerts = []
      
      if (settings?.api.instagramTokenExpiryDate) {
        const daysRemaining = getDaysRemaining(settings.api.instagramTokenExpiryDate)
        if (daysRemaining <= 30) {
          alerts.push({
            platform: 'Instagram',
            daysRemaining,
            urgency: daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'high' : 'medium'
          })
        }
      }

      if (settings?.api.linkedinTokenExpiryDate) {
        const daysRemaining = getDaysRemaining(settings.api.linkedinTokenExpiryDate)
        if (daysRemaining <= 30) {
          alerts.push({
            platform: 'LinkedIn',
            daysRemaining,
            urgency: daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'high' : 'medium'
          })
        }
      }

      setTokenAlerts(alerts)
    }
  }

  const getDaysRemaining = (expiryDate: string): number => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
    }
  }

  const handleLinkedinTokenRenewal = () => {
    const newExpiryDate = new Date()
    newExpiryDate.setDate(newExpiryDate.getDate() + 60)
    updateSettings('api', 'linkedinTokenExpiryDate', newExpiryDate.toISOString())
    setMessage({ type: 'success', text: 'Data de expiração do LinkedIn renovada! Lembre-se de atualizar o token no LinkedIn.' })
  }

  const handleTokenRenewal = () => {
    const newExpiryDate = new Date()
    newExpiryDate.setDate(newExpiryDate.getDate() + 60)
    updateSettings('api', 'instagramTokenExpiryDate', newExpiryDate.toISOString())
    setMessage({ type: 'success', text: 'Data de expiração renovada! Lembre-se de atualizar o token no Instagram.' })
    
    // Criar lembretes automáticos
    createTokenReminder('instagram', newExpiryDate.toISOString())
  }

  const handleOpenTokenGenerator = (platform: 'instagram' | 'linkedin') => {
    setTokenGeneratorPlatform(platform)
    setShowTokenGenerator(true)
  }

  const handleTokenGenerated = async (token: string, expiryDate: string) => {
    // Atualizar token e data de expiração nas configurações
    if (tokenGeneratorPlatform === 'instagram') {
      updateSettings('api', 'instagramToken', token)
      updateSettings('api', 'instagramTokenExpiryDate', expiryDate)
    } else {
      updateSettings('api', 'linkedinToken', token)
      updateSettings('api', 'linkedinTokenExpiryDate', expiryDate)
    }

    // Criar lembretes automáticos
    await createTokenReminder(tokenGeneratorPlatform, expiryDate)

    setMessage({ 
      type: 'success', 
      text: `Token ${tokenGeneratorPlatform === 'instagram' ? 'Instagram' : 'LinkedIn'} atualizado com sucesso! Lembretes automáticos criados.` 
    })
    
    // Salvar automaticamente
    setTimeout(handleSave, 1000)
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Buscar configurações reais da API
      const response = await fetch('/api/admin/settings')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setSettings(data.settings)
          return
        }
      }
      
      // Se falhar, usar configurações padrão
      setSettings({
        automation: {
          blogGeneration: true,
          instagramGeneration: true,
          autoPublishing: true,
          batchSize: 10
        },
        api: {
          openaiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
          instagramToken: process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN || '',
          linkedinToken: process.env.NEXT_PUBLIC_LINKEDIN_TOKEN || '',
          emailService: true,
          databaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        },
        content: {
          blogLanguages: ['pt-BR', 'en-US'],
          instagramNiches: ['advogados', 'medicos', 'terapeutas', 'nutricionistas'],
          defaultAuthor: 'Izadora Cury Pierette',
          contentTone: 'professional'
        },
        notifications: {
          emailAlerts: true,
          errorNotifications: true,
          successNotifications: false,
          dailyReports: true
        }
      })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      
      // Mesmo em erro, carregar configurações padrão
      setSettings({
        automation: {
          blogGeneration: true,
          instagramGeneration: true,
          autoPublishing: true,
          batchSize: 10
        },
        api: {
          openaiKey: '',
          instagramToken: '',
          linkedinToken: '',
          emailService: true,
          databaseUrl: ''
        },
        content: {
          blogLanguages: ['pt-BR', 'en-US'],
          instagramNiches: ['advogados', 'medicos', 'terapeutas', 'nutricionistas'],
          defaultAuthor: 'Izadora Cury Pierette',
          contentTone: 'professional'
        },
        notifications: {
          emailAlerts: true,
          errorNotifications: true,
          successNotifications: false,
          dailyReports: true
        }
      })
      
      setMessage({ 
        type: 'error', 
        text: 'Usando configurações padrão. Algumas funcionalidades podem estar limitadas.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Salvar configurações reais na API
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Configurações salvas com sucesso!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar configurações' })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = <K extends keyof SystemSettings>(
    section: K,
    field: keyof SystemSettings[K],
    value: any
  ) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    })
  }

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayoutWrapper title="Configurações" description="Configurações do sistema">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </AdminLayoutWrapper>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <AdminLayoutWrapper title="Configurações" description="Configurações do sistema">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Configurações do Sistema
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie APIs, automação e preferências
              </p>
            </div>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>

          {/* Message Alert */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Token Alerts Panel */}
          {tokenAlerts.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-200">
                  <AlertCircle className="h-5 w-5" />
                  ⚠️ Alertas de Token
                </CardTitle>
                <CardDescription>
                  {tokenAlerts.length} token(s) precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tokenAlerts.map((alert, index) => (
                  <div
                    key={`${alert.platform}-${index}`}
                    className={`p-3 rounded-lg border ${getUrgencyColor(alert.urgency)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Token {alert.platform} {alert.daysRemaining <= 0 ? 'EXPIRADO' : `expira em ${alert.daysRemaining} dias`}
                        </p>
                        <p className="text-sm opacity-80">
                          {alert.urgency === 'critical' && '🚨 AÇÃO URGENTE NECESSÁRIA'}
                          {alert.urgency === 'high' && '⚠️ Renovação recomendada'}
                          {alert.urgency === 'medium' && '📅 Planeje a renovação'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenTokenGenerator(alert.platform.toLowerCase() as 'instagram' | 'linkedin')}
                        className="gap-2"
                      >
                        🔄 Renovar
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Última verificação: {lastReminderCheck ? new Date(lastReminderCheck).toLocaleString('pt-BR') : 'Agora'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={checkTokenReminders}
                      className="gap-1 h-6 px-2 text-xs"
                    >
                      🔄 Verificar Novamente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Configurações de Automação
              </CardTitle>
              <CardDescription>
                Controle o comportamento dos sistemas automáticos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Geração de Blog</Label>
                    <p className="text-sm text-muted-foreground">Gera posts automaticamente</p>
                  </div>
                  <Switch
                    checked={settings?.automation.blogGeneration}
                    onCheckedChange={(value) => updateSettings('automation', 'blogGeneration', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Geração Instagram</Label>
                    <p className="text-sm text-muted-foreground">Gera posts do Instagram</p>
                  </div>
                  <Switch
                    checked={settings?.automation.instagramGeneration}
                    onCheckedChange={(value) => updateSettings('automation', 'instagramGeneration', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Publicação Automática</Label>
                    <p className="text-sm text-muted-foreground">Publica posts aprovados</p>
                  </div>
                  <Switch
                    checked={settings?.automation.autoPublishing}
                    onCheckedChange={(value) => updateSettings('automation', 'autoPublishing', value)}
                  />
                </div>

                <div>
                  <Label className="font-medium">Tamanho do Lote</Label>
                  <p className="text-sm text-muted-foreground mb-2">Posts por execução</p>
                  <Input
                    type="number"
                    value={settings?.automation.batchSize}
                    onChange={(e) => updateSettings('automation', 'batchSize', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configurações de API
              </CardTitle>
              <CardDescription>
                Chaves e tokens para serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="font-medium">Mostrar chaves API</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="gap-2"
                >
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showApiKeys ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label className="font-medium">OpenAI API Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings?.api.openaiKey}
                      onChange={(e) => updateSettings('api', 'openaiKey', e.target.value)}
                      placeholder="sk-proj-..."
                    />
                    <div className="flex items-center gap-1">
                      {settings?.api.openaiKey && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Instagram Access Token</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings?.api.instagramToken}
                      onChange={(e) => updateSettings('api', 'instagramToken', e.target.value)}
                      placeholder="IGQWRP..."
                    />
                    <div className="flex items-center gap-1">
                      {settings?.api.instagramToken && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Botão para gerar novo token */}
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTokenGenerator('instagram')}
                      className="gap-2 flex-1"
                    >
                      <Instagram className="h-4 w-4" />
                      🚀 Gerar Novo Token (60 dias)
                    </Button>
                  </div>
                  
                  {/* Token Expiry Info */}
                  {settings?.api.instagramTokenExpiryDate && tokenDaysRemaining !== null && (
                    <div className={`mt-3 p-3 rounded-lg border ${
                      tokenDaysRemaining <= 1 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                        : tokenDaysRemaining <= 7
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {tokenDaysRemaining <= 0 
                              ? '⚠️ Token Expirado!' 
                              : tokenDaysRemaining === 1
                              ? '⚠️ Expira amanhã!'
                              : `${tokenDaysRemaining} dias restantes`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expira em: {new Date(settings.api.instagramTokenExpiryDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTokenRenewal}
                          className="gap-2"
                        >
                          🔄 Renovar
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Adicionar data de expiração se não existir */}
                  {!settings?.api.instagramTokenExpiryDate && settings?.api.instagramToken && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTokenRenewal}
                        className="gap-2 w-full"
                      >
                        📅 Definir Data de Expiração (60 dias)
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="font-medium">LinkedIn Access Token</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings?.api.linkedinToken}
                      onChange={(e) => updateSettings('api', 'linkedinToken', e.target.value)}
                      placeholder="AQX..."
                    />
                    <div className="flex items-center gap-1">
                      {settings?.api.linkedinToken && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Botão para gerar novo token LinkedIn */}
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTokenGenerator('linkedin')}
                      className="gap-2 flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      💼 Gerar Novo Token LinkedIn (60 dias)
                    </Button>
                  </div>
                  
                  {/* LinkedIn Token Expiry Info */}
                  {settings?.api.linkedinTokenExpiryDate && linkedinTokenDaysRemaining !== null && (
                    <div className={`mt-3 p-3 rounded-lg border ${
                      linkedinTokenDaysRemaining <= 1 
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                        : linkedinTokenDaysRemaining <= 7
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {linkedinTokenDaysRemaining <= 0 
                              ? '⚠️ Token LinkedIn Expirado!' 
                              : linkedinTokenDaysRemaining === 1
                              ? '⚠️ Expira amanhã!'
                              : `${linkedinTokenDaysRemaining} dias restantes`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expira em: {new Date(settings.api.linkedinTokenExpiryDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLinkedinTokenRenewal}
                          className="gap-2"
                        >
                          🔄 Renovar
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Adicionar data de expiração LinkedIn se não existir */}
                  {!settings?.api.linkedinTokenExpiryDate && settings?.api.linkedinToken && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLinkedinTokenRenewal}
                        className="gap-2 w-full"
                      >
                        📅 Definir Data de Expiração LinkedIn (60 dias)
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="font-medium">Database URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type={showApiKeys ? 'text' : 'password'}
                      value={settings?.api.databaseUrl}
                      onChange={(e) => updateSettings('api', 'databaseUrl', e.target.value)}
                      placeholder="postgresql://..."
                    />
                    <div className="flex items-center gap-1">
                      {settings?.api.databaseUrl && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações de Conteúdo
              </CardTitle>
              <CardDescription>
                Preferências para geração de conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-medium">Autor Padrão</Label>
                <Input
                  value={settings?.content.defaultAuthor}
                  onChange={(e) => updateSettings('content', 'defaultAuthor', e.target.value)}
                  placeholder="Nome do autor"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="font-medium">Tom do Conteúdo</Label>
                <select
                  value={settings?.content.contentTone}
                  onChange={(e) => updateSettings('content', 'contentTone', e.target.value)}
                  className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="professional">Profissional</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Técnico</option>
                </select>
              </div>

              <div>
                <Label className="font-medium">Idiomas do Blog</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Idiomas: {settings?.content.blogLanguages.join(', ')}
                </p>
              </div>

              <div>
                <Label className="font-medium">Nichos do Instagram</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Nichos: {settings?.content.instagramNiches.join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Alertas por Email</Label>
                    <p className="text-sm text-muted-foreground">Receber alertas importantes</p>
                  </div>
                  <Switch
                    checked={settings?.notifications.emailAlerts}
                    onCheckedChange={(value) => updateSettings('notifications', 'emailAlerts', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Notificações de Erro</Label>
                    <p className="text-sm text-muted-foreground">Avisos quando algo falha</p>
                  </div>
                  <Switch
                    checked={settings?.notifications.errorNotifications}
                    onCheckedChange={(value) => updateSettings('notifications', 'errorNotifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Notificações de Sucesso</Label>
                    <p className="text-sm text-muted-foreground">Confirmações de tarefas</p>
                  </div>
                  <Switch
                    checked={settings?.notifications.successNotifications}
                    onCheckedChange={(value) => updateSettings('notifications', 'successNotifications', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Relatórios Diários</Label>
                    <p className="text-sm text-muted-foreground">Resumo diário por email</p>
                  </div>
                  <Switch
                    checked={settings?.notifications.dailyReports}
                    onCheckedChange={(value) => updateSettings('notifications', 'dailyReports', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>
                Status e informações técnicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Versão</div>
                  <div className="text-lg font-semibold">CATBytes v2.0</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Ambiente</div>
                  <div className="text-lg font-semibold">Produção</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Cron Jobs</div>
                  <div className="text-lg font-semibold text-green-600">2/2 Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Generator Modal */}
        <TokenGeneratorModal
          open={showTokenGenerator}
          onOpenChange={setShowTokenGenerator}
          platform={tokenGeneratorPlatform}
          onTokenGenerated={handleTokenGenerated}
        />
      </AdminLayoutWrapper>
    </AdminGuard>
  )
}