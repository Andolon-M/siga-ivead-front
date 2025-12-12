import { useState, useEffect, useCallback } from "react"
import { ministriesService } from "../services/ministries.service"
import type {
  Ministry,
  CreateMinistryRequest,
  UpdateMinistryRequest,
  MinistryFilters,
  MinistryStats,
} from "../types"

export function useMinistries(filters?: MinistryFilters) {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [stats, setStats] = useState<MinistryStats | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: filters?.page || 1,
    totalPages: 1,
    count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMinistries = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await ministriesService.getMinistries(filters)

      // Si es un ministerio específico (búsqueda por id)
      if (!("data" in response)) {
        setMinistries([response])
        setPagination({ currentPage: 1, totalPages: 1, count: 1 })
      } else {
        // Si es una lista paginada
        setMinistries(response.data)
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          count: response.total,
        })
      }
    } catch (err) {
      setError(err as Error)
      console.error("Error al obtener ministerios:", err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await ministriesService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error("Error al obtener estadísticas:", err)
    }
  }, [])

  const createMinistry = useCallback(
    async (data: CreateMinistryRequest) => {
      try {
        await ministriesService.createMinistry(data)
        await fetchMinistries()
        await fetchStats()
      } catch (err) {
        console.error("Error al crear ministerio:", err)
        throw err
      }
    },
    [fetchMinistries, fetchStats]
  )

  const updateMinistry = useCallback(
    async (id: string, data: UpdateMinistryRequest) => {
      try {
        await ministriesService.updateMinistry(id, data)
        await fetchMinistries()
        await fetchStats()
      } catch (err) {
        console.error("Error al actualizar ministerio:", err)
        throw err
      }
    },
    [fetchMinistries, fetchStats]
  )

  const deleteMinistry = useCallback(
    async (id: string) => {
      try {
        await ministriesService.deleteMinistry(id)
        await fetchMinistries()
        await fetchStats()
      } catch (err) {
        console.error("Error al eliminar ministerio:", err)
        throw err
      }
    },
    [fetchMinistries, fetchStats]
  )

  useEffect(() => {
    fetchMinistries()
    fetchStats()
  }, [fetchMinistries, fetchStats])

  return {
    ministries,
    stats,
    pagination,
    isLoading,
    error,
    refetch: fetchMinistries,
    createMinistry,
    updateMinistry,
    deleteMinistry,
  }
}
