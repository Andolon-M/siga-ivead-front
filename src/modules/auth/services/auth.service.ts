import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthMeResponse,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyTokenResponse,
  LoginResult,
  UserSession,
  TwoFactorSetupData,
  TwoFactorEnableResult,
  TwoFactorStatus
} from "../types"

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    
    const data = response.data.data

    if (data.requires2FA) {
      return {
        requires2FA: true,
        challengeToken: data.challengeToken
      }
    }
    
    const token = data.token || ""
    if (token) {
      this.setToken(token)
    }
    
    return {
      requires2FA: false,
      token,
      user: data.user,
      isTrustedDevice: data.isTrustedDevice,
      expiresAt: data.expiresAt
    }
  },

  async verify2FA(challengeToken: string, code: string, trustDevice: boolean = false): Promise<string> {
    const response = await axiosInstance.post<ApiResponse<{ token: string; user: any }>>(
      API_ENDPOINTS.AUTH.TWO_FACTOR_VERIFY,
      { challengeToken, code, trustDevice }
    )

    const token = response.data.data.token
    this.setToken(token)
    return token
  },

  async refreshToken(): Promise<string> {
    const response = await axiosInstance.post<ApiResponse<{ token: string }>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    )

    const token = response.data.data.token
    this.setToken(token)
    return token
  },

  async register(data: RegisterData): Promise<string> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    
    const token = response.data.data.token || ""
    if (token) {
      this.setToken(token)
    }
    
    return token
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

  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    const response = await axiosInstance.get<VerifyTokenResponse>(
      API_ENDPOINTS.AUTH.VERIFY_TOKEN(token)
    )
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      this.clearAuth()
    }
  },

  async getMe(): Promise<AuthMeResponse> {
    const response = await axiosInstance.get<ApiResponse<AuthMeResponse>>(
      API_ENDPOINTS.AUTH.ME
    )
    return response.data.data
  },

  // Gestión de Sesiones
  async getSessions(): Promise<UserSession[]> {
    const response = await axiosInstance.get<ApiResponse<UserSession[]>>(
      API_ENDPOINTS.AUTH.SESSIONS
    )
    return response.data.data || []
  },

  async revokeSession(sessionId: string): Promise<void> {
    await axiosInstance.delete<ApiResponse>(
      API_ENDPOINTS.AUTH.REVOKE_SESSION(sessionId)
    )
  },

  async revokeOtherSessions(): Promise<void> {
    await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.REVOKE_OTHER_SESSIONS
    )
  },

  // Gestión de 2FA
  async setup2FA(): Promise<TwoFactorSetupData> {
    const response = await axiosInstance.post<ApiResponse<TwoFactorSetupData>>(
      API_ENDPOINTS.AUTH.TWO_FACTOR_SETUP
    )
    return response.data.data
  },

  async enable2FA(code: string): Promise<TwoFactorEnableResult> {
    const response = await axiosInstance.post<ApiResponse<TwoFactorEnableResult>>(
      API_ENDPOINTS.AUTH.TWO_FACTOR_ENABLE,
      { code }
    )
    return response.data.data
  },

  async disable2FA(data: { password?: string; code?: string }): Promise<void> {
    await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.TWO_FACTOR_DISABLE,
      data
    )
  },

  async get2FAStatus(): Promise<TwoFactorStatus> {
    const response = await axiosInstance.get<ApiResponse<TwoFactorStatus>>(
      API_ENDPOINTS.AUTH.TWO_FACTOR_STATUS
    )
    return response.data.data
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  setToken(token: string): void {
    localStorage.setItem("token", token)
  },

  clearAuth(): void {
    localStorage.removeItem("token")
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
