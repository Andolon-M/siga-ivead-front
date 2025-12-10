import { useState, useEffect } from "react"
import type { MemberStats } from "../types"
import { membersService } from "../services/members.service"

interface UseMemberStatsResult {
  stats: MemberStats | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook para obtener estadísticas de miembros
 */
export function useMemberStats(): UseMemberStatsResult {
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await membersService.getStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar estadísticas"))
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: loadStats,
  }
}

