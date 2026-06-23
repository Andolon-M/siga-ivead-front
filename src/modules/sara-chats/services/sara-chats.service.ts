import { API_ENDPOINTS, axiosInstance, type ApiResponse } from "@/shared/api"
import type { SaraChatsListResponse, SaraChatMessagesResponse } from "../types"

export const saraChatsService = {
  async getChats(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<SaraChatsListResponse> {
    const response = await axiosInstance.get<ApiResponse<SaraChatsListResponse>>(
      API_ENDPOINTS.SARA_ADMIN.CHATS,
      { params }
    )
    return response.data.data
  },

  async getChatMessages(
    chatId: string,
    params?: { page?: number; limit?: number }
  ): Promise<SaraChatMessagesResponse> {
    const response = await axiosInstance.get<ApiResponse<SaraChatMessagesResponse>>(
      API_ENDPOINTS.SARA_ADMIN.CHAT_MESSAGES(chatId),
      { params }
    )
    return response.data.data
  },
}
