import { API_ENDPOINTS, axiosInstance, type ApiResponse } from "@/shared/api"
import type {
  CreateMetaTemplateData,
  MetaTemplate,
  MetaTemplatesListPayload,
  UpdateMetaTemplateData,
} from "../types"

export const metaTemplatesService = {
  async listTemplates(): Promise<MetaTemplatesListPayload> {
    const response = await axiosInstance.get<ApiResponse<MetaTemplatesListPayload>>(
      API_ENDPOINTS.META_TEMPLATES.LIST
    )
    return response.data.data
  },

  async getTemplateById(id: string): Promise<MetaTemplate> {
    const response = await axiosInstance.get<ApiResponse<MetaTemplate>>(
      API_ENDPOINTS.META_TEMPLATES.GET(id)
    )
    return response.data.data
  },

  async createTemplate(payload: CreateMetaTemplateData): Promise<MetaTemplate> {
    const response = await axiosInstance.post<ApiResponse<MetaTemplate>>(
      API_ENDPOINTS.META_TEMPLATES.CREATE,
      payload
    )
    return response.data.data
  },

  async updateTemplate(id: string, payload: UpdateMetaTemplateData): Promise<MetaTemplate> {
    const response = await axiosInstance.put<ApiResponse<MetaTemplate>>(
      API_ENDPOINTS.META_TEMPLATES.UPDATE(id),
      payload
    )
    return response.data.data
  },

  async deleteTemplate(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.META_TEMPLATES.DELETE(id))
  },
}

