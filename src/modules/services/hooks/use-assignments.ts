import { useState, useEffect, useCallback } from "react"
import { meetingsService } from "../services/meetings.service"
import type { ServiceAssignment, CreateAssignmentRequest } from "../types"

export function useSessionAssignments(sessionId: string | null | undefined) {
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAssignments = useCallback(async () => {
    if (!sessionId) {
      setAssignments([])
      setTotal(0)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await meetingsService.getSessionAssignments(sessionId)
      setAssignments(response.assignments)
      setTotal(response.total)
    } catch (err) {
      setError(err as Error)
      console.error("Error al obtener asignaciones:", err)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const createAssignment = useCallback(
    async (data: CreateAssignmentRequest) => {
      if (!sessionId) throw new Error("No session ID")
      const result = await meetingsService.createAssignment(sessionId, data)
      await fetchAssignments()
      return result
    },
    [sessionId, fetchAssignments]
  )

  const confirmAssignment = useCallback(
    async (id: string) => {
      const result = await meetingsService.confirmAssignment(id)
      await fetchAssignments()
      return result
    },
    [fetchAssignments]
  )

  const cancelAssignment = useCallback(
    async (id: string, notes?: string) => {
      const result = await meetingsService.cancelAssignment(id, notes)
      await fetchAssignments()
      return result
    },
    [fetchAssignments]
  )

  const deleteAssignment = useCallback(
    async (id: string) => {
      await meetingsService.deleteAssignment(id)
      await fetchAssignments()
    },
    [fetchAssignments]
  )

  return {
    assignments,
    total,
    isLoading,
    error,
    refetch: fetchAssignments,
    createAssignment,
    confirmAssignment,
    cancelAssignment,
    deleteAssignment,
  }
}

export function useRolesComplete(sessionId: string | null | undefined) {
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const checkComplete = useCallback(async () => {
    if (!sessionId) {
      setIsComplete(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await meetingsService.checkSessionRolesComplete(sessionId)
      setIsComplete(response.is_complete)
    } catch (err) {
      console.error("Error al verificar completitud:", err)
      setIsComplete(false)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    checkComplete()
  }, [checkComplete])

  return { isComplete, isLoading, refetch: checkComplete }
}
