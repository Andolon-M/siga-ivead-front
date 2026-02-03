import { useState, useEffect, useCallback } from "react"
import { meetingsService } from "../services/meetings.service"
import type {
  MeetingSession,
  SessionFilters,
  GenerateSessionsRequest,
} from "../types"

export function useSessions(filters?: SessionFilters) {
  const [sessions, setSessions] = useState<MeetingSession[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await meetingsService.getSessions(filters)
      setSessions(response.sessions)
      setTotal(response.total)
    } catch (err) {
      setError(err as Error)
      console.error("Error al obtener sesiones:", err)
    } finally {
      setIsLoading(false)
    }
  }, [
    filters?.recurring_meeting_id,
    filters?.status,
    filters?.date_from,
    filters?.date_to,
  ])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const generateSessions = useCallback(
    async (data: GenerateSessionsRequest) => {
      const result = await meetingsService.generateSessions(data)
      await fetchSessions()
      return result
    },
    [fetchSessions]
  )

  return {
    sessions,
    total,
    isLoading,
    error,
    refetch: fetchSessions,
    generateSessions,
  }
}
