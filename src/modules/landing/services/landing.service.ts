import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"

export interface YouTubeVideo {
  id: string
  url: string
  description: string
  name: string
  thumbnail: string
}

/**
 * Obtiene los últimos 10 videos del canal de YouTube.
 * Endpoint público, no requiere autenticación.
 */
export async function getYoutubeVideos(): Promise<YouTubeVideo[]> {
  const { data } = await axiosInstance.get<ApiResponse<YouTubeVideo[]>>(
    API_ENDPOINTS.YOUTUBE.VIDEOS
  )
  return data.data ?? []
}
