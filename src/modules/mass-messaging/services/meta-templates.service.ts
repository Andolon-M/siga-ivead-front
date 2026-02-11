import { API_ENDPOINTS, axiosInstance, type ApiResponse } from "@/shared/api"
import type { MetaTemplatesListResponse, MetaTemplate } from "../types"

export const metaTemplatesService = {
  async listTemplates(): Promise<MetaTemplate[]> {
    const response = await axiosInstance.get<ApiResponse<MetaTemplatesListResponse>>(
      API_ENDPOINTS.META_TEMPLATES.LIST
    )
    return response.data.data.templates ?? []
  },
}

