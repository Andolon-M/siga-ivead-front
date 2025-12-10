import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
import type { 
  Member, 
  CreateMemberData, 
  UpdateMemberData, 
  MemberStats,
  PaginatedResponse,
  MemberFilters
} from "../types"

export const membersService = {
  /**
   * Obtener todos los miembros con paginación y filtros
   * o un miembro específico si se proporciona id, dni o userId
   */
  async getMembers(filters?: MemberFilters): Promise<PaginatedResponse<Member> | Member> {
    const params = new URLSearchParams()
    
    if (filters) {
      // Si se proporciona id, dni o userId, retorna un solo miembro
      if (filters.id) params.append("id", filters.id)
      if (filters.dni) params.append("dni", filters.dni)
      if (filters.userId) params.append("userId", filters.userId)
      
      // Filtros adicionales (solo aplican cuando no se busca un miembro específico)
      if (filters.search) params.append("search", filters.search)
      if (filters.status) params.append("status", filters.status)
      if (filters.gender) params.append("gender", filters.gender)
      if (filters.tipo_dni) params.append("tipo_dni", filters.tipo_dni)
      if (filters.page) params.append("page", filters.page.toString())
      if (filters.pageSize) params.append("pageSize", filters.pageSize.toString())
    }
    
    const url = `${API_ENDPOINTS.MEMBERS.LIST}${params.toString() ? `?${params.toString()}` : ""}`
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Member> | Member>>(url)
    return response.data.data
  },

  /**
   * Obtener un miembro por ID
   */
  async getMemberById(id: string): Promise<Member> {
    const response = await axiosInstance.get<ApiResponse<Member>>(
      `${API_ENDPOINTS.MEMBERS.LIST}?id=${id}`
    )
    return response.data.data as Member
  },

  /**
   * Obtener un miembro por DNI
   */
  async getMemberByDni(dni: string): Promise<Member> {
    const response = await axiosInstance.get<ApiResponse<Member>>(
      `${API_ENDPOINTS.MEMBERS.LIST}?dni=${dni}`
    )
    return response.data.data as Member
  },

  /**
   * Obtener un miembro por User ID
   */
  async getMemberByUserId(userId: string): Promise<Member> {
    const response = await axiosInstance.get<ApiResponse<Member>>(
      `${API_ENDPOINTS.MEMBERS.LIST}?userId=${userId}`
    )
    return response.data.data as Member
  },

  /**
   * Obtener estadísticas de miembros
   */
  async getStats(): Promise<MemberStats> {
    const response = await axiosInstance.get<ApiResponse<MemberStats>>(
      API_ENDPOINTS.MEMBERS.STATS
    )
    return response.data.data
  },

  /**
   * Crear un nuevo miembro
   */
  async createMember(data: CreateMemberData): Promise<Member> {
    const response = await axiosInstance.post<ApiResponse<Member>>(
      API_ENDPOINTS.MEMBERS.CREATE,
      data
    )
    return response.data.data
  },

  /**
   * Actualizar un miembro existente
   */
  async updateMember(id: string, data: UpdateMemberData): Promise<Member> {
    const response = await axiosInstance.put<ApiResponse<Member>>(
      API_ENDPOINTS.MEMBERS.UPDATE(id),
      data
    )
    return response.data.data
  },

  /**
   * Eliminar un miembro (soft delete)
   */
  async deleteMember(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.MEMBERS.DELETE(id))
  },
}

