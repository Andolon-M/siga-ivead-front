import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
import type {
  ActivityAssignment,
  ActivitySlot,
  CreateActivitySlotAssignmentData,
  CreateTaskAssignmentData,
  CreateVolunteerActivityData,
  CreateVolunteerTaskData,
  GenerateOccurrencesData,
  MemberVolunteerHistoryItem,
  PaginatedResponse,
  TaskAssignment,
  TaskOccurrence,
  TaskOccurrenceFilters,
  UpdateActivityAssignmentData,
  UpdateTaskAssignmentData,
  UpdateVolunteerActivityData,
  UpdateVolunteerTaskData,
  VolunteerActivity,
  VolunteerActivityFilters,
  VolunteerTask,
  VolunteerTaskFilters,
} from "../types"

function buildQuery(
  filters?: VolunteerTaskFilters | TaskOccurrenceFilters | VolunteerActivityFilters
) {
  const normalizedFilters: Record<string, unknown> = { ...(filters || {}) }

  // Compatibilidad con frontend actual: mapear page/pageSize a limit/offset.
  const pageSizeValue = Number(normalizedFilters.pageSize)
  if (Number.isFinite(pageSizeValue) && pageSizeValue > 0 && normalizedFilters.limit == null) {
    normalizedFilters.limit = pageSizeValue
  }

  const pageValue = Number(normalizedFilters.page)
  const limitValue = Number(normalizedFilters.limit)
  if (Number.isFinite(pageValue) && pageValue > 0 && Number.isFinite(limitValue) && limitValue > 0 && normalizedFilters.offset == null) {
    normalizedFilters.offset = (pageValue - 1) * limitValue
  }

  // Compatibilidad para filtros de fecha legacy.
  if (normalizedFilters.from && !normalizedFilters.date_from) {
    normalizedFilters.date_from = normalizedFilters.from
  }
  if (normalizedFilters.to && !normalizedFilters.date_to) {
    normalizedFilters.date_to = normalizedFilters.to
  }

  // Compatibilidad con filtros por mes/año de UI actual.
  const yearValue = Number(normalizedFilters.year)
  const monthValue = Number(normalizedFilters.month)
  if (
    Number.isFinite(yearValue) &&
    Number.isFinite(monthValue) &&
    monthValue >= 1 &&
    monthValue <= 12 &&
    !normalizedFilters.date_from &&
    !normalizedFilters.date_to
  ) {
    const dateFrom = new Date(Date.UTC(yearValue, monthValue - 1, 1, 0, 0, 0, 0))
    const dateTo = new Date(Date.UTC(yearValue, monthValue, 0, 23, 59, 59, 999))
    normalizedFilters.date_from = dateFrom.toISOString()
    normalizedFilters.date_to = dateTo.toISOString()
  }

  delete normalizedFilters.page
  delete normalizedFilters.pageSize
  delete normalizedFilters.from
  delete normalizedFilters.to
  delete normalizedFilters.year
  delete normalizedFilters.month

  const params = new URLSearchParams()
  Object.entries(normalizedFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value))
    }
  })
  return params.toString() ? `?${params.toString()}` : ""
}

function normalizeListResponse<T>(raw: unknown, arrayKey: string): PaginatedResponse<T> | T[] {
  // Si ya es array, retornarlo
  if (Array.isArray(raw)) return raw

  // Si es objeto con la clave del array (ej: { total, tasks })
  if (raw != null && typeof raw === "object" && arrayKey in raw) {
    const obj = raw as Record<string, unknown>
    const items = obj[arrayKey]
    if (Array.isArray(items)) {
      const total = typeof obj.total === "number" ? obj.total : items.length
      return {
        data: items as T[],
        total,
        currentPage: 1,
        totalPages: 1,
        nextPage: null,
        previousPage: null,
        limit: items.length,
      }
    }
  }

  // Si tiene 'data' con array (ya paginado estándar)
  if (raw != null && typeof raw === "object" && "data" in raw) {
    const obj = raw as { data: unknown }
    if (Array.isArray(obj.data)) return raw as PaginatedResponse<T>
  }

  // Fallback a array vacío
  return []
}

/** Mapea la forma del API de ocurrencias al tipo TaskOccurrence del frontend */
function mapApiOccurrenceToTaskOccurrence(raw: Record<string, unknown>): TaskOccurrence {
  const task = raw.recurring_volunteer_tasks as Record<string, unknown> | undefined
  const count = raw._count as Record<string, unknown> | undefined
  const taskId = (raw.recurring_task_id ?? raw.task_id) as string | undefined
  const taskName = (task?.name ?? raw.task_name) as string | undefined
  const defaultQty = typeof task?.default_quantity === "number" ? task.default_quantity : null
  const quantity = typeof raw.quantity === "number" ? raw.quantity : null
  const requiredQuantity = defaultQty ?? quantity ?? (raw.required_quantity as number | undefined) ?? 0
  const assignedCount = typeof count?.assignments === "number" ? count.assignments : (raw.assigned_count as number | undefined) ?? 0

  return {
    id: String(raw.id),
    task_id: String(taskId ?? ""),
    task_name: taskName ?? undefined,
    occurrence_date: String(raw.occurrence_date ?? ""),
    required_quantity: requiredQuantity,
    assigned_count: assignedCount,
    location: (task?.location ?? raw.location) as string | null | undefined,
    is_closed: raw.is_closed as boolean | undefined,
  }
}

