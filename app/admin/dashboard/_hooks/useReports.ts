import { useState } from 'react'

export function useReports() {
  const [sendingReport, setSendingReport] = useState<'daily' | 'weekly' | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const sendReport = async (type: 'daily' | 'weekly') => {
    try {
      setSendingReport(type)
      setMessage(null)

      const response = await fetch('/api/reports/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || `Relatório ${type === 'daily' ? 'diário' : 'semanal'} enviado com sucesso!`
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao enviar relatório'
        })
      }
    } catch (error) {
      console.error('Error sending report:', error)
      setMessage({
        type: 'error',
        text: 'Erro ao enviar relatório'
      })
    } finally {
      setSendingReport(null)
      // Remove mensagem após 5 segundos
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return {
    sendReport,
    sendingReport,
    message,
    clearMessage: () => setMessage(null)
  }
}
