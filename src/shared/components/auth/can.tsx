import type { ReactNode } from "react"
import { useAuth } from "@/shared/contexts/auth-context"

export interface CanProps {
  /**
   * Recurso a evaluar (ej: "members", "services", "users")
   */
  resource?: string
  /**
   * Acción a evaluar (ej: "create", "read", "update", "delete", "export")
   */
  action?: string
  /**
   * Evaluar si tiene al menos uno de estos permisos
   */
  anyPermissions?: Array<{ resource: string; action: string }>
  /**
   * Evaluar por nombre de rol específico (ej: "Super Admin", "Administrador")
   */
  role?: string
  /**
   * Contenido que se renderiza si el usuario cuenta con el permiso
   */
  children: ReactNode
  /**
   * Contenido alternativo si no cuenta con el permiso (por defecto null)
   */
  fallback?: ReactNode
}

export function Can({
  resource,
  action,
  anyPermissions,
  role,
  children,
  fallback = null,
}: CanProps) {
  const { hasPermission, hasAnyPermission, hasRole } = useAuth()

  let isAllowed = false

  if (role) {
    isAllowed = hasRole(role)
  } else if (resource && action) {
    isAllowed = hasPermission(resource, action)
  } else if (anyPermissions && anyPermissions.length > 0) {
    isAllowed = hasAnyPermission(anyPermissions)
  }

  if (!isAllowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
