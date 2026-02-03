// Enums según la API del backend
export type RecurrenceType = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM"

export type DayOfWeek =
  | "DOMINGO"
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"

export type ServiceRole =
  | "DIACONADO"
  | "UJIER"
  | "DIRECTOR_CULTO"
  | "LIDER_ORACION"
  | "MULTIMEDIA"
  | "MUSICA"
  | "SONIDO"
  | "NINOS"
  | "OTRO"

export type SessionStatus = "PLANIFICADO" | "ACTIVO" | "FINALIZADO" | "CANCELADO"

export type AssignmentStatus = "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | "COMPLETADO"

// Interfaces principales
export interface MinistryRef {
  id: string
  name: string
}

export interface RecurringMeeting {
  id: string
  name: string
  description?: string | null
  recurrence_type: RecurrenceType
  day_of_week?: DayOfWeek | null
  start_time: string
  duration_minutes: number
  location: string
  ministry_id?: string | null
  ministry?: MinistryRef | null
  is_active: boolean
  created_at?: string
  required_roles_count?: number
  sessions_count?: number
}

export interface RequiredRole {
  id: string
  role: ServiceRole
  quantity: number
  is_required: boolean
  description?: string | null
}

export interface MeetingSession {
  id: string
  recurring_meeting_id?: string
  // El backend devuelve "recurring_meetings" (plural)
  recurring_meetings?: {
    id: string
    name: string
    location: string
    start_time?: string
    day_of_week?: DayOfWeek
  }
  session_date: string
  start_time: string
  end_time: string
  status: SessionStatus
  actual_attendance?: number | null
  actual_location?: string | null
  notes?: string | null
  assignments_count?: number
  attendances_count?: number
  created_at?: string
}

export interface MemberRef {
  id: string
  name: string
  last_name?: string
  cell?: string
}

export interface ServiceAssignment {
  id: string
  meeting_session_id: string
  required_role_id: string
  required_role?: {
    id: string
    role: ServiceRole
    description?: string | null
  }
  member_id: string
  member?: MemberRef
  status: AssignmentStatus
  confirmed_at?: string | null
  notes?: string | null
}

// DTOs para crear/actualizar
export interface CreateRecurringMeetingRequest {
  name: string
  description?: string
  recurrence_type: RecurrenceType
  day_of_week?: DayOfWeek
  start_time: string
  duration_minutes: number
  location: string
  ministry_id?: string
  is_active?: boolean
}

export interface UpdateRecurringMeetingRequest {
  name?: string
  description?: string
  recurrence_type?: RecurrenceType
  day_of_week?: DayOfWeek
  start_time?: string
  duration_minutes?: number
  location?: string
  ministry_id?: string
  is_active?: boolean
}

export interface CreateRequiredRoleRequest {
  role: ServiceRole
  quantity: number
  is_required?: boolean
  description?: string
}

export interface UpdateRequiredRoleRequest {
  role?: ServiceRole
  quantity?: number
  is_required?: boolean
  description?: string
}

export interface GenerateSessionsRequest {
  recurring_meeting_id: string
  year: number
  month: number
}

export interface CreateSessionRequest {
  recurring_meeting_id: string
  session_date: string
  start_time: string
  end_time: string
  notes?: string
  actual_location?: string
}

export interface CreateAssignmentRequest {
  required_role_id: string
  member_id: string
  status?: AssignmentStatus
  notes?: string
}

// Filtros
export interface RecurringMeetingFilters {
  is_active?: boolean
  recurrence_type?: RecurrenceType
  day_of_week?: DayOfWeek
  ministry_id?: string
  limit?: number
  offset?: number
}

export interface SessionFilters {
  recurring_meeting_id?: string
  status?: SessionStatus
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

// Respuestas de la API
export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

export interface MeetingsListResponse {
  total: number
  meetings: RecurringMeeting[]
}

export interface SessionsListResponse {
  total: number
  sessions: MeetingSession[]
}

export interface RolesListResponse {
  total: number
  roles: RequiredRole[]
}

export interface AssignmentsListResponse {
  total: number
  assignments: ServiceAssignment[]
}

export interface RecurringMeetingStats {
  total: number
  active: number
  inactive: number
  byType?: { recurrence_type: string; _count: number }[]
}
