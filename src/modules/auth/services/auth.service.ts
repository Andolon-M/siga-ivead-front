import type { LoginCredentials, RegisterData, AuthResponse, ForgotPasswordData, ResetPasswordData } from "../types"

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // TODO: Implementar llamada a API
    console.log("Login:", credentials)
    throw new Error("Not implemented")
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    // TODO: Implementar llamada a API
    console.log("Register:", data)
    throw new Error("Not implemented")
  },

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    // TODO: Implementar llamada a API
    console.log("Forgot password:", data)
    throw new Error("Not implemented")
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    // TODO: Implementar llamada a API
    console.log("Reset password:", data)
    throw new Error("Not implemented")
  },

  async logout(): Promise<void> {
    // TODO: Implementar llamada a API
    localStorage.removeItem("token")
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  setToken(token: string): void {
    localStorage.setItem("token", token)
  },
}

