import { useCallback, useEffect, useRef, useState } from "react"
import { volunteersService } from "../services/volunteers.service"
import type { PaginatedResponse, TaskOccurrence, TaskOccurrenceFilters } from "../types"

interface UseTaskOccurrencesResult {
  occurrences: TaskOccurrence[]
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

function isPaginatedResponse(value: unknown): value is PaginatedResponse<TaskOccurrence> {
  return !!value && typeof value === "object" && "data" in value
}

export function useTaskOccurrences(filters?: TaskOccurrenceFilters): UseTaskOccurrencesResult {
  const [occurrences, setOccurrences] = useState<TaskOccurrence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<UseTaskOccurrencesResult["pagination"]>(null)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const loadOccurrences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await volunteersService.getOccurrences(filtersRef.current)
      if (isPaginatedResponse(data)) {
        setOccurrences(data.data)
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
          nextPage: data.nextPage,
          previousPage: data.previousPage,
          limit: data.limit,
        })
      } else {
        setOccurrences(data)
        setPagination(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar ocurrencias"))
      setOccurrences([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOccurrences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return { occurrences, loading, error, pagination, refetch: loadOccurrences }
}
