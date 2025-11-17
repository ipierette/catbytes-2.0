import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Instagram, TrendingUp, Mail, Users } from 'lucide-react'

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acesso direto às principais funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => window.open('/admin/blog', '_self')}
          >
            <FileText className="h-6 w-6" />
            Blog Admin
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => window.open('/admin/instagram', '_self')}
          >
            <Instagram className="h-6 w-6" />
            Instagram Admin
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => window.open('/admin/analytics', '_self')}
          >
            <TrendingUp className="h-6 w-6" />
            Analytics
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => window.open('/admin/email-preview', '_self')}
          >
            <Mail className="h-6 w-6" />
            Email Preview
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2"
            onClick={() => window.open('/admin/settings', '_self')}
          >
            <Users className="h-6 w-6" />
            Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
