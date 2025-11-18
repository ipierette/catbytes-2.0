import { useState, useCallback } from 'react'

export interface ApprovalResult {
  success: boolean
  message?: string
  error?: string
  scheduledFor?: string
}

export interface BulkApprovalResult {
  total: number
  successful: number
  failed: number
  errors: string[]
}

export function useInstagramApproval() {
  const [approving, setApproving] = useState(false)
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set())

  const approvePost = useCallback(async (postId: string): Promise<ApprovalResult> => {
    setApproving(true)
    setApprovingIds(prev => new Set(prev).add(postId))

    try {
      const response = await fetch(`/api/instagram/approve/${postId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          message: data.message || 'Post aprovado com sucesso!',
          scheduledFor: data.scheduledFor
        }
      } else {
        return {
          success: false,
          error: data.error || 'Erro ao aprovar post'
        }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro de conexão'
      }
    } finally {
      setApproving(false)
      setApprovingIds(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }, [])

  const bulkApprove = useCallback(async (postIds: string[]): Promise<BulkApprovalResult> => {
    setApproving(true)
    
    const result: BulkApprovalResult = {
      total: postIds.length,
      successful: 0,
      failed: 0,
      errors: []
    }

    for (const postId of postIds) {
      setApprovingIds(prev => new Set(prev).add(postId))

      try {
        const response = await fetch(`/api/instagram/approve/${postId}`, {
          method: 'POST'
        })

        const data = await response.json()

        if (data.success) {
          result.successful++
        } else {
          result.failed++
          result.errors.push(`Post ${postId}: ${data.error || 'Erro desconhecido'}`)
        }
      } catch (err) {
        result.failed++
        result.errors.push(`Post ${postId}: ${err instanceof Error ? err.message : 'Erro de conexão'}`)
      } finally {
        setApprovingIds(prev => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
      }
    }

    setApproving(false)
    return result
  }, [])

  const rejectPost = useCallback(async (
    postId: string, 
    reason = 'Qualidade da imagem/conteúdo não aprovada'
  ): Promise<ApprovalResult> => {
    try {
      const response = await fetch(`/api/instagram/reject/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          message: 'Post rejeitado'
        }
      } else {
        return {
          success: false,
          error: data.error || 'Erro ao rejeitar post'
        }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro de conexão'
      }
    }
  }, [])

  const bulkReject = useCallback(async (
    postIds: string[], 
    reason = 'Rejeição em lote via admin'
  ): Promise<BulkApprovalResult> => {
    const result: BulkApprovalResult = {
      total: postIds.length,
      successful: 0,
      failed: 0,
      errors: []
    }

    const promises = postIds.map(postId =>
      fetch(`/api/instagram/reject/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
    )

    const results = await Promise.allSettled(promises)

    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        result.successful++
      } else {
        result.failed++
        result.errors.push(`Post ${postIds[index]}: ${res.reason}`)
      }
    })

    return result
  }, [])

  const publishNow = useCallback(async (postId: string): Promise<ApprovalResult> => {
    setApprovingIds(prev => new Set(prev).add(postId))

    try {
      const response = await fetch(`/api/instagram/publish-now/${postId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          message: `Post publicado com sucesso! ${data.instagramUrl || ''}`
        }
      } else {
        return {
          success: false,
          error: data.error || 'Erro ao publicar no Instagram'
        }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro de conexão'
      }
    } finally {
      setApprovingIds(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }, [])

  return {
    approving,
    approvingIds,
    approvePost,
    bulkApprove,
    rejectPost,
    bulkReject,
    publishNow
  }
}
