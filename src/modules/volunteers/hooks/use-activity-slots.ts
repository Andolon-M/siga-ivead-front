import { useCallback, useEffect, useState } from "react"
import { volunteersService } from "../services/volunteers.service"
import type { ActivityAssignment, ActivitySlot } from "../types"

interface UseActivitySlotsResult {
  slots: ActivitySlot[]
  assignments: ActivityAssignment[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useActivitySlots(activityId?: string): UseActivitySlotsResult {
  const [slots, setSlots] = useState<ActivitySlot[]>([])
  const [assignments, setAssignments] = useState<ActivityAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    if (!activityId) {
      setSlots([])
      setAssignments([])
      return
    }
    try {
      setLoading(true)
      setError(null)
      const [slotsData, assignmentsData] = await Promise.all([
        volunteersService.getActivitySlots(activityId),
        volunteersService.getActivityAssignments(activityId),
      ])
      setSlots(Array.isArray(slotsData) ? slotsData : [])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar slots"))
      setSlots([])
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }, [activityId])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    slots,
    assignments,
    loading,
    error,
    refetch: loadData,
  }
}
