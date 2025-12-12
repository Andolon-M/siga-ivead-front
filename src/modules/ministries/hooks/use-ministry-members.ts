import { useState, useEffect, useCallback } from "react"
import { ministriesService } from "../services/ministries.service"
import type {
  MinistryMember,
  MinistryMemberFilters,
  AddMemberToMinistryRequest,
  UpdateMemberRoleRequest,
  MinistryMemberStats,
} from "../types"

export function useMinistryMembers(filters: MinistryMemberFilters) {
  const [members, setMembers] = useState<MinistryMember[]>([])
  const [stats, setStats] = useState<MinistryMemberStats | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: filters?.page || 1,
    totalPages: 1,
    count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await ministriesService.getMinistryMembers(filters)

      // Si es un miembro específico
      if (!("data" in response)) {
        setMembers([response])
        setPagination({ currentPage: 1, totalPages: 1, count: 1 })
      } else {
        // Si es una lista paginada
        setMembers(response.data)
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          count: response.total,
        })
      }
    } catch (err) {
      setError(err as Error)
      console.error("Error al obtener miembros del ministerio:", err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await ministriesService.getMinistryMemberStats(
        filters.ministryId
      )
      setStats(statsData)
    } catch (err) {
      console.error("Error al obtener estadísticas:", err)
    }
  }, [filters.ministryId])

  const addMember = useCallback(
    async (data: AddMemberToMinistryRequest) => {
      try {
        await ministriesService.addMemberToMinistry(filters.ministryId, data)
        await fetchMembers()
        await fetchStats()
      } catch (err) {
        console.error("Error al agregar miembro:", err)
        throw err
      }
    },
    [filters.ministryId, fetchMembers, fetchStats]
  )

  const removeMember = useCallback(
    async (memberId: string) => {
      try {
        await ministriesService.removeMemberFromMinistry(
          filters.ministryId,
          memberId
        )
        await fetchMembers()
        await fetchStats()
      } catch (err) {
        console.error("Error al eliminar miembro:", err)
        throw err
      }
    },
    [filters.ministryId, fetchMembers, fetchStats]
  )

  const updateMemberRole = useCallback(
    async (memberId: string, data: UpdateMemberRoleRequest) => {
      try {
        await ministriesService.updateMemberRole(
          filters.ministryId,
          memberId,
          data
        )
        await fetchMembers()
        await fetchStats()
      } catch (err) {
        console.error("Error al actualizar rol:", err)
        throw err
      }
    },
    [filters.ministryId, fetchMembers, fetchStats]
  )

  useEffect(() => {
    fetchMembers()
    fetchStats()
  }, [fetchMembers, fetchStats])

  return {
    members,
    stats,
    pagination,
    isLoading,
    error,
    refetch: fetchMembers,
    addMember,
    removeMember,
    updateMemberRole,
  }
}

