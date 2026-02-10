import { API_ENDPOINTS, axiosInstance, type ApiResponse } from "@/shared/api"
import type { CampaignStatusSummary, SendTemplatePayload, SendTemplateResult } from "../types"

export const massMessagingService = {
  async sendTemplate(payload: SendTemplatePayload): Promise<SendTemplateResult> {
    const response = await axiosInstance.post<ApiResponse<SendTemplateResult>>(
      API_ENDPOINTS.MASS_MESSAGING.SEND_TEMPLATE,
      payload
    )
    return response.data.data
  },

  async getRequestStatus(requestId: string): Promise<CampaignStatusSummary> {
    const response = await axiosInstance.get<ApiResponse<CampaignStatusSummary>>(
      API_ENDPOINTS.MASS_MESSAGING.STATUS(requestId)
    )
    return response.data.data
  },
}

