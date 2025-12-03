import { useState, useEffect } from "react"
import type { Member } from "../types"
import { membersService } from "../services/members.service"

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const data = await membersService.getAllMembers()
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar miembros"))
    } finally {
      setLoading(false)
    }
  }

  return {
    members,
    loading,
    error,
    refetch: loadMembers,
  }
}

