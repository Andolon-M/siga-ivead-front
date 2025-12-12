import { axiosInstance } from "@/shared/api/axios.config"
import { API_ENDPOINTS } from "@/shared/api/enpoints"
import type {
  Ministry,
  CreateMinistryRequest,
  UpdateMinistryRequest,
  MinistryStats,
  MinistryMember,
  MinistryMemberStats,
  MemberStats,
  MemberMinistry,
  AddMemberToMinistryRequest,
  UpdateMemberRoleRequest,
  MinistryFilters,
  MinistryMemberFilters,
  PaginatedResponse,
  ApiResponse,
} from "../types"

export const ministriesService = {
  // ========== CRUD de Ministerios ==========

  /**
   * Obtener ministerios con filtros opcionales
   * @param filters Filtros para la búsqueda
   * @returns Ministerio específico o lista paginada de ministerios
   */
  async getMinistries(
    filters?: MinistryFilters
  ): Promise<Ministry | PaginatedResponse<Ministry>> {
    const params = new URLSearchParams()

    if (filters?.id) params.append("id", filters.id)
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.pageSize) params.append("pageSize", String(filters.pageSize))

    const queryString = params.toString()
    const url = queryString
      ? `${API_ENDPOINTS.MINISTRIES.LIST}?${queryString}`
      : API_ENDPOINTS.MINISTRIES.LIST

    const response = await axiosInstance.get<
      ApiResponse<Ministry | PaginatedResponse<Ministry>>
    >(url)

    return response.data.data
  },

  /**
   * Obtener ministerio por ID
   * @param id ID del ministerio
   * @returns Ministerio específico
   */
  async getMinistryById(id: string): Promise<Ministry> {
    const response = await axiosInstance.get<ApiResponse<Ministry>>(
      `${API_ENDPOINTS.MINISTRIES.LIST}?id=${id}`
    )
    return response.data.data as Ministry
  },

  /**
   * Crear nuevo ministerio
   * @param data Datos del nuevo ministerio
   * @returns Ministerio creado
   */
  async createMinistry(data: CreateMinistryRequest): Promise<Ministry> {
    const response = await axiosInstance.post<ApiResponse<Ministry>>(
      API_ENDPOINTS.MINISTRIES.CREATE,
      data
    )
    return response.data.data
  },

  /**
   * Actualizar ministerio existente
   * @param id ID del ministerio
   * @param data Datos a actualizar
   * @returns Ministerio actualizado
   */
  async updateMinistry(
    id: string,
    data: UpdateMinistryRequest
  ): Promise<Ministry> {
    const response = await axiosInstance.put<ApiResponse<Ministry>>(
      API_ENDPOINTS.MINISTRIES.UPDATE(id),
      data
    )
    return response.data.data
  },

  /**
   * Eliminar ministerio (soft delete)
   * @param id ID del ministerio
   */
  async deleteMinistry(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.MINISTRIES.DELETE(id))
  },

  /**
   * Obtener estadísticas generales de ministerios
   * @returns Estadísticas generales
   */
  async getStats(): Promise<MinistryStats> {
    const response = await axiosInstance.get<ApiResponse<MinistryStats>>(
      API_ENDPOINTS.MINISTRIES.STATS
    )
    return response.data.data
  },

  // ========== Gestión de Miembros de Ministerio ==========

  /**
   * Obtener miembros de un ministerio con filtros opcionales
   * @param filters Filtros para la búsqueda
   * @returns Miembro específico o lista paginada de miembros
   */
  async getMinistryMembers(
    filters: MinistryMemberFilters
  ): Promise<MinistryMember | PaginatedResponse<MinistryMember>> {
    const params = new URLSearchParams()

    if (filters.memberId) params.append("memberId", filters.memberId)
    if (filters.role) params.append("role", filters.role)
    if (filters.page) params.append("page", String(filters.page))
    if (filters.pageSize) params.append("pageSize", String(filters.pageSize))

    const queryString = params.toString()
    const url = queryString
      ? `${API_ENDPOINTS.MINISTRIES.MEMBERS.LIST(filters.ministryId)}?${queryString}`
      : API_ENDPOINTS.MINISTRIES.MEMBERS.LIST(filters.ministryId)

    const response = await axiosInstance.get<
      ApiResponse<MinistryMember | PaginatedResponse<MinistryMember>>
    >(url)

    return response.data.data
  },

  /**
   * Agregar un miembro a un ministerio
   * @param ministryId ID del ministerio
   * @param data Datos del miembro a agregar
   * @returns Miembro agregado
   */
  async addMemberToMinistry(
    ministryId: string,
    data: AddMemberToMinistryRequest
  ): Promise<MinistryMember> {
    const response = await axiosInstance.post<ApiResponse<MinistryMember>>(
      API_ENDPOINTS.MINISTRIES.MEMBERS.ADD(ministryId),
      data
    )
    return response.data.data
  },

  /**
   * Eliminar un miembro de un ministerio
   * @param ministryId ID del ministerio
   * @param memberId ID del miembro
   */
  async removeMemberFromMinistry(
    ministryId: string,
    memberId: string
  ): Promise<void> {
    await axiosInstance.delete(
      API_ENDPOINTS.MINISTRIES.MEMBERS.REMOVE(ministryId, memberId)
    )
  },

  /**
   * Actualizar el rol de un miembro en un ministerio
   * @param ministryId ID del ministerio
   * @param memberId ID del miembro
   * @param data Nuevos datos del rol
   */
  async updateMemberRole(
    ministryId: string,
    memberId: string,
    data: UpdateMemberRoleRequest
  ): Promise<void> {
    await axiosInstance.put(
      API_ENDPOINTS.MINISTRIES.MEMBERS.UPDATE_ROLE(ministryId, memberId),
      data
    )
  },

  /**
   * Obtener estadísticas de miembros de un ministerio
   * @param ministryId ID del ministerio
   * @returns Estadísticas del ministerio
   */
  async getMinistryMemberStats(
    ministryId: string
  ): Promise<MinistryMemberStats> {
    const response = await axiosInstance.get<ApiResponse<MinistryMemberStats>>(
      API_ENDPOINTS.MINISTRIES.MEMBERS.STATS(ministryId)
    )
    return response.data.data
  },

  // ========== Ministerios de un Miembro ==========

  /**
   * Obtener todos los ministerios de un miembro
   * @param memberId ID del miembro
   * @returns Lista de ministerios del miembro
   */
  async getMemberMinistries(memberId: string): Promise<MemberMinistry[]> {
    const response = await axiosInstance.get<ApiResponse<MemberMinistry[]>>(
      API_ENDPOINTS.MINISTRIES.MEMBER_MINISTRIES(memberId)
    )
    return response.data.data
  },

  /**
   * Obtener estadísticas de un miembro
   * @param memberId ID del miembro
   * @returns Estadísticas del miembro
   */
  async getMemberStats(memberId: string): Promise<MemberStats> {
    const response = await axiosInstance.get<ApiResponse<MemberStats>>(
      API_ENDPOINTS.MINISTRIES.MEMBER_STATS(memberId)
    )
    return response.data.data
  },
}
