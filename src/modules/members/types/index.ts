// Enums
export type MemberStatus = "ACTIVO" | "ASISTENTE" | "INACTIVO"
export type Gender = "MASCULINO" | "FEMENINO"
export type DocumentType = "CC" | "TI" | "RC" | "PP" | "CE" | "PEP" | "DNI"

// Member interface (según el schema del backend)
export interface Member {
  id: string
  user_id: string
  dni_user: string
  name: string
  last_name: string
  tipo_dni: DocumentType
  birthdate: string
  gender: Gender
  cell: string
  direccion: string
  status: MemberStatus
  created_at: string
  updated_at: string
  user_email: string
  total_ministries: string
  leadership_count: string
  team_count: string
  membership_count: string
  total_events_attended: string
}

// Create member request
export interface CreateMemberData {
  user_id: string
  dni_user: string
  name: string
  last_name: string
  tipo_dni: DocumentType
  birthdate: string
  gender: Gender
  cell: string
  direccion: string
  status?: MemberStatus
}

// Update member request
export interface UpdateMemberData {
  user_id?: string
  dni_user?: string
  name?: string
  last_name?: string
  tipo_dni?: DocumentType
  birthdate?: string
  gender?: Gender
  cell?: string
  direccion?: string
  status?: MemberStatus
}

// Estadísticas de miembros
export interface MemberStats {
  total_members: number
  asistente_count: number
  activo_count: number
  inactivo_count: number
  masculino_count: number
  femenino_count: number
  with_user_count: number
  without_user_count: number
  cc_count: number
  ti_count: number
  rc_count: number
  pp_count: number
  ce_count: number
  pep_count: number
  dni_count: number
}

// Estadísticas detalladas de un miembro
export interface MemberDetailedStats {
  total_ministries: number
  leadership_count: number
  team_count: number
  membership_count: number
  total_events_attended: number
  events_attended: number
  events_registered: number
  events_confirmed: number
  events_absent: number
  events_cancelled: number
}

// Paginación
export interface PaginatedResponse<T> {
  previousPage: number | null
  currentPage: number
  nextPage: number | null
  total: number
  totalPages: number
  limit: number
  data: T[]
}

// Filtros para buscar miembros
export interface MemberFilters {
  id?: string
  dni?: string
  userId?: string
  search?: string
  status?: MemberStatus
  gender?: Gender
  tipo_dni?: DocumentType
  page?: number
  pageSize?: number
}

