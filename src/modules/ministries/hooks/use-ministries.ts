import { useState, useEffect } from "react"
import type { Ministry } from "../types"
import { ministriesService } from "../services/ministries.service"

export function useMinistries() {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadMinistries()
  }, [])

  const loadMinistries = async () => {
    try {
      setLoading(true)
      const data = await ministriesService.getAllMinistries()
      setMinistries(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar ministerios"))
    } finally {
      setLoading(false)
    }
  }

  return {
    ministries,
    loading,
    error,
    refetch: loadMinistries,
  }
}

