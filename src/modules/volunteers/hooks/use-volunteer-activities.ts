import { useCallback, useEffect, useRef, useState } from "react"
import { volunteersService } from "../services/volunteers.service"
import type { PaginatedResponse, VolunteerActivity, VolunteerActivityFilters } from "../types"

interface UseVolunteerActivitiesResult {
  activities: VolunteerActivity[]
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

function isPaginatedResponse(value: unknown): value is PaginatedResponse<VolunteerActivity> {
  return !!value && typeof value === "object" && "data" in value
}

export function useVolunteerActivities(filters?: VolunteerActivityFilters): UseVolunteerActivitiesResult {
  const [activities, setActivities] = useState<VolunteerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<UseVolunteerActivitiesResult["pagination"]>(null)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await volunteersService.getActivities(filtersRef.current)
      if (isPaginatedResponse(data)) {
        setActivities(data.data)
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
          nextPage: data.nextPage,
          previousPage: data.previousPage,
          limit: data.limit,
        })
      } else {
        setActivities(data)
        setPagination(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar actividades"))
      setActivities([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return { activities, loading, error, pagination, refetch: loadActivities }
}
