// ========== Ministerio (Ministry) ==========

export interface Ministry {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  // Estadísticas del ministerio (cuando se consulta con stats)
  total_members?: number
  leaders_count?: number
  team_count?: number
  members_count?: number
  total_events?: number
}

export interface CreateMinistryRequest {
  name: string
  description?: string
}

export interface UpdateMinistryRequest {
  name?: string
  description?: string
}

// ========== Estadísticas ==========

export interface MinistryStats {
  total_ministries: number
  total_members_in_ministries: number
  total_leaders: number
  total_team_members: number
  total_regular_members: number
  total_events_in_ministries: number
}

export interface MinistryMemberStats {
  total_members: number
  leaders_count: number
  team_count: number
  members_count: number
}

export interface MemberStats {
  total_ministries: number
  leadership_count: number
  team_count: number
  membership_count: number
}

// ========== Miembros de Ministerio ==========

export type MinistryRole = "MIEMBRO" | "EQUIPO" | "LIDER"

export interface MinistryMember {
  id: string
  ministry_id: string
  member_id: string
  role: MinistryRole
  created_at: string
  updated_at: string
  // Datos del miembro asociado
  member_name: string
  member_last_name: string
  dni_user: string
  cell: string
  member_status: "ASISTENTE" | "ACTIVO" | "INACTIVO"
  member_email?: string
}

export interface AddMemberToMinistryRequest {
  memberId: string
  role?: MinistryRole
}

export interface UpdateMemberRoleRequest {
  role: MinistryRole
}

// ========== Ministerios de un Miembro ==========

export interface MemberMinistry {
  id: string
  ministry_id: string
  member_id: string
  role: MinistryRole
  ministry_name: string
  ministry_description: string | null
}

// ========== Filtros y Paginación ==========

export interface MinistryFilters {
  id?: string
  page?: number
  pageSize?: number
}

export interface MinistryMemberFilters {
  ministryId: string
  memberId?: string
  role?: MinistryRole
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  previousPage: number | null
  currentPage: number
  nextPage: number | null
  total: number
  totalPages: number
  limit: number
  data: T[]
}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}
