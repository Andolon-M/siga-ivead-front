import { useAuth } from "@/shared/contexts/auth-context"

export function usePermission(resource: string, action: string): boolean {
  const { hasPermission } = useAuth()
  return hasPermission(resource, action)
}

export function useAnyPermission(permissions: { resource: string; action: string }[]): boolean {
  const { hasAnyPermission } = useAuth()
  return hasAnyPermission(permissions)
}

export function useRole(roleName: string): boolean {
  const { hasRole } = useAuth()
  return hasRole(roleName)
}
