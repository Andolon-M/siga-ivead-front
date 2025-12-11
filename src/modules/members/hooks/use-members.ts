import { useState, useEffect, useCallback } from "react"
import type { Member, MemberFilters, PaginatedResponse } from "../types"
import { membersService } from "../services/members.service"

interface UseMembersResult {
  members: Member[]
  loading: boolean
  error: Error | null
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    nextPage: number | null
    previousPage: number | null
    limit: number
  } | null
  refetch: () => Promise<void>
}

export function useMembers(filters?: MemberFilters): UseMembersResult {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<{
    currentPage: number
    totalPages: number
    total: number
    nextPage: number | null
    previousPage: number | null
    limit: number
  } | null>(null)

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await membersService.getMembers(filters)
      
      // Si es un solo miembro (búsqueda por id, dni o userId)
      if (!("data" in data)) {
        setMembers([data as Member])
        setPagination(null)
      } else {
        // Si es una respuesta paginada
        const paginatedData = data as PaginatedResponse<Member>
        setMembers(paginatedData.data)
        setPagination({
          currentPage: paginatedData.currentPage,
          totalPages: paginatedData.totalPages,
          total: paginatedData.total,
          nextPage: paginatedData.nextPage,
          previousPage: paginatedData.previousPage,
          limit: paginatedData.limit,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar miembros"))
      setMembers([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  return {
    members,
    loading,
    error,
    pagination,
    refetch: loadMembers,
  }
}

