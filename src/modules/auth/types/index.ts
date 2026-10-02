export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  trustDevice?: boolean
  deviceId?: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface Permission {
  id: string
  resource: string
  action: "create" | "read" | "update" | "delete"
  type: number
}

export interface Role {
  id: string
  name: string
}

export interface User {
  userId: string
  email: string
  role: Role
  permissions: Permission[]
}

export interface AuthResponse {
  token?: string
  requires2FA?: boolean
  challengeToken?: string
  isTrustedDevice?: boolean
  expiresAt?: string
  user?: {
    id: string
    email: string
    roleId: string
  }
}

export interface LoginResult {
  requires2FA: boolean
  challengeToken?: string
  token?: string
  isTrustedDevice?: boolean
  expiresAt?: string
  user?: {
    id: string
    email: string
    roleId: string
  }
}

export interface UserSession {
  id: string
  deviceId: string
  deviceName: string
  browser: string
  os: string
  deviceType: string
  ipAddress: string
  isTrusted: boolean
  lastActive: string
  expiresAt: string
  createdAt: string
  isCurrent: boolean
}

export interface TwoFactorSetupData {
  secret: string
  qrCodeUrl: string
  otpauthUrl: string
}

export interface TwoFactorEnableResult {
  message: string
  backupCodes: string[]
}

export interface TwoFactorStatus {
  isEnabled: boolean
  confirmedAt: string | null
}

export interface AuthMeResponse {
  userId: string
  email: string
  role: Role
  permissions: Permission[]
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyTokenResponse {
  status: number
  valid: boolean
  message: string
}
