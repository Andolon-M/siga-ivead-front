import { useState, useEffect } from "react"
import type { Member } from "../types"
import { membersService } from "../services/members.service"

interface UseMemberResult {
  member: Member | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener un miembro específico por ID
 */
export function useMember(id?: string): UseMemberResult {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMember = async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await membersService.getMemberById(id)
      setMember(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar miembro"))
      setMember(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMember()
  }, [id])

  return {
    member,
    loading,
    error,
    refetch: loadMember,
  }
}

/**
 * Hook para obtener un miembro por DNI
 */
export function useMemberByDni(dni?: string): UseMemberResult {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMember = async () => {
    if (!dni) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await membersService.getMemberByDni(dni)
      setMember(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar miembro"))
      setMember(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMember()
  }, [dni])

  return {
    member,
    loading,
    error,
    refetch: loadMember,
  }
}

/**
 * Hook para obtener un miembro por User ID
 */
export function useMemberByUserId(userId?: string): UseMemberResult {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMember = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await membersService.getMemberByUserId(userId)
      setMember(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar miembro"))
      setMember(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMember()
  }, [userId])

  return {
    member,
    loading,
    error,
    refetch: loadMember,
  }
}

