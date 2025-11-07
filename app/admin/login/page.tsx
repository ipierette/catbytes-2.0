'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAdmin } from '@/hooks/use-admin'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAdmin()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Se email não foi preenchido, usa o padrão
      const emailToUse = email.trim() || undefined
      const success = await login(password, emailToUse)
      
      if (success) {
        router.push('/admin/dashboard')
      } else {
        setError('Senha incorreta')
      }
    } catch {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Digite a senha de administrador para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email (opcional - padrão: ipierette2@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="text-center"
              />
              <p className="text-xs text-muted-foreground text-center">
                Deixe em branco para usar o email padrão
              </p>
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha de administrador"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="text-center"
                autoFocus
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Acesso restrito apenas para administradores
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}