import type { AxiosError } from "axios"
import { VOLUNTEERS_ERROR_MESSAGES } from "../types"

interface ErrorResponse {
  message?: string
  code?: string
}

export function getVolunteerErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>
  const code = axiosError?.response?.data?.code
  if (code && VOLUNTEERS_ERROR_MESSAGES[code]) {
    return VOLUNTEERS_ERROR_MESSAGES[code]
  }
  return axiosError?.response?.data?.message || fallback
}