function normalizeOccurrencesResponse(raw: unknown): PaginatedResponse<TaskOccurrence> | TaskOccurrence[] {
  const normalized = normalizeListResponse<Record<string, unknown>>(raw, "occurrences")
  const mapItems = (items: Record<string, unknown>[]) => items.map(mapApiOccurrenceToTaskOccurrence)

  if (Array.isArray(normalized)) {
    return mapItems(normalized)
  }
  return {
    ...normalized,
    data: mapItems(normalized.data as Record<string, unknown>[]),
  }
}

export const volunteersService = {
  async getTasks(filters?: VolunteerTaskFilters): Promise<PaginatedResponse<VolunteerTask> | VolunteerTask[]> {
    const query = buildQuery(filters)
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<VolunteerTask> | VolunteerTask[]>>(
      `${API_ENDPOINTS.VOLUNTEERS.TASKS.LIST}${query}`
    )
    return normalizeListResponse<VolunteerTask>(response.data.data, "tasks")
  },

  async getTaskById(id: string): Promise<VolunteerTask> {
    const response = await axiosInstance.get<ApiResponse<VolunteerTask>>(API_ENDPOINTS.VOLUNTEERS.TASKS.GET(id))
    return response.data.data
  },

  async createTask(data: CreateVolunteerTaskData): Promise<VolunteerTask> {
    const response = await axiosInstance.post<ApiResponse<VolunteerTask>>(API_ENDPOINTS.VOLUNTEERS.TASKS.CREATE, data)
    return response.data.data
  },

  async updateTask(id: string, data: UpdateVolunteerTaskData): Promise<VolunteerTask> {
    const response = await axiosInstance.put<ApiResponse<VolunteerTask>>(API_ENDPOINTS.VOLUNTEERS.TASKS.UPDATE(id), data)
    return response.data.data
  },

  async deleteTask(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.VOLUNTEERS.TASKS.DELETE(id))
  },

  async generateTaskOccurrences(taskId: string, data: GenerateOccurrencesData): Promise<TaskOccurrence[]> {
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      API_ENDPOINTS.VOLUNTEERS.OCCURRENCES.GENERATE(taskId),
      data
    )
    const normalized = normalizeOccurrencesResponse(response.data.data)
    return Array.isArray(normalized) ? normalized : normalized.data
  },

  async getOccurrences(filters?: TaskOccurrenceFilters): Promise<PaginatedResponse<TaskOccurrence> | TaskOccurrence[]> {
    const query = buildQuery(filters)
    const response = await axiosInstance.get<ApiResponse<unknown>>(
      `${API_ENDPOINTS.VOLUNTEERS.OCCURRENCES.LIST}${query}`
    )
    return normalizeOccurrencesResponse(response.data.data)
  },

  async getOccurrenceById(id: string): Promise<TaskOccurrence> {
    const response = await axiosInstance.get<ApiResponse<TaskOccurrence>>(API_ENDPOINTS.VOLUNTEERS.OCCURRENCES.GET(id))
    return response.data.data
  },

  async getOccurrenceAssignments(occurrenceId: string): Promise<TaskAssignment[]> {
    const response = await axiosInstance.get<ApiResponse<TaskAssignment[]>>(
      API_ENDPOINTS.VOLUNTEERS.TASK_ASSIGNMENTS.BY_OCCURRENCE(occurrenceId)
    )
    const normalized = normalizeListResponse<TaskAssignment>(response.data.data, "assignments")
    return Array.isArray(normalized) ? normalized : normalized.data
  },

  async createTaskAssignment(occurrenceId: string, data: CreateTaskAssignmentData): Promise<TaskAssignment> {
    const response = await axiosInstance.post<ApiResponse<TaskAssignment>>(
      API_ENDPOINTS.VOLUNTEERS.TASK_ASSIGNMENTS.CREATE(occurrenceId),
      data
    )
    return response.data.data
  },

  async updateTaskAssignment(id: string, data: UpdateTaskAssignmentData): Promise<TaskAssignment> {
    const response = await axiosInstance.put<ApiResponse<TaskAssignment>>(
      API_ENDPOINTS.VOLUNTEERS.TASK_ASSIGNMENTS.UPDATE(id),
      data
    )
    return response.data.data
  },

  async confirmTaskAssignment(id: string): Promise<TaskAssignment> {
    const response = await axiosInstance.post<ApiResponse<TaskAssignment>>(
      API_ENDPOINTS.VOLUNTEERS.TASK_ASSIGNMENTS.CONFIRM(id)
    )
    return response.data.data
  },

  async cancelTaskAssignment(id: string): Promise<TaskAssignment> {
    const response = await axiosInstance.post<ApiResponse<TaskAssignment>>(
      API_ENDPOINTS.VOLUNTEERS.TASK_ASSIGNMENTS.CANCEL(id)
    )
    return response.data.data
  },

  async deleteTaskAssignment(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.VOLUNTEERS.TASK_ASSIGNMENTS.DELETE(id))
  },

  async getActivities(filters?: VolunteerActivityFilters): Promise<PaginatedResponse<VolunteerActivity> | VolunteerActivity[]> {
    const query = buildQuery(filters)
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<VolunteerActivity> | VolunteerActivity[]>>(
      `${API_ENDPOINTS.VOLUNTEERS.ACTIVITIES.LIST}${query}`
    )
    return normalizeListResponse<VolunteerActivity>(response.data.data, "activities")
  },

  async getActivityById(id: string): Promise<VolunteerActivity> {
    const response = await axiosInstance.get<ApiResponse<VolunteerActivity>>(API_ENDPOINTS.VOLUNTEERS.ACTIVITIES.GET(id))
    return response.data.data
  },

  async createActivity(data: CreateVolunteerActivityData): Promise<VolunteerActivity> {
    const response = await axiosInstance.post<ApiResponse<VolunteerActivity>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITIES.CREATE,
      data
    )
    return response.data.data
  },

  async updateActivity(id: string, data: UpdateVolunteerActivityData): Promise<VolunteerActivity> {
    const response = await axiosInstance.put<ApiResponse<VolunteerActivity>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITIES.UPDATE(id),
      data
    )
    return response.data.data
  },

  async deleteActivity(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.VOLUNTEERS.ACTIVITIES.DELETE(id))
  },

  async getActivitySlots(activityId: string): Promise<ActivitySlot[]> {
    const response = await axiosInstance.get<ApiResponse<ActivitySlot[]>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITY_SLOTS.LIST(activityId)
    )
    const normalized = normalizeListResponse<ActivitySlot>(response.data.data, "slots")
    return Array.isArray(normalized) ? normalized : normalized.data
  },

  async assignActivitySlot(activityId: string, data: CreateActivitySlotAssignmentData): Promise<ActivityAssignment> {
    const response = await axiosInstance.post<ApiResponse<ActivityAssignment>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITY_SLOTS.ASSIGN(activityId),
      data
    )
    return response.data.data
  },

  async getActivityAssignments(activityId: string): Promise<ActivityAssignment[]> {
    const response = await axiosInstance.get<ApiResponse<ActivityAssignment[]>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITY_ASSIGNMENTS.BY_ACTIVITY(activityId)
    )
    const normalized = normalizeListResponse<ActivityAssignment>(response.data.data, "assignments")
    return Array.isArray(normalized) ? normalized : normalized.data
  },

  async updateActivityAssignment(id: string, data: UpdateActivityAssignmentData): Promise<ActivityAssignment> {
    const response = await axiosInstance.put<ApiResponse<ActivityAssignment>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITY_ASSIGNMENTS.UPDATE(id),
      data
    )
    return response.data.data
  },

  async confirmActivityAssignment(id: string): Promise<ActivityAssignment> {
    const response = await axiosInstance.post<ApiResponse<ActivityAssignment>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITY_ASSIGNMENTS.CONFIRM(id)
    )
    return response.data.data
  },

  async cancelActivityAssignment(id: string): Promise<ActivityAssignment> {
    const response = await axiosInstance.post<ApiResponse<ActivityAssignment>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITY_ASSIGNMENTS.CANCEL(id)
    )
    return response.data.data
  },

  async deleteActivityAssignment(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.VOLUNTEERS.ACTIVITY_ASSIGNMENTS.DELETE(id))
  },

  async getTaskAssignmentsByMember(memberId: string): Promise<MemberVolunteerHistoryItem[]> {
    const response = await axiosInstance.get<ApiResponse<MemberVolunteerHistoryItem[]>>(
      API_ENDPOINTS.VOLUNTEERS.TASK_ASSIGNMENTS.BY_MEMBER(memberId)
    )
    const normalized = normalizeListResponse<MemberVolunteerHistoryItem>(response.data.data, "assignments")
    return Array.isArray(normalized) ? normalized : normalized.data
  },

  async getActivityAssignmentsByMember(memberId: string): Promise<MemberVolunteerHistoryItem[]> {
    const response = await axiosInstance.get<ApiResponse<MemberVolunteerHistoryItem[]>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITY_ASSIGNMENTS.BY_MEMBER(memberId)
    )
    const normalized = normalizeListResponse<MemberVolunteerHistoryItem>(response.data.data, "assignments")
    return Array.isArray(normalized) ? normalized : normalized.data
  },
}
