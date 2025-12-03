export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  avatar?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

