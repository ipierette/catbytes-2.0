import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading 
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Anterior
      </Button>
      
      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
      
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || loading}
      >
        Próxima
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      </Button>
    </div>
  )
}
