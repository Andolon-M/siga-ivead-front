import { useCallback, useEffect, useMemo, useState } from "react"
import { volunteersService } from "../services/volunteers.service"
import type { MemberVolunteerHistoryItem } from "../types"

interface UseMemberVolunteerHistoryResult {
  history: MemberVolunteerHistoryItem[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useMemberVolunteerHistory(memberId?: string): UseMemberVolunteerHistoryResult {
  const [taskHistory, setTaskHistory] = useState<MemberVolunteerHistoryItem[]>([])
  const [activityHistory, setActivityHistory] = useState<MemberVolunteerHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadHistory = useCallback(async () => {
    if (!memberId) {
      setTaskHistory([])
      setActivityHistory([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const [tasks, activities] = await Promise.all([
        volunteersService.getTaskAssignmentsByMember(memberId),
        volunteersService.getActivityAssignmentsByMember(memberId),
      ])

      setTaskHistory(tasks.map((item) => ({ ...item, type: "TASK" as const })))
      setActivityHistory(activities.map((item) => ({ ...item, type: "ACTIVITY" as const })))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar historial de voluntariado"))
      setTaskHistory([])
      setActivityHistory([])
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const history = useMemo(() => {
    return [...taskHistory, ...activityHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [activityHistory, taskHistory])

  return {
    history,
    loading,
    error,
    refetch: loadHistory,
  }
}
