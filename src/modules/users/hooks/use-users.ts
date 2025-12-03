import { useState, useEffect } from "react"
import type { User } from "../types"
import { usersService } from "../services/users.service"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await usersService.getAllUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar usuarios"))
    } finally {
      setLoading(false)
    }
  }

  return {
    users,
    loading,
    error,
    refetch: loadUsers,
  }
}

