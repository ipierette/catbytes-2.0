import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, FileBarChart, Clock } from 'lucide-react'

interface ReportsCardProps {
  onSendReport: (type: 'daily' | 'weekly') => void
  sendingReport: 'daily' | 'weekly' | null
}

export function ReportsCard({ onSendReport, sendingReport }: ReportsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Relatórios por Email
        </CardTitle>
        <CardDescription>
          Envie relatórios de atividades do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold">Relatório Diário</h4>
                <p className="text-sm text-muted-foreground">
                  Resumo das atividades de hoje
                </p>
              </div>
            </div>
            <Button 
              onClick={() => onSendReport('daily')}
              disabled={sendingReport === 'daily'}
              className="w-full"
            >
              {sendingReport === 'daily' ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Relatório Diário
                </>
              )}
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold">Relatório Semanal</h4>
                <p className="text-sm text-muted-foreground">
                  Resumo dos últimos 7 dias
                </p>
              </div>
            </div>
            <Button 
              onClick={() => onSendReport('weekly')}
              disabled={sendingReport === 'weekly'}
              className="w-full"
              variant="outline"
            >
              {sendingReport === 'weekly' ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Relatório Semanal
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
