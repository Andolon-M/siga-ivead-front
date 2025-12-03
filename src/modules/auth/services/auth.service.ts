import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
import type { LoginCredentials, RegisterData, AuthResponse, ForgotPasswordData, ResetPasswordData } from "../types"

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    
    const { token, user } = response.data.data
    
    // Guardar token y usuario en localStorage
    this.setToken(token)
    localStorage.setItem("user", JSON.stringify(user))
    
    return response.data.data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    
    const { token, user } = response.data.data
    
    // Guardar token y usuario en localStorage
    this.setToken(token)
    localStorage.setItem("user", JSON.stringify(user))
    
    return response.data.data
  },

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    )
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    )
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  async getMe(): Promise<AuthResponse["user"]> {
    const response = await axiosInstance.get<ApiResponse<AuthResponse["user"]>>(
      API_ENDPOINTS.AUTH.ME
    )
    
    return response.data.data
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  setToken(token: string): void {
    localStorage.setItem("token", token)
  },

  getUser(): AuthResponse["user"] | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}

