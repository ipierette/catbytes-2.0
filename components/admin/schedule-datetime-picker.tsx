'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'

interface ScheduleDateTimePickerProps {
  value?: Date
  onChange: (date: Date) => void
  minDate?: Date
  label?: string
  required?: boolean
}

export function ScheduleDateTimePicker({ 
  value, 
  onChange, 
  minDate,
  label = 'Agendar para',
  required = false
}: ScheduleDateTimePickerProps) {
  const [dateValue, setDateValue] = useState('')
  const [timeValue, setTimeValue] = useState('')

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setDateValue(date.toISOString().split('T')[0])
      setTimeValue(date.toTimeString().slice(0, 5))
    } else {
      // Default: próxima hora cheia
      const now = new Date()
      now.setHours(now.getHours() + 1, 0, 0, 0)
      setDateValue(now.toISOString().split('T')[0])
      setTimeValue(now.toTimeString().slice(0, 5))
      onChange(now)
    }
  }, [])

  useEffect(() => {
    if (dateValue && timeValue) {
      const combined = new Date(`${dateValue}T${timeValue}`)
      if (!isNaN(combined.getTime())) {
        onChange(combined)
      }
    }
  }, [dateValue, timeValue])

  const handleQuickSchedule = (hours: number) => {
    const scheduled = new Date()
    scheduled.setHours(scheduled.getHours() + hours, 0, 0, 0)
    setDateValue(scheduled.toISOString().split('T')[0])
    setTimeValue(scheduled.toTimeString().slice(0, 5))
  }

  const min = minDate || new Date()
  const minDateStr = min.toISOString().split('T')[0]
  const minTimeStr = dateValue === minDateStr ? min.toTimeString().slice(0, 5) : '00:00'

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label} {required && '*'}</Label>
      
      {/* Quick schedule buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickSchedule(1)}
          className="text-xs"
        >
          +1h
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickSchedule(3)}
          className="text-xs"
        >
          +3h
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickSchedule(24)}
          className="text-xs"
        >
          +1 dia
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickSchedule(48)}
          className="text-xs"
        >
          +2 dias
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleQuickSchedule(168)}
          className="text-xs"
        >
          +1 semana
        </Button>
      </div>

      {/* Date and time inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Data
          </Label>
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            min={minDateStr}
            required={required}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Hora
          </Label>
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            min={dateValue === minDateStr ? minTimeStr : undefined}
            required={required}
            className="text-sm"
          />
        </div>
      </div>

      {/* Preview */}
      {dateValue && timeValue && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          📅 Agendado para: {new Date(`${dateValue}T${timeValue}`).toLocaleString('pt-BR', {
            dateStyle: 'full',
            timeStyle: 'short'
          })}
        </div>
      )}
    </div>
  )
}
