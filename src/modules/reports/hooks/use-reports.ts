import { useState, useEffect } from "react"
import type { WeeklyReport, Deposit, Egress } from "../types"
import { reportsService } from "../services/reports.service"

export function useReports() {
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([])
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [egresses, setEgresses] = useState<Egress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const [weeklyData, depositsData, egressesData] = await Promise.all([
        reportsService.getWeeklyReports(),
        reportsService.getDeposits(),
        reportsService.getEgresses(),
      ])
      setWeeklyReports(weeklyData)
      setDeposits(depositsData)
      setEgresses(egressesData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar reportes"))
    } finally {
      setLoading(false)
    }
  }

  return {
    weeklyReports,
    deposits,
    egresses,
    loading,
    error,
    refetch: loadReports,
  }
}

