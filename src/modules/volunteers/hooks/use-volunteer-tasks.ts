import { useCallback, useEffect, useRef, useState } from "react"
import { volunteersService } from "../services/volunteers.service"
import type { PaginatedResponse, VolunteerTask, VolunteerTaskFilters } from "../types"

interface UseVolunteerTasksResult {
  tasks: VolunteerTask[]
  loading: boolean
  error: Error | null
  pagination: {
    currentPage: number
    totalPages: number
    total: number
    nextPage: number | null
    previousPage: number | null
    limit: number
  } | null
  refetch: () => Promise<void>
}

function isPaginatedResponse(value: unknown): value is PaginatedResponse<VolunteerTask> {
  return !!value && typeof value === "object" && "data" in value
}

export function useVolunteerTasks(filters?: VolunteerTaskFilters): UseVolunteerTasksResult {
  const [tasks, setTasks] = useState<VolunteerTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<UseVolunteerTasksResult["pagination"]>(null)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await volunteersService.getTasks(filtersRef.current)
      // #region agent log
      const isPaginated = isPaginatedResponse(data)
      const willSetTasks = isPaginated ? (data as PaginatedResponse<VolunteerTask>).data : data
      fetch('http://127.0.0.1:7243/ingest/c0bf278e-0b8b-4219-bb6b-8fd73c9ddc56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-volunteer-tasks.ts:loadTasks',message:'hook after getTasks',data:{isPaginated,willSetTasksIsArray:Array.isArray(willSetTasks),willSetTasksType:typeof willSetTasks},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      if (isPaginated) {
        setTasks((data as PaginatedResponse<VolunteerTask>).data)
        setPagination({
          currentPage: (data as PaginatedResponse<VolunteerTask>).currentPage,
          totalPages: (data as PaginatedResponse<VolunteerTask>).totalPages,
          total: (data as PaginatedResponse<VolunteerTask>).total,
          nextPage: (data as PaginatedResponse<VolunteerTask>).nextPage,
          previousPage: (data as PaginatedResponse<VolunteerTask>).previousPage,
          limit: (data as PaginatedResponse<VolunteerTask>).limit,
        })
      } else {
        setTasks(Array.isArray(data) ? data : [])
        setPagination(null)
      }
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c0bf278e-0b8b-4219-bb6b-8fd73c9ddc56',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-volunteer-tasks.ts:catch',message:'hook catch branch',data:{errMessage:err instanceof Error?err.message:String(err)},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      setError(err instanceof Error ? err : new Error("Error al cargar tareas de voluntariado"))
      setTasks([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return { tasks, loading, error, pagination, refetch: loadTasks }
}
