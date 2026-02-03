import { useState, useEffect, useCallback } from "react"
import { meetingsService } from "../services/meetings.service"
import type {
  RecurringMeeting,
  CreateRecurringMeetingRequest,
  UpdateRecurringMeetingRequest,
  RecurringMeetingFilters,
  RecurringMeetingStats,
} from "../types"

export function useRecurringMeetings(filters?: RecurringMeetingFilters) {
  const [meetings, setMeetings] = useState<RecurringMeeting[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await meetingsService.getRecurringMeetings(filters)
      setMeetings(response.meetings)
      setTotal(response.total)
    } catch (err) {
      setError(err as Error)
      console.error("Error al obtener reuniones:", err)
    } finally {
      setIsLoading(false)
    }
  }, [filters?.is_active, filters?.recurrence_type, filters?.day_of_week, filters?.ministry_id])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const createMeeting = useCallback(
    async (data: CreateRecurringMeetingRequest) => {
      const result = await meetingsService.createRecurringMeeting(data)
      await fetchMeetings()
      return result
    },
    [fetchMeetings]
  )

  const updateMeeting = useCallback(
    async (id: string, data: UpdateRecurringMeetingRequest) => {
      const result = await meetingsService.updateRecurringMeeting(id, data)
      await fetchMeetings()
      return result
    },
    [fetchMeetings]
  )

  const deleteMeeting = useCallback(
    async (id: string) => {
      await meetingsService.deleteRecurringMeeting(id)
      await fetchMeetings()
    },
    [fetchMeetings]
  )

  return {
    meetings,
    total,
    isLoading,
    error,
    refetch: fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  }
}

export function useMeetingsStats() {
  const [stats, setStats] = useState<RecurringMeetingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await meetingsService.getRecurringMeetingStats()
      setStats(data)
    } catch (err) {
      console.error("Error al obtener estadísticas:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, refetch: fetchStats }
}
