export type RecurrenceType = "WEEKLY" | "BIWEEKLY" | "MONTHLY"
export type DayOfWeek =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO"
export type AssignmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED"

export interface PaginatedResponse<T> {
  previousPage: number | null
  currentPage: number
  nextPage: number | null
  total: number
  totalPages: number
  limit: number
  data: T[]
}

export interface VolunteerTask {
  id: string
  name: string
  description?: string | null
  recurrence_type: RecurrenceType
  day_of_week?: DayOfWeek | null
  default_quantity: number
  location?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface VolunteerTaskFilters {
  search?: string
  is_active?: boolean
  recurrence_type?: RecurrenceType
  page?: number
  pageSize?: number
}

export interface CreateVolunteerTaskData {
  name: string
  description?: string
  recurrence_type: RecurrenceType
  day_of_week?: DayOfWeek
  default_quantity: number
  location?: string
  is_active?: boolean
}

export interface UpdateVolunteerTaskData {
  name?: string
  description?: string
  recurrence_type?: RecurrenceType
  day_of_week?: DayOfWeek
  default_quantity?: number
  location?: string
  is_active?: boolean
}

export interface GenerateOccurrencesData {
  year: number
  month: number
}

export interface TaskOccurrence {
  id: string
  task_id: string
  task_name?: string
  occurrence_date: string
  required_quantity: number
  assigned_count: number
  location?: string | null
  is_closed?: boolean
}

export interface TaskOccurrenceFilters {
  task_id?: string
  year?: number
  month?: number
  page?: number
  pageSize?: number
}

export interface TaskAssignment {
  id: string
  occurrence_id: string
  member_id: string
  member_name?: string
  notes?: string | null
  status: AssignmentStatus
  created_at?: string
  updated_at?: string
}

export interface CreateTaskAssignmentData {
  member_id: string
  notes?: string
}

export interface UpdateTaskAssignmentData {
  notes?: string
}

export interface VolunteerActivity {
  id: string
  name: string
  description?: string | null
  activity_date: string
  start_time: string
  end_time: string
  slot_duration_minutes: number
  location?: string | null
  generate_slots?: boolean
}

export interface VolunteerActivityFilters {
  search?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export interface CreateVolunteerActivityData {
  name: string
  description?: string
  activity_date: string
  start_time: string
  end_time: string
  slot_duration_minutes: number
  location?: string
  generate_slots?: boolean
}

export interface UpdateVolunteerActivityData {
  name?: string
  description?: string
  activity_date?: string
  start_time?: string
  end_time?: string
  slot_duration_minutes?: number
  location?: string
  generate_slots?: boolean
}

export interface ActivitySlot {
  id: string
  activity_id: string
  start_time: string
  end_time: string
  slot_label?: string
  assignment_id?: string | null
  member_id?: string | null
  member_name?: string | null
  status?: AssignmentStatus | null
}

export interface CreateActivitySlotAssignmentData {
  slot_id: string
  member_id: string
  notes?: string
}

export interface ActivityAssignment {
  id: string
  activity_id: string
  slot_id: string
  member_id: string
  member_name?: string
  notes?: string | null
  status: AssignmentStatus
  created_at?: string
  updated_at?: string
}

export interface UpdateActivityAssignmentData {
  notes?: string
}

export interface MemberVolunteerHistoryItem {
  id: string
  member_id: string
  member_name?: string
  type: "TASK" | "ACTIVITY"
  status: AssignmentStatus
  date: string
  title: string
  location?: string | null
  notes?: string | null
}

export interface BusinessErrorMap {
  [key: string]: string
}

export const VOLUNTEERS_ERROR_MESSAGES: BusinessErrorMap = {
  DAY_OF_WEEK_REQUIRED: "Debes indicar el día de la semana para tareas semanales o quincenales.",
  TASK_NOT_FOUND: "La tarea no existe o fue eliminada.",
  TASK_INACTIVE: "La tarea está inactiva y no permite nuevas operaciones.",
  MEMBER_NOT_FOUND: "El miembro seleccionado no existe.",
  DUPLICATE_ASSIGNMENT: "El miembro ya tiene una asignación activa para este caso.",
  OCCURRENCE_CAPACITY_REACHED: "La ocurrencia alcanzó su capacidad máxima de cupos.",
  SLOT_NOT_FOUND: "El slot seleccionado no existe.",
  SLOT_ALREADY_ASSIGNED: "El slot ya tiene una asignación activa.",
  INVALID_TIME_RANGE: "El rango de tiempo no es válido.",
  INVALID_SLOT_DURATION: "La duración del slot no coincide con el rango de tiempo indicado.",
}
