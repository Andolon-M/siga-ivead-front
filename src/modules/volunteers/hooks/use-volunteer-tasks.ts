import { useCallback, useEffect, useRef, useState } from "react"
import { volunteersService } from "../services/volunteers.service"
import type { PaginatedResponse, VolunteerTask, VolunteerTaskFilters } from "../types"

interface UseVolunteerTasksResult {
  tasks: VolunteerTask[]
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

function isPaginatedResponse(value: unknown): value is PaginatedResponse<VolunteerTask> {
  return !!value && typeof value === "object" && "data" in value
}

export function useVolunteerTasks(filters?: VolunteerTaskFilters): UseVolunteerTasksResult {
  const [tasks, setTasks] = useState<VolunteerTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<UseVolunteerTasksResult["pagination"]>(null)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await volunteersService.getTasks(filtersRef.current)
      if (isPaginatedResponse(data)) {
        setTasks(data.data)
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
          nextPage: data.nextPage,
          previousPage: data.previousPage,
          limit: data.limit,
        })
      } else {
        setTasks(data)
        setPagination(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar tareas de voluntariado"))
      setTasks([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return { tasks, loading, error, pagination, refetch: loadTasks }
}
