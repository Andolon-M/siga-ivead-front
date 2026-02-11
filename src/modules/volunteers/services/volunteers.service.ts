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

function buildQuery(filters?: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value))
      }
    })
  }
  return params.toString() ? `?${params.toString()}` : ""
}

export const volunteersService = {
  async getTasks(filters?: VolunteerTaskFilters): Promise<PaginatedResponse<VolunteerTask> | VolunteerTask[]> {
    const query = buildQuery(filters)
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<VolunteerTask> | VolunteerTask[]>>(
      `${API_ENDPOINTS.VOLUNTEERS.TASKS.LIST}${query}`
    )
    return response.data.data
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
    const response = await axiosInstance.post<ApiResponse<TaskOccurrence[]>>(
      API_ENDPOINTS.VOLUNTEERS.OCCURRENCES.GENERATE(taskId),
      data
    )
    return response.data.data
  },

  async getOccurrences(filters?: TaskOccurrenceFilters): Promise<PaginatedResponse<TaskOccurrence> | TaskOccurrence[]> {
    const query = buildQuery(filters)
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<TaskOccurrence> | TaskOccurrence[]>>(
      `${API_ENDPOINTS.VOLUNTEERS.OCCURRENCES.LIST}${query}`
    )
    return response.data.data
  },

  async getOccurrenceById(id: string): Promise<TaskOccurrence> {
    const response = await axiosInstance.get<ApiResponse<TaskOccurrence>>(API_ENDPOINTS.VOLUNTEERS.OCCURRENCES.GET(id))
    return response.data.data
  },

  async getOccurrenceAssignments(occurrenceId: string): Promise<TaskAssignment[]> {
    const response = await axiosInstance.get<ApiResponse<TaskAssignment[]>>(
      API_ENDPOINTS.VOLUNTEERS.TASK_ASSIGNMENTS.BY_OCCURRENCE(occurrenceId)
    )
    return response.data.data
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
    return response.data.data
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
    return response.data.data
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
    return response.data.data
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
    return response.data.data
  },

  async getActivityAssignmentsByMember(memberId: string): Promise<MemberVolunteerHistoryItem[]> {
    const response = await axiosInstance.get<ApiResponse<MemberVolunteerHistoryItem[]>>(
      API_ENDPOINTS.VOLUNTEERS.ACTIVITY_ASSIGNMENTS.BY_MEMBER(memberId)
    )
    return response.data.data
  },
}
