import { axiosInstance } from "@/shared/api/axios.config"
import { API_ENDPOINTS } from "@/shared/api/enpoints"
import type {
  RecurringMeeting,
  CreateRecurringMeetingRequest,
  UpdateRecurringMeetingRequest,
  RequiredRole,
  CreateRequiredRoleRequest,
  UpdateRequiredRoleRequest,
  MeetingSession,
  GenerateSessionsRequest,
  CreateSessionRequest,
  ServiceAssignment,
  CreateAssignmentRequest,
  RecurringMeetingFilters,
  SessionFilters,
  RecurringMeetingStats,
  ApiResponse,
  MeetingsListResponse,
  SessionsListResponse,
  RolesListResponse,
  AssignmentsListResponse,
} from "../types"

export const meetingsService = {
  // ========== Reuniones Recurrentes ==========

  async getRecurringMeetings(
    filters?: RecurringMeetingFilters
  ): Promise<MeetingsListResponse> {
    const params = new URLSearchParams()
    if (filters?.is_active !== undefined) params.append("is_active", String(filters.is_active))
    if (filters?.recurrence_type) params.append("recurrence_type", filters.recurrence_type)
    if (filters?.day_of_week) params.append("day_of_week", filters.day_of_week)
    if (filters?.ministry_id) params.append("ministry_id", filters.ministry_id)
    if (filters?.limit) params.append("limit", String(filters.limit))
    if (filters?.offset) params.append("offset", String(filters.offset))

    const queryString = params.toString()
    const url = queryString
      ? `${API_ENDPOINTS.MEETINGS.RECURRING.LIST}?${queryString}`
      : API_ENDPOINTS.MEETINGS.RECURRING.LIST

    const response = await axiosInstance.get<ApiResponse<MeetingsListResponse>>(url)
    return response.data.data
  },

  async getRecurringMeetingById(id: string): Promise<RecurringMeeting> {
    const response = await axiosInstance.get<ApiResponse<RecurringMeeting>>(
      API_ENDPOINTS.MEETINGS.RECURRING.GET(id)
    )
    return response.data.data
  },

  async createRecurringMeeting(
    data: CreateRecurringMeetingRequest
  ): Promise<RecurringMeeting> {
    const response = await axiosInstance.post<ApiResponse<RecurringMeeting>>(
      API_ENDPOINTS.MEETINGS.RECURRING.CREATE,
      data
    )
    return response.data.data
  },

  async updateRecurringMeeting(
    id: string,
    data: UpdateRecurringMeetingRequest
  ): Promise<RecurringMeeting> {
    const response = await axiosInstance.put<ApiResponse<RecurringMeeting>>(
      API_ENDPOINTS.MEETINGS.RECURRING.UPDATE(id),
      data
    )
    return response.data.data
  },

  async deleteRecurringMeeting(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.MEETINGS.RECURRING.DELETE(id))
  },

  async getRecurringMeetingStats(): Promise<RecurringMeetingStats> {
    const response = await axiosInstance.get<ApiResponse<RecurringMeetingStats>>(
      API_ENDPOINTS.MEETINGS.RECURRING.STATS
    )
    return response.data.data
  },

  // ========== Roles Requeridos ==========

  async getRequiredRoles(recurringMeetingId: string): Promise<RolesListResponse> {
    const response = await axiosInstance.get<ApiResponse<RolesListResponse>>(
      API_ENDPOINTS.MEETINGS.RECURRING.ROLES(recurringMeetingId)
    )
    return response.data.data
  },

  async createRequiredRole(
    recurringMeetingId: string,
    data: CreateRequiredRoleRequest
  ): Promise<RequiredRole> {
    const response = await axiosInstance.post<ApiResponse<RequiredRole>>(
      API_ENDPOINTS.MEETINGS.RECURRING.ROLES(recurringMeetingId),
      data
    )
    return response.data.data
  },

  async updateRequiredRole(
    id: string,
    data: UpdateRequiredRoleRequest
  ): Promise<RequiredRole> {
    const response = await axiosInstance.put<ApiResponse<RequiredRole>>(
      API_ENDPOINTS.MEETINGS.ROLES.UPDATE(id),
      data
    )
    return response.data.data
  },

  async deleteRequiredRole(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.MEETINGS.ROLES.DELETE(id))
  },

  // ========== Sesiones ==========

  async getSessions(filters?: SessionFilters): Promise<SessionsListResponse> {
    const params = new URLSearchParams()
    if (filters?.recurring_meeting_id) params.append("recurring_meeting_id", filters.recurring_meeting_id)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.date_from) params.append("date_from", filters.date_from)
    if (filters?.date_to) params.append("date_to", filters.date_to)
    if (filters?.limit) params.append("limit", String(filters.limit))
    if (filters?.offset) params.append("offset", String(filters.offset))

    const queryString = params.toString()
    const url = queryString
      ? `${API_ENDPOINTS.MEETINGS.SESSIONS.LIST}?${queryString}`
      : API_ENDPOINTS.MEETINGS.SESSIONS.LIST

    const response = await axiosInstance.get<ApiResponse<SessionsListResponse>>(url)
    return response.data.data
  },

  async getSessionById(id: string): Promise<MeetingSession> {
    const response = await axiosInstance.get<ApiResponse<MeetingSession>>(
      API_ENDPOINTS.MEETINGS.SESSIONS.GET(id)
    )
    return response.data.data
  },

  async generateSessions(data: GenerateSessionsRequest): Promise<{
    generated: number
    skipped: number
    sessions: MeetingSession[]
  }> {
    const response = await axiosInstance.post<
      ApiResponse<{ generated: number; skipped: number; sessions: MeetingSession[] }>
    >(API_ENDPOINTS.MEETINGS.SESSIONS.GENERATE, data)
    return response.data.data
  },

  async createSession(data: CreateSessionRequest): Promise<MeetingSession> {
    const response = await axiosInstance.post<ApiResponse<MeetingSession>>(
      API_ENDPOINTS.MEETINGS.SESSIONS.CREATE,
      data
    )
    return response.data.data
  },

  async checkSessionRolesComplete(sessionId: string): Promise<{ is_complete: boolean }> {
    const response = await axiosInstance.get<ApiResponse<{ is_complete: boolean }>>(
      API_ENDPOINTS.MEETINGS.SESSIONS.ROLES_CHECK(sessionId)
    )
    return response.data.data
  },

  // ========== Asignaciones ==========

  async getSessionAssignments(sessionId: string): Promise<AssignmentsListResponse> {
    const response = await axiosInstance.get<ApiResponse<AssignmentsListResponse>>(
      API_ENDPOINTS.MEETINGS.SESSIONS.ASSIGNMENTS(sessionId)
    )
    return response.data.data
  },

  async createAssignment(
    sessionId: string,
    data: CreateAssignmentRequest
  ): Promise<ServiceAssignment> {
    const response = await axiosInstance.post<ApiResponse<ServiceAssignment>>(
      API_ENDPOINTS.MEETINGS.SESSIONS.ASSIGNMENTS(sessionId),
      data
    )
    return response.data.data
  },

  async confirmAssignment(id: string): Promise<ServiceAssignment> {
    const response = await axiosInstance.post<ApiResponse<ServiceAssignment>>(
      API_ENDPOINTS.MEETINGS.ASSIGNMENTS.CONFIRM(id)
    )
    return response.data.data
  },

  async cancelAssignment(id: string, notes?: string): Promise<ServiceAssignment> {
    const response = await axiosInstance.post<ApiResponse<ServiceAssignment>>(
      API_ENDPOINTS.MEETINGS.ASSIGNMENTS.CANCEL(id),
      notes ? { notes } : {}
    )
    return response.data.data
  },

  async deleteAssignment(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.MEETINGS.ASSIGNMENTS.DELETE(id))
  },
}
