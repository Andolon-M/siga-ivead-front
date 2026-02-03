import { useState, useEffect, useCallback } from "react"
import { meetingsService } from "../services/meetings.service"
import type { RequiredRole, CreateRequiredRoleRequest, UpdateRequiredRoleRequest } from "../types"

export function useRequiredRoles(recurringMeetingId: string | null | undefined) {
  const [roles, setRoles] = useState<RequiredRole[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoles = useCallback(async () => {
    if (!recurringMeetingId) {
      setRoles([])
      setTotal(0)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await meetingsService.getRequiredRoles(recurringMeetingId)
      setRoles(response.roles)
      setTotal(response.total)
    } catch (err) {
      setError(err as Error)
      console.error("Error al obtener roles requeridos:", err)
    } finally {
      setIsLoading(false)
    }
  }, [recurringMeetingId])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const createRole = useCallback(
    async (data: CreateRequiredRoleRequest) => {
      if (!recurringMeetingId) throw new Error("No recurring meeting ID")
      const result = await meetingsService.createRequiredRole(recurringMeetingId, data)
      await fetchRoles()
      return result
    },
    [recurringMeetingId, fetchRoles]
  )

  const updateRole = useCallback(
    async (id: string, data: UpdateRequiredRoleRequest) => {
      const result = await meetingsService.updateRequiredRole(id, data)
      await fetchRoles()
      return result
    },
    [fetchRoles]
  )

  const deleteRole = useCallback(
    async (id: string) => {
      await meetingsService.deleteRequiredRole(id)
      await fetchRoles()
    },
    [fetchRoles]
  )

  return {
    roles,
    total,
    isLoading,
    error,
    refetch: fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  }
}
