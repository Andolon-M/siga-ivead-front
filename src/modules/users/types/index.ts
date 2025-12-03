export type UserStatus = "Activo" | "Inactivo"

export type UserRole = "Administrador" | "Pastor" | "Líder" | "Miembro"

export interface User {
  id: number
  email: string
  role: UserRole
  status: UserStatus
  created: string
  password?: string // Solo para creación
}

export interface CreateUserData {
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserData {
  email?: string
  role?: UserRole
  status?: UserStatus
  password?: string
}

