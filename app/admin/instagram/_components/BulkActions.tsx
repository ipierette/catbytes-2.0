import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckSquare, Square, Trash2, CheckCircle } from 'lucide-react'

interface BulkActionsProps {
  bulkMode: boolean
  selectedCount: number
  totalCount: number
  allSelected: boolean
  loading?: boolean
  onToggleBulkMode: () => void
  onSelectAll: () => void
  onBulkApprove?: () => void
  onBulkReject: () => void
  onCancel: () => void
}

export function BulkActions({
  bulkMode,
  selectedCount,
  totalCount,
  allSelected,
  loading = false,
  onToggleBulkMode,
  onSelectAll,
  onBulkApprove,
  onBulkReject,
  onCancel
}: BulkActionsProps) {
  if (!bulkMode && totalCount === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button
          variant={bulkMode ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleBulkMode}
          className="gap-2"
        >
          {bulkMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          {bulkMode ? '✓ Modo Seleção Ativo' : '☑️ Modo Seleção'}
        </Button>

        {bulkMode && selectedCount > 0 && (
          <div className="flex items-center gap-2">
            {onBulkApprove && (
              <Button
                onClick={onBulkApprove}
                variant="default"
                size="sm"
                className="gap-2 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4" />
                Aprovar {selectedCount}
              </Button>
            )}
            <Button
              onClick={onBulkReject}
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              Rejeitar {selectedCount}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {bulkMode && totalCount > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Selecionar todos ({selectedCount}/{totalCount} selecionados)
          </span>
        </div>
      )}
    </div>
  )
}
